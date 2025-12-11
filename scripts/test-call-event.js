/**
 * Teste direto do webhook com evento de chamada real
 */

const webhookUrl = 'http://localhost:3001/api/webhooks/uazapi/c4d3f378-20bb-4239-9381-0d5a11e00f7d';

// Evento real capturado da Uazapi
const realCallEvent = {
  "type": "Call",
  "fromMe": false,
  "instanceName": "whatpro_demo",
  "owner": "553172125817",
  "token": "c4d3f378-20bb-4239-9381-0d5a11e00f7d",
  "data": {
    "id": "CALL_TEST_" + Date.now(),
    "from": "5511999999999@c.us",
    "timestamp": Date.now(),
    "status": "ringing",
    "isGroup": false,
    "isVideo": false
  }
};

console.log('🧪 Testando webhook localmente com evento real de chamada...\n');
console.log('📞 Simulando chamada de: 5511999999999@c.us\n');

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'uazapiGO',
  },
  body: JSON.stringify(realCallEvent),
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
      console.log('\n🎉 Webhook processou o evento com sucesso!');
      console.log('💡 Verifique os logs do servidor para ver se a chamada foi rejeitada.');
      console.log('💡 Se não houver logs, o Next.js pode estar em cache.');
      console.log('💡 Tente: touch app/api/webhooks/uazapi/[instanceToken]/route.ts');
    } else {
      console.log('\n❌ Webhook retornou erro!');
    }
  })
  .catch((error) => {
    console.error('\n❌ Erro:', error.message);
  });
