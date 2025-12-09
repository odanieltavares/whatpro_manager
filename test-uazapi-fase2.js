/**
 * Script de Teste UAZ API - Fase 2
 * Baseado nos resultados da Fase 1
 */

const BASE_URL = 'https://whatpro.uazapi.com';
const ADMIN_TOKEN = '8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H';

async function testEndpoint(name, endpoint, options = {}) {
  console.log(`\n📡 ${name}`);
  console.log(`   ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ADMIN_TOKEN,  // Tentar como apikey também
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

    console.log(`   ✅ ${response.status} ${response.statusText}`);
    console.log('   ', JSON.stringify(data, null, 2).split('\n').join('\n    '));
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`   ❌ Erro:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🔍 UAZ API - Fase 2: Endpoints Administrativos\n');

  // Sabemos que /status funciona, vamos explorá-lo mais
  console.log('═'.repeat(60));
  console.log('📊 STATUS E INFORMAÇÕES DO SERVIDOR');
  console.log('═'.repeat(60));

  await testEndpoint(
    'Status Geral',
    `${BASE_URL}/status`
  );

  // Tentar variações de listagem de instâncias
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 TENTANDO LISTAR INSTÂNCIAS');
  console.log('═'.repeat(60));

  const listEndpoints = [
    '/instance/fetchInstances',
    '/instance/list',
    '/fetchInstances',
    '/listInstances',
    '/getAllInstances',
    '/manager/instances',
  ];

  for (const endpoint of listEndpoints) {
    await testEndpoint(
      `Teste: ${endpoint}`,
      `${BASE_URL}${endpoint}`,
      { headers: { 'apikey': ADMIN_TOKEN } }
    );
  }

  // Criar instância com diferentes formatos
  console.log('\n' + '═'.repeat(60));
  console.log('➕ TENTANDO CRIAR INSTÂNCIA');
  console.log('═'.repeat(60));

  const createEndpoints = [
    '/instance/create',
    '/createInstance',
    '/manager/create',
  ];

  for (const endpoint of createEndpoints) {
    await testEndpoint(
      `Criar em: ${endpoint}`,
      `${BASE_URL}${endpoint}`,
      {
        method: 'POST',
        headers: { 'apikey': ADMIN_TOKEN },
        body: {
          instanceName: 'test_whatpro_' + Date.now(),
          token: ADMIN_TOKEN,
          number: '',
          integration: 'WHATSAPP-BAILEYS'
        }
      }
    );
  }

  // Como sabemos que existe a instância "bicimotos_wps", vamos tentar acessá-la
  console.log('\n' + '═'.repeat(60));
  console.log('📱 TESTANDO COM INSTÂNCIA CONHECIDA: bicimotos_wps');
  console.log('═'.repeat(60));

  const instanceName = 'bicimotos_wps';

  await testEndpoint(
    'QR Code da instância',
    `${BASE_URL}/${instanceName}/qrcode`,
    { headers: { 'apikey': ADMIN_TOKEN } }
  );

  await testEndpoint(
    'Status da instância', 
    `${BASE_URL}/${instanceName}/status`,
    { headers: { 'apikey': ADMIN_TOKEN } }
  );

  await testEndpoint(
    'Info da instância',
    `${BASE_URL}/${instanceName}/info`,
    { headers: { 'apikey': ADMIN_TOKEN } }
  );

  await testEndpoint(
    'Conexão da instância',
    `${BASE_URL}/${instanceName}/connect`,
    { method: 'POST', headers: { 'apikey': ADMIN_TOKEN } }
  );

  // Testar endpoints de instância com padrões diferentes
  console.log('\n' + '═'.repeat(60));
  console.log('🔎 OUTROS PADRÕES DE ENDPOINTS');
  console.log('═'.repeat(60));

  await testEndpoint(
    'Instance info (padrão /instance/...)',
    `${BASE_URL}/instance/${instanceName}`,
    { headers: { 'apikey': ADMIN_TOKEN } }
  );

  await testEndpoint(
    'Send message test',
    `${BASE_URL}/${instanceName}/sendText`,
    {
      method: 'POST',
      headers: { 'apikey': ADMIN_TOKEN },
      body: {
        phone: '5511999999999',
        message: 'Test - ignore'
      }
    }
  );

  console.log('\n' + '═'.repeat(60));
  console.log('✅ TESTES FASE 2 CONCLUÍDOS');
  console.log('═'.repeat(60));
}

runTests().catch(console.error);
