/**
 * Script para testar o webhook manualmente
 * Simula um evento de chamada da Uazapi
 */

const instanceToken = process.argv[2] || '***0f7d'; // Token da instância whatpro_demo
const baseUrl = process.argv[3] || 'http://localhost:3001';

const webhookUrl = `${baseUrl}/api/webhooks/uazapi/${instanceToken}`;

// Simular evento de chamada da Uazapi (formato correto)
const callEvent = {
  EventType: 'call', // Campo correto esperado pelo webhook
  instance: {
    id: 'whatpro_demo',
    token: instanceToken,
    status: 'connected',
  },
  data: {
    id: `CALL_${Date.now()}`,
    from: '5511999999999@c.us', // Número que está ligando (formato WhatsApp)
    timestamp: Date.now(),
    status: 'ringing',
    isGroup: false,
    isVideo: false,
  },
};

console.log('🔔 Testando webhook de CallReject...\n');
console.log(`📍 URL: ${webhookUrl}`);
console.log(`📞 Simulando chamada de: ${callEvent.data.from}\n`);

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(callEvent),
})
  .then(async (response) => {
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('📦 Resposta:', JSON.stringify(json, null, 2));
      } catch {
        console.log('📦 Resposta (texto):', text);
      }
    }
    
    if (response.ok) {
      console.log('\n🎉 Webhook respondeu com sucesso!');
      console.log('💡 Verifique os logs do servidor para ver se a chamada foi rejeitada.');
    } else {
      console.log('\n❌ Webhook retornou erro!');
    }
  })
  .catch((error) => {
    console.error('\n❌ Erro ao chamar webhook:', error.message);
    console.log('\n💡 Certifique-se de que o servidor está rodando em', baseUrl);
  });
