/**
 * Teste de conectividade real via URL pública ngrok
 * Tenta enviar um evento simulado para o token da Bicimotos
 */

const webhookUrl = 'https://nonreflectively-untradeable-damion.ngrok-free.dev/api/webhooks/uazapi/d751fa1a-0f43-4847-a5f0-6a5f04c00a32';

// Evento simulado
const event = {
  "type": "Message",
  "fromMe": false,
  "body": "Teste de conectividade",
  "instanceName": "bicimotos_wps",
  "token": "d751fa1a-0f43-4847-a5f0-6a5f04c00a32", // Token correto
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "id": "TEST_CONNECTIVITY_" + Date.now()
    }
  }
};

console.log('🧪 Testando rota pública via ngrok...');
console.log(`📡 URL: ${webhookUrl}`);

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'TestScript/1.0',
  },
  body: JSON.stringify(event),
})
  .then(async (response) => {
    console.log(`\n✅ Status HTTP: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log(`📦 Resposta: ${text}`);
    
    if (response.ok) {
        console.log('\n🎉 CONCLUSÃO: O ngrok e o Servidor estão funcionando perfeitamente!');
        console.log('Se este script funcionou, a URL está correta e acessível pela internet.');
        console.log('O problema é que a Uazapi NÃO está disparando a requisição.');
    } else {
        console.log('\n❌ ERRO: O servidor rejeitou a conexão.');
    }
  })
  .catch((error) => {
    console.error('\n❌ FALHA NA CONEXÃO:', error.message);
    if (error.cause) console.error('Causa:', error.cause);
  });
