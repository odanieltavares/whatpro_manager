/**
 * RetryManager - Gerenciamento de retries e DLQ
 * 
 * Baseado em: whatpro-hub-nucleo-motor-redis-retry-dlq.md (linhas 245-333)
 */

import { Redis } from 'ioredis';
import { QueueJob, Direction, EventExecutionInput } from './types';
import { RedisQueueService } from './redis-queue.service';
import { RedisKeys } from './redis-keys';

const MAX_ATTEMPTS = 3;

interface RetryManagerDeps {
  redis: Redis;
  redisQueueService: RedisQueueService;
  // EventExecutionService será injetado depois
  eventExecutionService?: any;
  // SystemMessageService será injetado depois
  systemMessageService?: any;
}

export class RetryManager {
  private readonly redis: Redis;
  private readonly queueService: RedisQueueService;
  private readonly eventExecutionService?: any;
  private readonly systemMessageService?: any;

  constructor(deps: RetryManagerDeps) {
    this.redis = deps.redis;
    this.queueService = deps.redisQueueService;
    this.eventExecutionService = deps.eventExecutionService;
    this.systemMessageService = deps.systemMessageService;
  }

  /**
   * Chamado pelo worker quando um job falha
   * 
   * Lógica:
   * 1. Incrementa attempts
   * 2. Se attempts < MAX_ATTEMPTS: re-enfileira
   * 3. Se attempts >= MAX_ATTEMPTS: envia para DLQ + notifica
   */
  async handleFailure(
    queueKey: string,
    job: QueueJob,
    error: Error
  ): Promise<void> {
    const { chatwootAccountId, inboxId, contactKey, direction, tenantId } = job;

    // 1. Incrementa tentativas
    job.attempts = (job.attempts ?? 0) + 1;
    job.lastError = error.message;

    console.warn(
      `[RetryManager] Falha no job ${job.jobId} (fila: ${queueKey}), tentativa ${job.attempts}/${MAX_ATTEMPTS}`
    );

    // 2. Determinar chaves
    let retryKey: string;
    let dlqKey: string;

    if (direction === 'cw_to_wa') {
      retryKey = RedisKeys.cwToWaRetry(chatwootAccountId, inboxId, contactKey);
      dlqKey = RedisKeys.cwToWaDlq(chatwootAccountId, inboxId, contactKey);
    } else {
      // wa_to_cw
      retryKey = RedisKeys.waToCwRetry(tenantId, job.instanceId, contactKey);
      dlqKey = RedisKeys.waToCwDlq(tenantId, job.instanceId, contactKey);
    }

    // 3. Ainda pode tentar novamente?
    if (job.attempts < MAX_ATTEMPTS) {
      // Re-enfileira
      await this.queueService.incrementRetry(retryKey);
      await this.queueService.enqueue(queueKey, job);

      // Registra EventExecution como "retry"
      if (this.eventExecutionService) {
        await this.eventExecutionService.registerExecution({
          direction,
          tenantId,
          projectId: job.projectId,
          instanceId: job.instanceId,
          contactKey,
          queueKey,
          statusFinal: 'retry',
          errorSummary: error.message,
        } as EventExecutionInput);
      }

      console.log(`[RetryManager] Job ${job.jobId} re-enfileirado para retry`);
      return;
    }

    // 4. Estourou limite → DLQ
    await this.queueService.sendToDLQ(dlqKey, job);

    // Registra EventExecution como "error"
    if (this.eventExecutionService) {
      await this.eventExecutionService.registerExecution({
        direction,
        tenantId,
        projectId: job.projectId,
        instanceId: job.instanceId,
        contactKey,
        queueKey,
        statusFinal: 'error',
        errorSummary: error.message,
      } as EventExecutionInput);
    }

    // Notificar agente no Chatwoot
    if (this.systemMessageService) {
      await this.systemMessageService.notifySendFailure(job, error);
    }

    console.error(`[RetryManager] Job ${job.jobId} enviado para DLQ após ${job.attempts} tentativas`);
  }

  /**
   * Reprocessar mensagens da DLQ
   * Move itens da DLQ de volta para fila principal
   */
  async retryDLQ(
    dlqKey: string,
    queueKey: string,
    maxItemsToRetry: number = 10
  ): Promise<number> {
    const dlqItems = await this.queueService.listDLQ(dlqKey, 0, maxItemsToRetry - 1);
    
    let requeued = 0;

    for (const job of dlqItems) {
      // Reset attempts
      job.attempts = 0;
      job.lastError = undefined;

      // Re-enfileira
      await this.queueService.enqueue(queueKey, job);

      // Remove da DLQ
      await this.queueService.removeFromDLQ(dlqKey, job.jobId);

      requeued++;
    }

    console.log(`[RetryManager] ${requeued} jobs movidos de DLQ para fila principal`);
    return requeued;
  }

  /**
   * Limpar DLQ completamente
   */
  async clearDLQ(dlqKey: string): Promise<number> {
    const length = await this.redis.llen(dlqKey);
    await this.redis.del(dlqKey);

    console.log(`[RetryManager] DLQ ${dlqKey} limpa (${length} itens removidos)`);
    return length;
  }

  /**
   * Estatísticas de retry
   */
  async getRetryStats(
    accountId: number,
    inboxId: number,
    contactKey: string
  ): Promise<{
    queueLength: number;
    retryCount: number;
    dlqLength: number;
  }> {
    const queueKey = RedisKeys.cwToWaQueue(accountId, inboxId, contactKey);
    const retryKey = RedisKeys.cwToWaRetry(accountId, inboxId, contactKey);
    const dlqKey = RedisKeys.cwToWaDlq(accountId, inboxId, contactKey);

    const [queueLength, retryCount, dlqLength] = await Promise.all([
      this.queueService.getQueueLength(queueKey),
      this.queueService.getRetryCount(retryKey),
      this.queueService.getQueueLength(dlqKey),
    ]);

    return {
      queueLength,
      retryCount,
      dlqLength,
    };
  }
}
