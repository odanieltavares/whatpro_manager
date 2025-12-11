/**
 * Monitor avançado - Detecta QUALQUER requisição ao webhook
 */

console.log('🔍 Monitor Avançado Ativo\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📡 Monitorando TODAS as requisições ao ngrok...');
console.log('⏱️  Verificando a cada 1 segundo');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

let lastCount = 0;
let webhookCount = 0;

async function checkNgrok() {
  try {
    const response = await fetch('http://localhost:4040/api/requests/http');
    const data = await response.json();
    
    const currentCount = data.requests?.length || 0;
    
    if (currentCount > lastCount) {
      const newRequests = data.requests.slice(lastCount);
      
      newRequests.forEach(req => {
        const time = new Date().toLocaleTimeString('pt-BR');
        const method = req.request?.method || 'UNKNOWN';
        const uri = req.request?.uri || 'UNKNOWN';
        const status = req.response?.status_code || 'pending';
        
        // Detectar webhooks
        if (uri.includes('/api/webhooks/')) {
          webhookCount++;
          console.log(`\n🎯 [${time}] WEBHOOK DETECTADO! (#${webhookCount})`);
          console.log(`   ${method} ${uri}`);
          console.log(`   Status: ${status}`);
          
          // Tentar mostrar o body
          if (req.request?.raw) {
            try {
              const body = JSON.parse(req.request.raw);
              console.log('   📦 EventType:', body.EventType || body.event || 'N/A');
              console.log('   📦 Data:', JSON.stringify(body.data || body).substring(0, 150));
            } catch (e) {
              console.log('   📦 Body:', req.request.raw.substring(0, 200));
            }
          }
          
          // Mostrar resposta
          if (req.response?.raw) {
            try {
              const resp = JSON.parse(req.response.raw);
              console.log('   ✅ Resposta:', JSON.stringify(resp));
            } catch (e) {
              console.log('   ✅ Resposta:', req.response.raw.substring(0, 100));
            }
          }
          
          console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else if (!uri.startsWith('/_next/') && !uri.includes('.js') && !uri.includes('.css')) {
          // Mostrar outras requisições relevantes (não assets)
          console.log(`[${time}] ${method} ${uri} → ${status}`);
        }
      });
      
      lastCount = currentCount;
    }
  } catch (error) {
    // Ignorar erros
  }
}

// Verificar a cada 1 segundo
const interval = setInterval(checkNgrok, 1000);

// Parar após 5 minutos
setTimeout(() => {
  clearInterval(interval);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n✅ Monitor finalizado`);
  console.log(`📊 Total de webhooks detectados: ${webhookCount}`);
  
  if (webhookCount === 0) {
    console.log('\n⚠️  NENHUM webhook foi detectado!');
    console.log('\n🔍 Próximos passos:');
    console.log('   1. Verifique se o webhook está "enabled" (ativo) na Uazapi');
    console.log('   2. Procure um botão "Testar Webhook" e clique');
    console.log('   3. Tente enviar uma mensagem para a instância (não chamada)');
    console.log('   4. Verifique os logs da Uazapi para ver se há erros');
  } else {
    console.log('\n✅ Webhooks foram detectados com sucesso!');
  }
  
  process.exit(0);
}, 300000); // 5 minutos

console.log('💡 INSTRUÇÕES:');
console.log('');
console.log('1. No painel da Uazapi, procure um botão "Testar Webhook" ou "Send Test"');
console.log('2. Clique nesse botão para enviar um evento de teste');
console.log('3. Ou envie uma MENSAGEM de texto para a instância (não chamada)');
console.log('4. Observe este monitor - qualquer requisição será mostrada aqui');
console.log('');
console.log('⏱️  Monitorando por 5 minutos... (Ctrl+C para parar)');
console.log('');
