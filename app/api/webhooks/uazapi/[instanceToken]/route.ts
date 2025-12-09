/**
 * Webhook Uazapi (WhatsApp → Chatwoot)
 * 
 * Endpoint: POST /api/webhooks/uazapi/[instanceToken]
 * 
 * Baseado em: whatpro-hub-bridge-whatsapp-chatwoot.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { RedisQueueService } from '@/lib/redis/redis-queue.service';
import { RedisKeys } from '@/lib/redis/redis-keys';
import { OutboundMessageDTO, QueueJob, Direction } from '@/lib/redis/types';
import { configService } from '@/lib/config/env.config';

// Tipos de eventos classificados
enum UazapiEventKind {
  INCOMING_MESSAGE = 'INCOMING_MESSAGE',
  MESSAGE_UPDATE = 'MESSAGE_UPDATE',
  CALL_EVENT = 'CALL_EVENT',
  DISCARD = 'DISCARD',
}

interface NormalizedIncomingMessage {
  tenantId: string;
  projectId: string | null;
  instanceId: string;
  fromMe: boolean;
  isGroup: boolean;
  waMessageId: string;
  stanzaId: string | null;
  chatId: string;
  type: string;
  text: string | null;
  mediaUrl: string | null;
  raw: any;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ instanceToken: string }> }
) {
  try {
    const { instanceToken } = await context.params;
    const body = await request.json();

    console.log('[UazapiWebhook] Recebido:', {
      instanceToken,
      eventType: body?.EventType,
    });

    // 1. Lógica para Token Global
    let effectiveToken = instanceToken;
    const globalToken = configService.get('AUTH')?.API_KEY?.GLOBAL;
    const userGlobalToken = '8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H'; // Token específico solicitado

    if (instanceToken === globalToken || instanceToken === userGlobalToken) {
      console.log('[UazapiWebhook] Recebido em Webhook Global/Admin');
      
      // Tentar descobrir a instância alvo pelo body
      if (body?.token) {
        effectiveToken = body.token;
        console.log('[UazapiWebhook] Redirecionando para token do evento:', effectiveToken);
      } else if (body?.instanceName) {
        // Fallback: tentar buscar instância pelo nome (menos performático, mas útil)
        console.log('[UazapiWebhook] Buscando instância pelo nome:', body.instanceName);
        const found = await prisma.instance.findFirst({
          where: { instanceIdentifier: body.instanceName }
        });
        if (found) {
          effectiveToken = found.apiToken;
        }
      }
    }

    // 2. Resolver instância pelo token (efetivo)
    const instance = await resolveInstance(effectiveToken);

    if (!instance) {
      // Se não achou pelo token, loga erro mas retorna 200 para Uazapi não ficar tentando
      console.warn('[UazapiWebhook] Instância não encontrada para token:', effectiveToken);
      return NextResponse.json(
        { error: 'Instance not found', effectiveToken },
        { status: 404 } 
      );
    }

    // 2. Classificar evento
    const eventKind = classifyEvent(body);

    console.log('[UazapiWebhook] Evento classificado:', eventKind);

    if (eventKind === UazapiEventKind.DISCARD) {
      // Evento irrelevante, apenas loga
      return NextResponse.json({ ok: true, action: 'discarded' });
    }

    // 3. Tratar por tipo
    if (eventKind === UazapiEventKind.INCOMING_MESSAGE) {
      await handleIncomingMessage(instance, body);
    } else if (eventKind === UazapiEventKind.MESSAGE_UPDATE) {
      await handleMessageUpdate(instance, body);
    } else if (eventKind === UazapiEventKind.CALL_EVENT) {
      await handleCallEvent(instance, body);
    }

    // Processar mensagem (se necessário)
    // TODO: Reativar quando WhatsAppProviderService estiver implementado
    // const whatsappService = new WhatsAppProviderService();
    // await whatsappService.processInboundMessage(...)

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Uazapi Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// RESOLVER INSTÂNCIA (com cache)
// ========================================

async function resolveInstance(instanceToken: string) {
  const cacheKey = RedisKeys.cacheInstanceByToken(instanceToken);

  // Tentar cache primeiro (TTL: 30 dias)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Buscar no banco
  const instance = await prisma.instance.findFirst({
    where: {
      apiToken: instanceToken,
      status: 'connected',
    },
    include: {
      instanceChatwootConfig: true,
    },
  });

  if (instance) {
    // Salvar no cache
    await redis.set(
      cacheKey,
      JSON.stringify(instance),
      'EX',
      30 * 24 * 60 * 60 // 30 dias
    );
  }

  return instance;
}

// ========================================
// CLASSIFICAR EVENTO
// ========================================

function classifyEvent(body: any): UazapiEventKind {
  const eventType = body?.EventType || body?.type; // Aceitar ambos os formatos
  const updateType = body?.update?.eventType;

  // Mensagens novas de usuário
  if (eventType === 'messages' && body?.message) {
    const wasSentByApi = body.message.wasSentByApi === true;
    if (!wasSentByApi) {
      return UazapiEventKind.INCOMING_MESSAGE;
    }
  }

  // Atualizações de status de mensagem
  if (eventType === 'messages.update' || updateType === 'messageStatus') {
    // Descartar certos tipos
    const state = body?.state;
    const discardStates = [
      'played-self',
      'inactive',
      'sender',
      'peer_msg',
      'retry',
      'FileDownloaded',
    ];

    if (discardStates.includes(state)) {
      return UazapiEventKind.DISCARD;
    }

    return UazapiEventKind.MESSAGE_UPDATE;
  }

  // Chamadas - Aceitar múltiplos formatos da Uazapi
  const eventTypeLower = eventType?.toLowerCase();
  if (eventTypeLower === 'call' || eventTypeLower === 'voip' || eventType === 'Call') {
    return UazapiEventKind.CALL_EVENT;
  }

  // Presença (ignorar por enquanto)
  if (eventType === 'presence') {
    return UazapiEventKind.DISCARD;
  }

  // Outros eventos: descartar
  return UazapiEventKind.DISCARD;
}

// ========================================
// HANDLE INCOMING MESSAGE
// ========================================

async function handleIncomingMessage(instance: any, body: any) {
  const queueService = new RedisQueueService(redis);

  // Normalizar mensagem
  const normalized = normalizeIncomingMessage(instance, body);

  console.log('[UazapiWebhook] Mensagem normalizada:', {
    chatId: normalized.chatId,
    type: normalized.type,
    fromMe: normalized.fromMe,
    isGroup: normalized.isGroup,
  });

  // Se for grupo e groupsIgnore = true, descartar
  if (normalized.isGroup) {
    // TODO: verificar instance_behavior.groupsIgnore
    // Por enquanto, aceita grupos
  }

  // Se fromMe = true (mensagem enviada pelo próprio número), pode descartar
  if (normalized.fromMe) {
    console.log('[UazapiWebhook] Mensagem fromMe, descartando');
    return;
  }

  // Criar job para fila wa_to_cw
  const contactKey = normalized.chatId; // Ex: "5511999999999@c.us"

  const queueKey = RedisKeys.waToCwQueue(
    normalized.tenantId,
    normalized.instanceId,
    contactKey
  );

  const lockKey = RedisKeys.waToCwLock(
    normalized.tenantId,
    normalized.instanceId,
    contactKey
  );

  const job: QueueJob = {
    jobId: uuidv4(),
    direction: 'wa_to_cw' as Direction,
    attempts: 0,
    createdAt: new Date().toISOString(),

    tenantId: normalized.tenantId,
    projectId: normalized.projectId || '',
    instanceId: normalized.instanceId,

    // Campos específicos (serão usados pelo worker)
    chatwootAccountId: instance.instanceChatwootConfig?.chatwootAccountId || 0,
    inboxId: instance.instanceChatwootConfig?.inboxId || 0,
    conversationId: 0, // Será determinado pelo worker
    contactKey,

    message: {
      type: 'text', // Simplificado por enquanto
      number: contactKey.split('@')[0], // Remove o @c.us
      text: normalized.text || '',
    },

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
    console.log('[UazapiWebhook] Lock adquirido, worker pode processar');
    // TODO: Disparar worker (via scheduling ou trigger)
  }

  console.log('[UazapiWebhook] Mensagem enfileirada:', queueKey);
}

// ========================================
// NORMALIZAR MENSAGEM
// ========================================

function normalizeIncomingMessage(
  instance: any,
  body: any
): NormalizedIncomingMessage {
  const msg = body.message || body?.messages?.[0] || {};

  return {
    tenantId: instance.tenantId,
    projectId: instance.projectId,
    instanceId: instance.id,
    fromMe: msg.fromMe === true,
    isGroup: msg.isGroup === true,
    waMessageId: msg.id_with_owner || msg.id || '',
    stanzaId: msg.stanza_id || null,
    chatId: msg.chatId || msg.from || msg.to || '',
    type: msg.type || 'chat',
    text: msg.body || msg.text || msg.caption || null,
    mediaUrl: msg.mediaUrl || null,
    raw: body,
  };
}

// ========================================
// HANDLE MESSAGE UPDATE
// ========================================

async function handleMessageUpdate(instance: any, body: any) {
  try {
    const update = body?.update || {};
    const state = body?.state || update?.status;
    
    // Extrair messageId
    const msg = body?.message || body?.messages?.[0] || update?.message || {};
    const waMessageId = msg.id_with_owner || msg.id || update?.key?.id;

    if (!waMessageId) {
      console.warn('[UazapiWebhook] MESSAGE_UPDATE sem messageId');
      return;
    }

    console.log('[UazapiWebhook] MESSAGE_UPDATE:', {
      waMessageId,
      state,
    });

    // Mapear states do Uazapi para nosso status
    let newStatus: string | null = null;

    if (state === 'sent' || state === 'server_ack') {
      newStatus = 'sent';
    } else if (state === 'delivered') {
      newStatus = 'delivered';
    } else if (state === 'read' || state === 'played') {
      newStatus = 'read';
    } else if (state === 'error' || state === 'failed') {
      newStatus = 'error';
    }

    if (!newStatus) {
      // State não relevante, ignorar
      return;
    }

    // Buscar mapping pelo waMessageId
    const mapping = await prisma.messageMapping.findFirst({
      where: {
        waMessageId,
        instanceId: instance.id,
      },
    });

    if (!mapping) {
      console.warn('[UazapiWebhook] Mapping não encontrado para:', waMessageId);
      return;
    }

    // Atualizar status
    await prisma.messageMapping.update({
      where: { id: mapping.id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    console.log('[UazapiWebhook] Status atualizado:', {
      waMessageId,
      oldStatus: mapping.status,
      newStatus,
    });
  } catch (error) {
    console.error('[UazapiWebhook] Erro ao processar MESSAGE_UPDATE:', error);
  }
}

// ========================================
// HANDLE CALL EVENT
// ========================================

async function handleCallEvent(instance: any, body: any) {
  try {
    console.log('[UazapiWebhook] ========== CALL EVENT DEBUG ==========');
    console.log('[UazapiWebhook] Body completo:', JSON.stringify(body, null, 2));
    
    // A Uazapi envia o evento em diferentes formatos
    const callData = body?.data || body?.event || body;
    
    // Tentar extrair 'from' de múltiplos formatos possíveis
    let from = callData?.from || 
                 callData?.From || 
                 callData?.caller || 
                 callData?.CallCreator ||
                 callData?.CallCreatorAlt;
    
    // Se from for LID, tentar achar o JID (telefone) correspondente
    if (from && from.includes('@lid')) {
      const jidCandidate = callData?.CallCreatorJid || callData?.participant || callData?.jid || callData?.Jid;
      if (jidCandidate && jidCandidate.includes('@s.whatsapp.net')) {
        console.log(`[UazapiWebhook] Substituindo LID (${from}) por JID (${jidCandidate})`);
        from = jidCandidate;
      }
    }
    
    // Tentar extrair 'callId' de múltiplos formatos possíveis
    const callId = callData?.id || 
                   callData?.callId || 
                   callData?.CallID;

    console.log('[UazapiWebhook] callData:', callData);
    console.log('[UazapiWebhook] from:', from);
    console.log('[UazapiWebhook] callId:', callId);

    if (!from) {
      console.warn('[UazapiWebhook] CALL_EVENT sem origem');
      console.warn('[UazapiWebhook] Body keys:', Object.keys(body));
      console.warn('[UazapiWebhook] CallData keys:', Object.keys(callData));
      return;
    }

    // IDEMPOTÊNCIA: Verificar se já processamos este CallID recentemente (60s)
    if (callId) {
      const lockKey = `lock:call_process:${callId}`;
      const isNew = await redis.set(lockKey, '1', 'EX', 60, 'NX');
      
      if (!isNew) {
        console.log(`[UazapiWebhook] ⚠️ CallID ${callId} já processado recentemente. Ignorando evento duplicado.`);
        return;
      }
      console.log(`[UazapiWebhook] 🔒 Lock adquirido para CallID ${callId}`);
    } else {
      console.warn('[UazapiWebhook] ⚠️ Evento sem CallID, risco de processamento duplicado.');
    }

    console.log('[UazapiWebhook] CALL_EVENT recebida de:', from);

    // Buscar behavior da instância
    const behavior = await prisma.instanceBehavior.findUnique({
      where: { instanceId: instance.id },
    });

    console.log('[UazapiWebhook] Behavior encontrado:', behavior ? 'SIM' : 'NÃO');
    console.log('[UazapiWebhook] autoRejectCalls:', behavior?.autoRejectCalls);

    if (!behavior || !behavior.autoRejectCalls) {
      console.log('[UazapiWebhook] CallReject desabilitado para instância');
      return;
    }

    console.log('[UazapiWebhook] CallReject habilitado, rejeitando chamada');

    // Rejeitar chamada via provider
    const { WhatsAppProviderService } = await import('@/lib/whatsapp/whatsapp-provider.service');
    const providerService = new WhatsAppProviderService();

    try {
      await providerService.callReject(instance.id, from, callId);
      console.log('[UazapiWebhook] Chamada rejeitada com sucesso');
    } catch (error) {
      console.error('[UazapiWebhook] Erro ao rejeitar chamada:', error);
    }

    // Se auto-reply habilitado, enfileirar mensagens
    if (behavior.autoReplyCallsEnabled && behavior.autoReplyCallsMessages) {
      const messages = behavior.autoReplyCallsMessages as any[];
      const delays = (behavior.autoReplyCallsDelays as any[]) || [0, 5, 30];

      console.log('[UazapiWebhook] Enfileirando auto-reply messages:', messages.length);

      // Envio direto com delay (solução simplificada para webhook)
      console.log('[UazapiWebhook] Iniciando envio de auto-reply messages:', messages.length);
      
      // Processar em background para não bloquear a resposta do webhook
      (async () => {
        try {
          for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const delaySeconds = delays[i] || 0;
            
            if (delaySeconds > 0) {
              console.log(`[UazapiWebhook] Aguardando delay de ${delaySeconds}s...`);
              await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            }

            console.log(`[UazapiWebhook] Enviando mensagem ${i + 1}: "${msg.text}"`);

            const outboundMessage: OutboundMessageDTO = {
              number: from.replace('@c.us', '').replace('@s.whatsapp.net', ''),
              type: 'text',
              text: msg.text,
            };

            await providerService.sendOutboundMessage(
              outboundMessage,
              {
                tenantId: instance.tenantId,
                instanceId: instance.id,
              }
            );
            
            console.log(`[UazapiWebhook] ✅ Mensagem ${i + 1} enviada com sucesso`);
          }
        } catch (err) {
          console.error('[UazapiWebhook] Erro no processamento de auto-reply (background):', err);
        }
      })();
    }
  } catch (error) {
    console.error('[UazapiWebhook] Erro ao processar CALL_EVENT:', error);
  }
}
