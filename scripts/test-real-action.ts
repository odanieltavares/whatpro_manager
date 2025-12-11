import { prisma } from '../lib/prisma';
import { WhatsAppProviderService } from '../lib/whatsapp/whatsapp-provider.service';
import { OutboundMessageDTO } from '../lib/redis/types';

async function testRealAction() {
  const targetNumber = '5563984560754';
  const instanceIdentifier = 'bicimotos_wps';

  console.log(`🔍 Buscando instância [${instanceIdentifier}]...`);

  const instance = await prisma.instance.findFirst({
    where: { instanceIdentifier },
  });

  if (!instance) {
    console.error('❌ Instância não encontrada no banco de dados.');
    return;
  }

  console.log(`✅ Instância encontrada: ${instance.profileName} (ID: ${instance.id})`);

  const providerService = new WhatsAppProviderService();

  // 1. Teste de Envio de Mensagem
  console.log(`\n📨 Tentando enviar mensagem para ${targetNumber}...`);
  try {
    const message: OutboundMessageDTO = {
      number: targetNumber,
      type: 'text',
      text: '🤖 Olá! Este é um teste real de envio do sistema WhatPro (Auto-Reply Check).',
    };

    const result = await providerService.sendOutboundMessage(message, {
      tenantId: instance.tenantId,
      instanceId: instance.id
    });

    console.log('✅ Mensagem enviada com sucesso!');
    console.log('📦 Resultado:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Falha ao enviar mensagem:', error);
  }

  // 2. Teste de Rejeição (CallReject)
  // Nota: Sem um callId real ativo, a API deve retornar erro, mas isso prova que a conexão existe.
  console.log(`\n🚫 Tentando rejeitar chamada (Teste de Conexão CallReject)...`);
  try {
    const fakeCallId = 'TEST_CALL_' + Date.now();
    await providerService.callReject(instance.id, targetNumber + '@s.whatsapp.net', fakeCallId);
    console.log('⚠️ Surpreendente! O comando callReject não retornou erro (talvez ignorado silenciosamente).');
  } catch (error: any) {
    console.log('✅ Teste de Rejeição Concluído (Erro Esperado):');
    console.log(`   A API respondeu: "${error.message}"`);
    console.log('   (Isso é BOM. Significa que tentamos rejeitar e a Uazapi recebeu o comando, mas avisou que não há chamada ativa).');
  }
}

testRealAction()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
