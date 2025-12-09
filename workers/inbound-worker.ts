/**
 * InboundWorker - Processa fila wa_to_cw (WhatsApp → Chatwoot)
 * 
 * Consumir mensagens da fila, enviar para Chatwoot, salvar mapping
 * 
 * Baseado em: whatpro-hub-bridge-whatsapp-chatwoot.md
 */

import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { RedisQueueService } from '@/lib/redis/redis-queue.service';
import { RetryManager } from '@/lib/redis/retry-manager.service';
import { ChatwootService } from '@/lib/chatwoot/chatwoot.service';
import { EventExecutionService } from '@/lib/events/event-execution.service';
import { QueueJob } from '@/lib/redis/types';

export class InboundWorker {
  private running = false;
  private queueService: RedisQueueService;
  private retryManager: RetryManager;
  private eventExecutionService: EventExecutionService;

  constructor() {
    this.queueService = new RedisQueueService(redis);
    this.eventExecutionService = new EventExecutionService();
    this.retryManager = new RetryManager({
      redis,
      redisQueueService: this.queueService,
      eventExecutionService: this.eventExecutionService,
    });
  }

  /**
   * Iniciar worker
   */
  async start(queueKeys: string[]) {
    this.running = true;
    console.log('[InboundWorker] Iniciado, monitorando filas:', queueKeys);

    // Processar cada fila em paralelo
    const promises = queueKeys.map(queueKey => this.processQueue(queueKey));
    await Promise.all(promises);
  }

  /**
   * Parar worker
   */
  stop() {
    this.running = false;
    console.log('[InboundWorker] Parando...');
  }

  /**
   * Processar uma fila específica
   */
  private async processQueue(queueKey: string) {
    while (this.running) {
      try {
        // Desenfileirar bloqueando por 5 segundos
        const job = await this.queueService.dequeueBlocking(queueKey, 5);

        if (!job) {
          // Nenhuma mensagem, continua loop
          continue;
        }

        console.log('[InboundWorker] Processando job:', job.jobId);

        await this.processJob(queueKey, job);
      } catch (error) {
        console.error('[InboundWorker] Erro no loop:', error);
        // Aguardar um pouco antes de continuar
        await this.sleep(2000);
      }
    }
  }

  /**
   * Processar um job individual
   */
  private async processJob(queueKey: string, job: QueueJob) {
    try {
      // 1. Buscar configuração Chatwoot da instância
      const chatwootConfig = await prisma.instanceChatwootConfig.findUnique({
        where: { instanceId: job.instanceId },
      });

      if (!chatwootConfig) {
        throw new Error(`Configuração Chatwoot não encontrada para instância ${job.instanceId}`);
      }

      // 2. Criar ChatwootService
      const chatwootService = new ChatwootService({
        baseUrl: chatwootConfig.chatwootUrl || '',
        accountId: chatwootConfig.chatwootAccountId || 0,
        apiAccessToken: chatwootConfig.chatwootUserToken || '',
      });

      // 3. Garantir que contato existe
      const contact = await chatwootService.ensureContact({
        phone: job.message.number,
        name: job.message.number, // Pode melhorar pegando nome do perfil WA
      });

      // 4. Criar ContactInbox (vincula contato ao inbox)
      await chatwootService.createContactInbox({
        contactId: contact.id,
        inboxId: job.inboxId,
        sourceId: job.contactKey,
      });

      // 5. Garantir que conversa existe
      const conversation = await chatwootService.ensureConversation({
        inboxId: job.inboxId,
        contactId: contact.id,
        sourceId: job.contactKey,
      });

      // 6. Reabrir conversa se estiver resolvida
      if (conversation.status === 'resolved') {
        await chatwootService.reopenConversation(conversation.id);
      }

      // 7. Enviar mensagem para Chatwoot
      const cwMessage = await chatwootService.createMessageFromWhatsApp({
        conversationId: conversation.id,
        content: job.message.text || '[Mensagem sem texto]',
        messageType: job.message.type,
      });

      console.log('[InboundWorker] Mensagem criada no Chatwoot:', cwMessage.id);

      // 8. Salvar mapping
      await prisma.messageMapping.create({
        data: {
          tenantId: job.tenantId,
          projectId: job.projectId || null,
          instanceId: job.instanceId,
          direction: 'wa_to_cw',
          chatwootMessageId: cwMessage.id,
          waMessageId: job.message.number, // TODO: pegar waMessageId real do job
          stanzaId: null, // TODO: se disponível
          messageType: job.message.type,
          queueKey,
          status: 'sent',
        },
      });

      // 9. Registrar EventExecution como OK
      await this.eventExecutionService.registerExecution({
        direction: 'wa_to_cw',
        tenantId: job.tenantId,
        projectId: job.projectId,
        instanceId: job.instanceId,
        contactKey: job.contactKey,
        queueKey,
        statusFinal: 'ok',
      });

      // 10. Liberar lock
      await this.queueService.releaseLock(job.lockKey || '');

      console.log('[InboundWorker] Job processado com sucesso:', job.jobId);
    } catch (error: any) {
      console.error('[InboundWorker] Erro ao processar job:', error);

      // Usar RetryManager
      await this.retryManager.handleFailure(queueKey, job, error);

      // Liberar lock anyway
      if (job.lockKey) {
        await this.queueService.releaseLock(job.lockKey);
      }
    }
  }

  /**
   * Aguardar (helper)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
