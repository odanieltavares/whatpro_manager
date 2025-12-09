/**
 * Webhook Chatwoot (Chatwoot → WhatsApp)
 * 
 * Endpoint: POST /api/webhooks/chatwoot
 * 
 * Baseado em: whatpro-hub-bridge-whatsapp-chatwoot.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { RedisQueueService } from '@/lib/redis/redis-queue.service';
import { RedisKeys } from '@/lib/redis/redis-keys';
import { QueueJob, Direction, OutboundMessageDTO } from '@/lib/redis/types';

// Tipos de eventos classificados
enum ChatwootEventKind {
  VALID_OUTGOING_TEXT = 'VALID_OUTGOING_TEXT',
  VALID_OUTGOING_MEDIA = 'VALID_OUTGOING_MEDIA',
  REACTION = 'REACTION',
  SYSTEM_COMMAND = 'SYSTEM_COMMAND',
  DELETED_MESSAGE = 'DELETED_MESSAGE',
  DISCARD = 'DISCARD',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[ChatwootWebhook] Recebido:', {
      event: body?.event,
      accountId: body?.data?.account?.id,
    });

    const event = body?.event;

    // Apenas processar message_created
    if (event !== 'message_created') {
      console.log('[ChatwootWebhook] Evento ignorado:', event);
      return NextResponse.json({ ok: true, action: 'ignored' });
    }

    const message = body?.data?.message;
    const conversation = body?.data?.conversation;
    const accountId = body?.data?.account?.id;
    const inboxId = conversation?.inbox_id;

    if (!message || !conversation || !accountId || !inboxId) {
      console.warn('[ChatwootWebhook] Dados essenciais faltando');
      return NextResponse.json({ ok: true, action: 'invalid_payload' });
    }

    // 1. Ignorar mensagens incoming (vindas do WhatsApp)
    if (message?.message_type === 'incoming') {
      console.log('[ChatwootWebhook] Mensagem incoming ignorada (loop prevention)');
      return NextResponse.json({ ok: true, action: 'loop_prevention' });
    }

    // 2. Verificar se é de agente humano
    const fromAgent = message?.sender_type === 'User';
    if (!fromAgent) {
      console.log('[ChatwootWebhook] Mensagem não é de agente, ignorada');
      return NextResponse.json({ ok: true, action: 'not_from_agent' });
    }

    // 3. Resolver instância a partir de accountId  + inboxId
    const instanceConfig = await resolveInstanceByAccountAndInbox(
      accountId,
      inboxId
    );

    if (!instanceConfig) {
      console.warn(
        `[ChatwootWebhook] Instância não encontrada: accountId=${accountId}, inboxId=${inboxId}`
      );
      return NextResponse.json(
        { error: 'Instance configuration not found' },
        { status: 404 }
      );
    }

    // 4. Classificar mensagem
    const eventKind = classifyMessage(message);

    console.log('[ChatwootWebhook] Classificado como:', eventKind);

    if (eventKind === ChatwootEventKind.DISCARD) {
      return NextResponse.json({ ok: true, action: 'discarded' });
    }

    // 5. Processar comando de sistema
    if (eventKind === ChatwootEventKind.SYSTEM_COMMAND) {
      await handleSystemCommand(message, instanceConfig);
      return NextResponse.json({ ok: true, action: 'system_command' });
    }

    // 6. Processar mensagem normal
    await handleOutgoingMessage(
      message,
      conversation,
      instanceConfig,
      eventKind
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[ChatwootWebhook] Erro:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// RESOLVER INSTÂNCIA POR ACCOUNT + INBOX
// ========================================

async function resolveInstanceByAccountAndInbox(
  accountId: number,
  inboxId: number
) {
  // Buscar configuração
  const config = await prisma.instanceChatwootConfig.findFirst({
    where: {
      chatwootAccountId: accountId,
      inboxId: inboxId,
    },
    include: {
      instance: true,
    },
  });

  return config;
}

// ========================================
// CLASSIFICAR MENSAGEM
// ========================================

function classifyMessage(message: any): ChatwootEventKind {
  const content = message?.content || '';
  const isPrivate = message?.private === true;
  const attachments = message?.attachments || [];

  // Mensagens privadas: sempre descartar
  if (isPrivate) {
    return ChatwootEventKind.DISCARD;
  }

  // Mensagens de sistema (começam com "**SYSTEM:**")
  if (content.startsWith('**SYSTEM:**')) {
    return ChatwootEventKind.DISCARD;
  }

  // Comandos de sistema (começam com ".")
  if (content.startsWith('.')) {
    return ChatwootEventKind.SYSTEM_COMMAND;
  }

  // Reação (reply com apenas um emoji)
  if (message?.in_reply_to && isOnlyEmoji(content)) {
    return ChatwootEventKind.REACTION;
  }

  // Mídia
  if (attachments.length > 0) {
    return ChatwootEventKind.VALID_OUTGOING_MEDIA;
  }

  // Texto puro
  if (content.trim().length > 0) {
    return ChatwootEventKind.VALID_OUTGOING_TEXT;
  }

  // Nada válido
  return ChatwootEventKind.DISCARD;
}

// ========================================
// VERIFICAR SE É APENAS EMOJI
// ========================================

function isOnlyEmoji(text: string): boolean {
  const trimmed = text.trim();
  // Regex simplificado para emojis
  const emojiRegex = /^[\p{Emoji}\u200d]+$/u;
  return emojiRegex.test(trimmed) && trimmed.length <= 10;
}

// ========================================
// HANDLE OUTGOING MESSAGE
// ========================================

async function handleOutgoingMessage(
  message: any,
  conversation: any,
  instanceConfig: any,
  eventKind: ChatwootEventKind
) {
  const queueService = new RedisQueueService(redis);

  // Extrair contact_inbox source_id
  const contactInbox = conversation?.meta?.sender?.additional_attributes?.contact_inbox;
  const sourceId = contactInbox?.source_id || null;
  const phone = sourceId?.split('@')[0] || conversation?.meta?.sender?.phone_number || '';

  if (!phone) {
    console.error('[ChatwootWebhook] Número do contato não encontrado');
    return;
  }

  const contactKey = sourceId || `${phone}@c.us`;

  // Resolver reply mapping (in_reply_to → waMessageId)
  let replyToWaMessageId: string | null = null;
  
  if (message.in_reply_to) {
    const originalMapping = await prisma.messageMapping.findFirst({
      where: {
        chatwootMessageId: message.in_reply_to,
        direction: 'wa_to_cw',
        instanceId: instanceConfig.instanceId,
      },
    });

    if (originalMapping) {
      replyToWaMessageId = originalMapping.waMessageId;
      console.log('[ChatwootWebhook] Reply mapping encontrado:', {
        chatwootMsgId: message.in_reply_to,
        waMsgId: replyToWaMessageId,
      });
    }
  }

  // Construir message DTO
  const outboundMessage = buildOutboundMessageDTO(
    message,
    phone,
    eventKind,
    replyToWaMessageId
  );

  // Criar job para fila cw_to_wa
  const accountId = instanceConfig.chatwootAccountId;
  const inboxId = instanceConfig.inboxId;

  const queueKey = RedisKeys.cwToWaQueue(accountId, inboxId, contactKey);
  const lockKey = RedisKeys.cwToWaLock(accountId, inboxId, contactKey);

  const job: QueueJob = {
    jobId: uuidv4(),
    direction: 'cw_to_wa' as Direction,
    attempts: 0,
    createdAt: new Date().toISOString(),

    tenantId: instanceConfig.tenantId,
    projectId: instanceConfig.projectId || '',
    instanceId: instanceConfig.instanceId,

    chatwootAccountId: accountId,
    inboxId: inboxId,
    conversationId: conversation.id,
    contactKey,
    chatwootMessageId: message.id,

    message: outboundMessage,

    queueKey,
    lockKey,
  };

  // Enfileirar e tentar adquirir lock
  const lockAcquired = await queueService.enqueueAndTryLock(
    queueKey,
    lockKey,
    job,
    30 // TTL do lock: 30s
  );

  if (lockAcquired) {
    console.log('[ChatwootWebhook] Lock adquirido, worker pode processar');
    // TODO: Disparar worker outbound
  }

  console.log('[ChatwootWebhook] Mensagem enfileirada:', queueKey);
}

// ========================================
// BUILD OUTBOUND MESSAGE DTO
// ========================================

function buildOutboundMessageDTO(
  message: any,
  phone: string,
  eventKind: ChatwootEventKind,
  replyToWaMessageId: string | null = null
): OutboundMessageDTO {
  const content = message?.content || '';
  const attachments = message?.attachments || [];

  if (eventKind === ChatwootEventKind.REACTION) {
    return {
      type: 'reaction',
      number: phone,
      reactionEmoji: content.trim(),
      replyToWaMessageId: replyToWaMessageId || undefined,
    };
  }

  if (eventKind === ChatwootEventKind.VALID_OUTGOING_MEDIA && attachments.length > 0) {
    const attachment = attachments[0];
    return {
      type: detectMediaType(attachment.content_type),
      number: phone,
      mediaUrl: attachment.data_url || attachment.download_url,
      caption: content || undefined,
      replyToWaMessageId: replyToWaMessageId || undefined,
    };
  }

  // Texto normal
  return {
    type: 'text',
    number: phone,
    text: content,
    replyToWaMessageId: replyToWaMessageId || undefined,
  };
}

// ========================================
// DETECTAR TIPO DE MÍDIA
// ========================================

function detectMediaType(contentType: string): OutboundMessageDTO['type'] {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('audio/')) return 'audio';
  if (contentType.startsWith('video/')) return 'video';
  return 'document';
}

// ========================================
// HANDLE SYSTEM COMMAND
// ========================================

async function handleSystemCommand(message: any, instanceConfig: any) {
  const content = message?.content || '';

  if (content.startsWith('.flushqueue')) {
    console.log('[ChatwootWebhook] Comando .flushqueue detectado');
    // TODO: Implementar limpeza de fila
    // await queueService.clearQueue(...)
  } else if (content.startsWith('.retry')) {
    console.log('[ChatwootWebhook] Comando .retry detectado');
    // TODO: Implementar retry de DLQ
  } else {
    console.log('[ChatwootWebhook] Comando desconhecido:', content);
  }
}
