/**
 * Script simples para verificar configuração de CallReject
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCallRejectConfig() {
  console.log('🔍 Verificando configuração de CallReject...\n');

  // 1. Listar todas as instâncias
  const instances = await prisma.instance.findMany({
    select: {
      id: true,
      instanceIdentifier: true,
      status: true,
      provider: true,
      baseUrl: true,
      apiToken: true,
    }
  });

  console.log(`📋 Total de instâncias: ${instances.length}\n`);
  
  if (instances.length === 0) {
    console.error('❌ Nenhuma instância encontrada!');
    return;
  }

  // Mostrar instâncias
  instances.forEach((inst, i) => {
    console.log(`${i + 1}. ${inst.instanceIdentifier}`);
    console.log(`   ID: ${inst.id}`);
    console.log(`   Status: ${inst.status}`);
    console.log(`   Provider: ${inst.provider}`);
    console.log(`   Token: ***${inst.apiToken.slice(-4)}\n`);
  });

  // 2. Verificar behaviors
  console.log('🎯 Verificando Behaviors:\n');
  
  for (const inst of instances) {
    const behavior = await prisma.instanceBehavior.findUnique({
      where: { instanceId: inst.id }
    });

    console.log(`📌 ${inst.instanceIdentifier}:`);
    if (!behavior) {
      console.log('   ❌ Behavior não configurado\n');
    } else {
      console.log(`   autoRejectCalls: ${behavior.autoRejectCalls ? '✅ HABILITADO' : '❌ DESABILITADO'}`);
      console.log(`   autoReplyCallsEnabled: ${behavior.autoReplyCallsEnabled ? '✅ SIM' : '❌ NÃO'}\n`);
    }
  }

  // 3. Verificar webhooks configurados
  console.log('🔗 Verificando Webhooks:\n');
  
  const webhooks = await prisma.webhookConfig.findMany({
    select: {
      id: true,
      instanceId: true,
      url: true,
      enabled: true,
      events: true,
    }
  });

  if (webhooks.length === 0) {
    console.log('   ℹ️  Nenhum webhook configurado\n');
  } else {
    webhooks.forEach(wh => {
      const inst = instances.find(i => i.id === wh.instanceId);
      console.log(`📌 ${inst?.instanceIdentifier || wh.instanceId}:`);
      console.log(`   URL: ${wh.url}`);
      console.log(`   Enabled: ${wh.enabled ? '✅' : '❌'}`);
      console.log(`   Events: ${wh.events || 'N/A'}\n`);
    });
  }

  // 4. URL esperada do webhook
  console.log('🌐 URLs dos Webhooks esperadas:\n');
  instances.forEach(inst => {
    const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/webhooks/uazapi/${inst.apiToken}`;
    console.log(`${inst.instanceIdentifier}:`);
    console.log(`   ${webhookUrl}\n`);
  });

  console.log('💡 Certifique-se de que a Uazapi está configurada para enviar eventos "call" para estas URLs!');

  await prisma.$disconnect();
}

checkCallRejectConfig().catch(console.error);
