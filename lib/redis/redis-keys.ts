/**
 * RedisKeys - Helper para padrões de chaves Redis
 * 
 * Baseado em: whatpro-hub-nucleo-motor-redis-retry-dlq.md
 * 
 * Convenções:
 * - wa_to_cw = WhatsApp → Chatwoot
 * - cw_to_wa = Chatwoot → WhatsApp
 * - Nunca usar provider (uz/evolution) no nome da chave
 */

export class RedisKeys {
  // ========================================
  // FILAS PRINCIPAIS
  // ========================================

  /**
   * Fila outbound: Chatwoot → WhatsApp
   * Padrão: q:cw_to_wa:acc<accountId>:i<inboxId>:c<contactKey>
   */
  static cwToWaQueue(accountId: number, inboxId: number, contactKey: string): string {
    return `q:cw_to_wa:acc${accountId}:i${inboxId}:c${contactKey}`;
  }

  /**
   * Fila inbound: WhatsApp → Chatwoot
   * Padrão: q:wa_to_cw:t<tenantId>:inst<instanceId>:c<contactKey>
   */
  static waToCwQueue(tenantId: string, instanceId: string, contactKey: string): string {
    return `q:wa_to_cw:t${tenantId}:inst${instanceId}:c${contactKey}`;
  }

  // ========================================
  // LOCKS
  // ========================================

  /**
   * Lock para fila outbound (CW → WA)
   */
  static cwToWaLock(accountId: number, inboxId: number, contactKey: string): string {
    return `lock:cw_to_wa:acc${accountId}:i${inboxId}:c${contactKey}`;
  }

  /**
   * Lock para fila inbound (WA → CW)
   */
  static waToCwLock(tenantId: string, instanceId: string, contactKey: string): string {
    return `lock:wa_to_cw:t${tenantId}:inst${instanceId}:c${contactKey}`;
  }

  // ========================================
  // RETRIES
  // ========================================

  /**
   * Contador de retries para fila outbound
   */
  static cwToWaRetry(accountId: number, inboxId: number, contactKey: string): string {
    return `retry:cw_to_wa:acc${accountId}:i${inboxId}:c${contactKey}`;
  }

  /**
   * Contador de retries para fila inbound
   */
  static waToCwRetry(tenantId: string, instanceId: string, contactKey: string): string {
    return `retry:wa_to_cw:t${tenantId}:inst${instanceId}:c${contactKey}`;
  }

  /**
   * Retry por job específico (alternativa)
   */
  static jobRetry(jobId: string): string {
    return `retry:cw_to_wa:job:${jobId}`;
  }

  // ========================================
  // DEAD LETTER QUEUE (DLQ)
  // ========================================

  /**
   * DLQ para fila outbound
   */
  static cwToWaDlq(accountId: number, inboxId: number, contactKey: string): string {
    return `dlq:cw_to_wa:acc${accountId}:i${inboxId}:c${contactKey}`;
  }

  /**
   * DLQ para fila inbound
   */
  static waToCwDlq(tenantId: string, instanceId: string, contactKey: string): string {
    return `dlq:wa_to_cw:t${tenantId}:inst${instanceId}:c${contactKey}`;
  }

  // ========================================
  // CONTEXTO DE EXECUÇÃO
  // ========================================

  /**
   * Contexto de uma execução
   * Armazena dados extras que o error handler precisa
   */
  static execContext(executionId: string): string {
    return `ctx:exec:${executionId}`;
  }

  // ========================================
  // CACHE
  // ========================================

  /**
   * Cache de instância por token
   * TTL: 30 dias
   */
  static cacheInstanceByToken(token: string): string {
    return `cache:instance:token:${token}`;
  }

  /**
   * Cache de configuração Chatwoot da instância
   * TTL: 30 dias
   */
  static cacheInstanceChatwoot(instanceId: string): string {
    return `cache:instance_chatwoot:inst${instanceId}`;
  }

  // ========================================
  // TIPO DE MENSAGEM
  // ========================================

  /**
   * Tipo de mensagem por waMessageId
   * TTL: 1-2 dias
   */
  static messageType(waMessageId: string): string {
    return `mid:type:${waMessageId}`;
  }

  // ========================================
  // FILA DE PROCESSAMENTO (temporária)
  // ========================================

  /**
   * Fila temporária durante processamento
   * Usado para idempotência e debug
   */
  static processingCwToWa(executionId: string): string {
    return `processing:cw_to_wa:${executionId}`;
  }

  static processingWaToCw(executionId: string): string {
    return `processing:wa_to_cw:${executionId}`;
  }
}
