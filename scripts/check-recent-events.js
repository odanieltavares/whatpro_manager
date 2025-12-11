const fs = require('fs');

async function checkRecent() {
  try {
    const res = await fetch('http://localhost:4040/api/requests/http');
    const json = await res.json();
    
    // Filtrar token Bicimotos e últimos 60s
    const start = Date.now() - 60000;
    const matches = json.requests.filter(r => 
      r.request.uri.includes('d751fa1a') && 
      new Date(r.start_ts).getTime() > start
    );

    console.log(`🔍 Recentes (último minuto): ${matches.length}`);

    if (matches.length > 0) {
      const last = matches[0];
      const body = Buffer.from(last.request.raw, 'base64').toString('utf8').split('\r\n\r\n')[1];
      const parsed = JSON.parse(body);
      
      console.log('📦 Tipo do Evento:', parsed.EventType || parsed.type);
      console.log('📅 Timestamp:', new Date(last.start_ts).toLocaleTimeString());
      
      if (parsed.EventType === 'call' || parsed.type === 'Call') {
        console.log('🎉 SUCESSO! É um evento de chamada!');
      } else {
        console.log('⚠️ Ainda recebendo apenas:', parsed.EventType || parsed.type);
      }
    } else {
        console.log('❌ Nada chegou no último minuto. Tente ligar novamente.');
    }
  } catch (e) {
    console.error('Erro:', e.message);
  }
}

checkRecent();
