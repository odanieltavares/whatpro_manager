// Simulação via Cloudflare Tunnel
// const fetch = require('node-fetch'); // Native fetch in Node 18+

// URL Global do Cloudflare Tunnel
const url = 'https://manager.local.whatpro.com.br/api/webhooks/uazapi/8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H';

// Payload simulando uma chamada para Bicimotos
const payload = {
  "type": "Call",  // Uazapi usa "Call" ou "call"
  "instanceName": "bicimotos_wps",
  "token": "d751fa1a-0f43-4847-a5f0-6a5f04c00a32", // Token da instância real
  "data": {
    "id": "CF_TEST_CALL_ID_" + Date.now(),
    "from": "5563984560754@s.whatsapp.net", // Número para teste (verifique se é seguro chamar)
    "timestamp": Date.now() / 1000
  }
};

async function testCloudflare() {
  console.log('🚀 Iniciando simulação via Cloudflare Tunnel...');
  console.log(`📡 URL: ${url}`);
  console.log(`📦 Payload (Call Event):`, JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log(`\n✅ Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`📄 Resposta: ${text}`);

    if (res.ok) {
      console.log('\n🎉 SUCESSO! O webhook aceitou o evento via Cloudflare.');
      console.log('👉 Verifique os logs do servidor para confirmar o processamento.');
    } else {
      console.log('❌ FALHA: O servidor rejeitou.');
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testCloudflare();
