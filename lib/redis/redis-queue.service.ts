/**
 * RedisQueueService - Gerenciamento de filas Redis
 * 
 * Baseado em: whatpro-hub-nucleo-motor-redis-retry-dlq.md
 */

import { Redis } from 'ioredis';
import { QueueJob, ExecutionContext } from './types';
import { RedisKeys } from './redis-keys';

const DEFAULT_LOCK_TTL = 30; // 30 segundos
const DEFAULT_CONTEXT_TTL = 3600; // 1 hora

export class RedisQueueService {
  constructor(private readonly redis: Redis) {}

  // ========================================
  // ENFILEIRAR
  // ========================================

  /**
   * Enfileira um job (RPUSH)
   */
  async enqueue(queueKey: string, job: QueueJob): Promise<void> {
    await this.redis.rpush(queueKey, JSON.stringify(job));
  }

  /**
   * Enfileira e tenta adquirir lock
   * Retorna true se conseguiu o lock (= worker deve processar)
   */
  async enqueueAndTryLock(
    queueKey: string,
    lockKey: string,
    job: QueueJob,
    lockTTL: number = DEFAULT_LOCK_TTL
  ): Promise<boolean> {
    // Enfileira
    await this.enqueue(queueKey, job);

    // Tenta adquirir lock
    const lockAcquired = await this.acquireLock(lockKey, lockTTL);
    return lockAcquired;
  }

  // ========================================
  // DESENFILEIRAR
  // ========================================

  /**
   * Remove e retorna o primeiro item da fila (LPOP)
   */
  async dequeue(queueKey: string): Promise<QueueJob | null> {
    const raw = await this.redis.lpop(queueKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as QueueJob;
    } catch (error) {
      console.error('Erro ao parsear job da fila:', error);
      return null;
    }
  }

  /**
   * Desenfileira com bloqueio (BLPOP)
   * Bloqueia por timeoutSec aguardando item
   */
  async dequeueBlocking(
    queueKey: string,
    timeoutSec: number = 5
  ): Promise<QueueJob | null> {
    const res = await this.redis.blpop(queueKey, timeoutSec);
    if (!res) return null;

    const [, value] = res;
    try {
      return JSON.parse(value) as QueueJob;
    } catch (error) {
      console.error('Erro ao parsear job da fila:', error);
      return null;
    }
  }

  // ========================================
  // LOCKS
  // ========================================

  /**
   * Adquirir lock (SET NX EX)
   * Retorna true se conseguiu o lock
   */
  async acquireLock(lockKey: string, ttlSeconds: number = DEFAULT_LOCK_TTL): Promise<boolean> {
    const result = await this.redis.set(
      lockKey,
      'locked',
      'EX',
      ttlSeconds,
      'NX'
    );
    return result === 'OK';
  }

  /**
   * Liberar lock
   */
  async releaseLock(lockKey: string): Promise<void> {
    await this.redis.del(lockKey);
  }

  /**
   * Verificar se lock existe
   */
  async hasLock(lockKey: string): Promise<boolean> {
    const exists = await this.redis.exists(lockKey);
    return exists === 1;
  }

  // ========================================
  // TAMANHO DA FILA
  // ========================================

  /**
   * Retorna quantidade de itens na fila
   */
  async getQueueLength(queueKey: string): Promise<number> {
    return await this.redis.llen(queueKey);
  }

  // ========================================
  // LIMPEZA DE FILA
  // ========================================

  /**
   * Limpa fila completa (principal + retry + DLQ)
   */
  async clearQueue(
    queueKey: string,
    retryKey: string,
    dlqKey: string,
    lockKey: string
  ): Promise<{
    queueCleared: number;
    retryCleared: number;
    dlqCleared: number;
  }> {
    const queueLen = await this.redis.llen(queueKey);
    const retryValue = await this.redis.get(retryKey);
    const dlqLen = await this.redis.llen(dlqKey);

    // Deletar tudo
    await this.redis.del(queueKey);
    await this.redis.del(retryKey);
    await this.redis.del(dlqKey);
    await this.redis.del(lockKey);

    return {
      queueCleared: queueLen,
      retryCleared: retryValue ? parseInt(retryValue) : 0,
      dlqCleared: dlqLen,
    };
  }

  // ========================================
  // RETRIES
  // ========================================

  /**
   * Incrementa contador de retry
   */
  async incrementRetry(retryKey: string): Promise<number> {
    return await this.redis.incr(retryKey);
  }

  /**
   * Obter contador de retry
   */
  async getRetryCount(retryKey: string): Promise<number> {
    const value = await this.redis.get(retryKey);
    return value ? parseInt(value) : 0;
  }

  /**
   * Resetar contador de retry
   */
  async resetRetry(retryKey: string): Promise<void> {
    await this.redis.del(retryKey);
  }

  // ========================================
  // DEAD LETTER QUEUE (DLQ)
  // ========================================

  /**
   * Enviar job para DLQ
   */
  async sendToDLQ(dlqKey: string, job: QueueJob): Promise<void> {
    await this.redis.rpush(dlqKey, JSON.stringify(job));
  }

  /**
   * Listar itens da DLQ (sem remover)
   */
  async listDLQ(dlqKey: string, start: number = 0, end: number = -1): Promise<QueueJob[]> {
    const items = await this.redis.lrange(dlqKey, start, end);
    return items.map(item => {
      try {
        return JSON.parse(item) as QueueJob;
      } catch {
        return null;
      }
    }).filter((job): job is QueueJob => job !== null);
  }

  /**
   * Remover item específico da DLQ
   */
  async removeFromDLQ(dlqKey: string, jobId: string): Promise<boolean> {
    const items = await this.listDLQ(dlqKey);
    const targetJob = items.find(job => job.jobId === jobId);
    
    if (!targetJob) return false;

    const count = await this.redis.lrem(dlqKey, 1, JSON.stringify(targetJob));
    return count > 0;
  }

  // ========================================
  // CONTEXTO DE EXECUÇÃO
  // ========================================

  /**
   * Salvar contexto de execução
   */
  async saveContext(
    executionId: string,
    context: ExecutionContext,
    ttlSeconds: number = DEFAULT_CONTEXT_TTL
  ): Promise<void> {
    const key = RedisKeys.execContext(executionId);
    await this.redis.set(
      key,
      JSON.stringify(context),
      'EX',
      ttlSeconds
    );
  }

  /**
   * Recuperar contexto de execução
   */
  async getContext(executionId: string): Promise<ExecutionContext | null> {
    const key = RedisKeys.execContext(executionId);
    const raw = await this.redis.get(key);
    
    if (!raw) return null;

    try {
      return JSON.parse(raw) as ExecutionContext;
    } catch {
      return null;
    }
  }

  /**
   * Deletar contexto de execução
   */
  async deleteContext(executionId: string): Promise<void> {
    const key = RedisKeys.execContext(executionId);
    await this.redis.del(key);
  }

  // ========================================
  // CACHE
  // ========================================

  /**
   * Salvar no cache
   */
  async setCache(key: string, value: any, ttlSeconds: number): Promise<void> {
    await this.redis.set(
      key,
      JSON.stringify(value),
      'EX',
      ttlSeconds
    );
  }

  /**
   * Obter do cache
   */
  async getCache<T = any>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Deletar do cache
   */
  async deleteCache(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
