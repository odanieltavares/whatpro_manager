/**
 * EventExecutionService - Gerenciamento de logs de execução
 * 
 * Registra todas as execuções de eventos (equivalente às execuções do n8n)
 */

import { prisma } from '@/lib/prisma';
import { EventExecutionInput } from '@/lib/redis/types';

export class EventExecutionService {
  /**
   * Registrar uma execução de evento
   */
  async registerExecution(input: EventExecutionInput): Promise<void> {
    try {
      await prisma.execucaoEvento.create({
        data: {
          tenantId: input.tenantId,
          direction: input.direction,
          instanceId: input.instanceId || null,
          contactId: input.contactKey || null,
          queueKey: input.queueKey || null,
          retries: 0,
          statusFinal: input.statusFinal,
          erroResumido: input.errorSummary || null,
          payloadResumido: input.payloadResumido || null,
        },
      });

      console.log('[EventExecutionService] Execução registrada:', {
        direction: input.direction,
        status: input.statusFinal,
      });
    } catch (error) {
      console.error('[EventExecutionService] Erro ao registrar execução:', error);
    }
  }

  /**
   * Buscar execuções recentes
   */
  async getRecentExecutions(params: {
    tenantId?: string;
    limit?: number;
    direction?: string;
    statusFinal?: string;
  }) {
    const where: any = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.direction) where.direction = params.direction;
    if (params.statusFinal) where.statusFinal = params.statusFinal;

    return await prisma.execucaoEvento.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: params.limit || 50,
    });
  }

  /**
   * Contar execuções por status
   */
  async countByStatus(tenantId?: string, direction?: string) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (direction) where.direction = direction;

    const [ok, error, retry, dlq] = await Promise.all([
      prisma.execucaoEvento.count({ where: { ...where, statusFinal: 'ok' } }),
      prisma.execucaoEvento.count({ where: { ...where, statusFinal: 'error' } }),
      prisma.execucaoEvento.count({ where: { ...where, statusFinal: 'retry' } }),
      prisma.execucaoEvento.count({ where: { ...where, statusFinal: 'dlq' } }),
    ]);

    return { ok, error, retry, dlq };
  }
}
