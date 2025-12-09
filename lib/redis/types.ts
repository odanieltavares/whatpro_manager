/**
 * Tipos para o sistema de filas Redis
 * 
 * Baseado em: whatpro-hub-nucleo-motor-redis-retry-dlq.md
 */

// ========================================
// DIREÇÕES
// ========================================

export type Direction = 'wa_to_cw' | 'cw_to_wa';

// ========================================
// STATUS DE EXECUÇÃO
// ========================================

export type ExecutionStatus = 
  | 'ok'           // Execução bem-sucedida
  | 'error'        // Falhou após estourar tentativas (foi para DLQ)
  | 'retry'        // Falhou, mas foi re-enfileirada
  | 'queue_cleared' // Fila foi limpa manualmente
  | 'dlq';         // Item está na Dead Letter Queue

// ========================================
// TIPOS DE MENSAGEM OUTBOUND
// ========================================

export type OutboundMessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'reaction';

// ========================================
// DTO DE MENSAGEM OUTBOUND (CW → WA)
// ========================================

export interface OutboundMessageDTO {
  type: OutboundMessageType;
  number: string; // "5511999999999"
  text?: string;
  mediaUrl?: string;
  caption?: string;
  
  // Para documents
  mimetype?: string;
  filename?: string;

  // Para reply/reaction
  replyToWaMessageId?: string;
  reactionEmoji?: string;
}

// ========================================
// RESULTADO DE ENVIO PELO PROVIDER
// ========================================

export interface ProviderSendResult {
  waMessageId: string;      // id_with_owner do WhatsApp
  stanzaId?: string;         // stanza_id (quando disponível)
}

// ========================================
// CONTEXTO DE PROVIDER
// ========================================

export interface ProviderContext {
  tenantId: string;
  instanceId: string;
}

// ========================================
// JOB NA FILA
// ========================================

export interface QueueJob {
  // Meta
  jobId: string;            // uuid
  direction: Direction;
  attempts: number;         // tentativas já feitas
  createdAt: string;        // ISO timestamp
  lastError?: string;       // último erro textual

  // Dados de negócio
  tenantId: string;
  projectId: string;
  instanceId: string;

  // Chatwoot
  chatwootAccountId: number;
  inboxId: number;
  conversationId: number;
  contactKey: string; // "5511999999999@c.us"
  chatwootMessageId?: number;

  // Payload da mensagem
  message: OutboundMessageDTO;

  // Chaves Redis (para referência)
  queueKey?: string;
  lockKey?: string;
}

// ========================================
// CONTEXTO DE EXECUÇÃO (REDIS)
// ========================================

export interface ExecutionContext {
  executionId: string;
  direction: Direction;
  tenantId: string;
  projectId: string;
  instanceId: string;
  accountId: number;
  inboxId: number;
  contactKey: string;
  queueKey: string;
  
  // Provider
  provider: string; // "uazapi" | "evolution"
  baseUrl: string;
  apiToken: string; // NUNCA LOGAR!
  
  // Timeouts
  timeout?: number;
  maxAttempts?: number;
}

// ========================================
// CONFIGURAÇÃO DE RETRY
// ========================================

export interface RetryConfig {
  maxAttempts: number;      // Ex: 3
  backoffMs?: number;       // Delay inicial (ex: 1000ms)
  exponential?: boolean;    // Se true, delay dobra a cada tentativa
}

// ========================================
// ENTRADA PARA EVENTOS DE EXECUÇÃO
// ========================================

export interface EventExecutionInput {
  direction: Direction;
  tenantId: string;
  projectId?: string;
  instanceId?: string;
  contactKey?: string;
  queueKey?: string;
  statusFinal: ExecutionStatus;
  errorSummary?: string;
  payloadResumido?: any;
}
