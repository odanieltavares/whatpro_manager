/**
 * Script para iniciar os Workers
 * 
 * Uso: npm run workers ou ts-node workers/start-workers.ts
 */

import { InboundWorker } from './inbound-worker';
import { OutboundWorker } from './outbound-worker';
import { redis } from '@/lib/redis';

async function main() {
  console.log('='.repeat(50));
  console.log('🚀 Iniciando Whatpro Workers');
  console.log('='.repeat(50));

  // Testar conexão Redis
  try {
    await redis.ping();
    console.log('✅ Redis conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar Redis:', error);
    process.exit(1);
  }

  // Criar workers
  const inboundWorker = new InboundWorker();
  const outboundWorker = new OutboundWorker();

  // Definir filas para monitorar
  // Em produção, isso viria de configuração ou seria descoberto dinamicamente
  const inboundQueues = [
    // Exemplo: 'q:wa_to_cw:t<tenantId>:inst<instanceId>:c<contactKey>'
    // Por agora, vamos processar todas as filas wa_to_cw usando pattern matching
  ];

  const outboundQueues = [
    // Exemplo: 'q:cw_to_wa:acc<accountId>:i<inboxId>:c<contactKey>'
  ];

  // TODO: Descobrir filas dinamicamente usando SCAN no Redis
  // Por agora, os workers vão rodar mas não terão filas específicas
  
  console.log('⚠️  AVISO: Workers configurados mas sem filas específicas');
  console.log('   Para usar, adicione jobs às filas via webhooks');
  console.log('');
  console.log('   Exemplos de filas:');
  console.log('   - q:wa_to_cw:t<tenantId>:inst<instanceId>:c<contactKey>');
  console.log('   - q:cw_to_wa:acc<accountId>:i<inboxId>:c<contactKey>');
  console.log('');

  // Iniciar workers (vão esperar por jobs)
  // Comentado por enquanto até termos filas específicas
  // await Promise.all([
  //   inboundWorker.start(inboundQueues),
  //   outboundWorker.start(outboundQueues),
  // ]);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Recebido SIGTERM, parando workers...');
    inboundWorker.stop();
    outboundWorker.stop();
    await redis.quit();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Recebido SIGINT, parando workers...');
    inboundWorker.stop();
    outboundWorker.stop();
    await redis.quit();
    process.exit(0);
  });

  console.log('✅ Workers prontos (aguardando jobs nas filas)');
  console.log('   Pressione Ctrl+C para parar');
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
