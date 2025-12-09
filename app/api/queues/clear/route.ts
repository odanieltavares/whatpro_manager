/**
 * POST /api/queues/clear
 * 
 * Limpar filas de mensagens (queue + retry + DLQ)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type JWTPayload } from '@/lib/auth/middleware';
import { redis } from '@/lib/redis';
import { RedisQueueService } from '@/lib/redis/redis-queue.service';
import { RedisKeys } from '@/lib/redis/redis-keys';
import { ChatwootService } from '@/lib/chatwoot/chatwoot.service';
import { prisma } from '@/lib/prisma';

async function clearQueue(request: NextRequest, user: JWTPayload) {
  try {
    const body = await request.json();
    const { instanceId, contactKey, conversationId } = body;

    if (!instanceId || !contactKey) {
      return NextResponse.json(
        { error: 'instanceId and contactKey are required' },
        { status: 400 }
      );
    }

    // Buscar instância filtrada por tenant
    const instance = await prisma.instance.findFirst({
      where: { 
        id: instanceId,
        tenantId: user.tenantId,
      },
      include: {
        instanceChatwootConfig: true,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    const queueService = new RedisQueueService(redis);

    // Determinar chaves para cw_to_wa
    const accountId = instance.instanceChatwootConfig?.chatwootAccountId || 0;
    const inboxId = instance.instanceChatwootConfig?.inboxId || 0;

    const queueKey = RedisKeys.cwToWaQueue(accountId, inboxId, contactKey);
    const retryKey = RedisKeys.cwToWaRetry(accountId, inboxId, contactKey);
    const dlqKey = RedisKeys.cwToWaDlq(accountId, inboxId, contactKey);
    const lockKey = RedisKeys.cwToWaLock(accountId, inboxId, contactKey);

    // Limpar fila
    const result = await queueService.clearQueue(
      queueKey,
      retryKey,
      dlqKey,
      lockKey
    );

    console.log('[POST /api/queues/clear] Fila limpa:', {
      instanceId,
      contactKey,
      ...result,
    });

    // Registrar EventExecution
    const { EventExecutionService } = await import('@/lib/events/event-execution.service');
    const eventService = new EventExecutionService();

    await eventService.registerExecution({
      direction: 'cw_to_wa',
      tenantId: instance.tenantId,
      projectId: instance.projectId || undefined,
      instanceId,
      contactKey,
      queueKey,
      statusFinal: 'queue_cleared',
    });

    // Se conversationId fornecido, notificar no chat
    if (conversationId && instance.instanceChatwootConfig) {
      try {
        const chatwootService = new ChatwootService({
          baseUrl: instance.instanceChatwootConfig.chatwootUrl || '',
          accountId: instance.instanceChatwootConfig.chatwootAccountId || 0,
          apiAccessToken: instance.instanceChatwootConfig.chatwootUserToken || '',
        });

        await chatwootService.notifyQueueCleared({
          conversationId,
          contactKey,
          queueCleared: result.queueCleared,
          dlqCleared: result.dlqCleared,
        });
      } catch (error) {
        console.error('[POST /api/queues/clear] Erro ao notificar Chatwoot:', error);
      }
    }

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[POST /api/queues/clear] Erro:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(clearQueue);
