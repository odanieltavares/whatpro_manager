/**
 * Script de Teste UAZ API - Fase 3
 * Baseado na Evolution API padrão
 */

const BASE_URL = 'https://whatpro.uazapi.com';
const ADMIN_TOKEN = '8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H';

async function api(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n📡 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ADMIN_TOKEN,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    const status = response.ok ? '✅' : '❌';
    console.log(`${status} ${response.status} - ${JSON.stringify(data).substring(0, 200)}...`);
    
    if (response.ok || response.status === 400 || response.status === 401) {
      console.log('   Resposta completa:', JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`❌ Erro:`, error.message);
    return {success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🔍 UAZ API - Fase 3: Padrão Evolution API\n');

  console.log('═'.repeat(70));
  console.log('🔑 ENDPOINTS ADMINISTRATIVOS (API Key)');
  console.log('═'.repeat(70));

  // Listar instâncias (Evolution API)
  await api('/instance/fetchInstances', {
    method: 'GET',
    headers: { 'apikey': ADMIN_TOKEN }
  });

  // Criar nova instância
  const instanceName = 'whatpro_test_' + Date.now();
  console.log(`\nℹ️  Tentando criar instância: ${instanceName}`);
  
  await api('/instance/create', {
    method: 'POST',
    headers: { 'apikey': ADMIN_TOKEN },
    body: {
      instanceName: instanceName,
      token: '',
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    }
  });

  // Tentar padrões diferentes para listar
  await api('/instance/list', { headers: { 'apikey': ADMIN_TOKEN } });
  
  console.log('\n' + '═'.repeat(70));
  console.log('📱 ENDPOINTS DE INSTÂNCIA ESPECÍFICA');
  console.log('═'.repeat(70));
  
  // Vamos tentar com tokens de instância que possam existir
  // Se criou a instância acima, use esse token
  
  // Tentar endpoints que sabemos existir baseado no /status
  console.log('\nℹ️  Testando com instância conhecida: bicimotos_wps');
  
  // Padrão: /{instanceName}/qrcode
  await api('/message/sendText/bicimotos_wps', {
    method: 'POST',
    headers: { 'apikey': ADMIN_TOKEN },
    body: {
      number: '5511999999999',
      options: {
        delay: 1200,
        presence: 'composing'
      },
      textMessage: {
        text: 'Test'
      }
    }
  });

  // Outros endpoints úteis da Evolution
  console.log('\n' + '═'.repeat(70));
  console.log('🔧 ENDPOINTS DE CONFIGURAÇÃO');
  console.log('═'.repeat(70));

  await api('/instance/connectionState/bicimotos_wps', {
    headers: { 'apikey': ADMIN_TOKEN }
  });

  await api('/instance/connect/bicimotos_wps', {
    headers: { 'apikey': ADMIN_TOKEN }
  });

  // Webhook
  await api('/webhook/find/bicimotos_wps', {
    headers: { 'apikey': ADMIN_TOKEN }
  });

  // Settings
  await api('/settings/find/bicimotos_wps', {
    headers: { 'apikey': ADMIN_TOKEN }
  });

  console.log('\n' + '═'.repeat(70));
  console.log('📋 RESUMO DOS TESTES');
  console.log('═'.repeat(70));
  console.log(`
💡 Próximos passos:
   
1. Se /instance/create funcionou (não 401):
   - Pegue o instanceToken retornado
   - Use esse token para acessar a instância
   
2. Se retornou 401 em criar instância:
   - O token ${ADMIN_TOKEN.substring(0, 20)}... pode NÃO ser um Admin Token
   - Pode ser um Instance Token de uma instância específica
   
3. Para testar teoria do Instance Token:
   - Vamos tentar usar o token como se fosse de uma instância
   - Endpoints: /{instanceName}/* com apikey sendo o token
`);

  // TESTE FINAL: Usar o "admin token" como instance token
  console.log('\n' + '═'.repeat(70));
  console.log('🧪 TESTE: Token fornecido é Instance Token?');
  console.log('═'.repeat(70));

  // Precisamos descobrir o instanceName associado a este token
  // Vamos tentar alguns nomes comuns
  const possibleNames = ['whatpro', 'default', 'main', 'api', 'admin'];
  
  for (const name of possibleNames) {
    console.log(`\n  Tentando instanceName: ${name}`);
    const result = await api(`/instance/connectionState/${name}`, {
      headers: { 'apikey': ADMIN_TOKEN }
    });
    if (result.success) {
      console.log(`  🎯 ENCONTRADO! Instance name: ${name}`);
      break;
    }
  }

  console.log('\n✅ Testes concluídos!\n');
}

runTests().catch(console.error);
