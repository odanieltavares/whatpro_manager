/**
 * Script de Teste - UAZ API
 * Testar Admin Token vs Instance Token
 */

const BASE_URL = 'https://whatpro.uazapi.com';
const ADMIN_TOKEN = '8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H';

console.log('🔍 Testando UAZ API...\n');
console.log('Base URL:', BASE_URL);
console.log('Admin Token:', ADMIN_TOKEN.substring(0, 20) + '...\n');

// Função auxiliar para fazer requests
async function testEndpoint(name, endpoint, options = {}) {
  console.log(`\n📡 Testando: ${name}`);
  console.log(`   URL: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
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

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log('   Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`   ❌ Erro:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🔑 TESTE 1: ENDPOINTS COM ADMIN TOKEN');
  console.log('='.repeat(60));

  // 1. Listar todas as instâncias (Admin)
  await testEndpoint(
    'Listar Instâncias (Admin)',
    `${BASE_URL}/instances`,
    {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    }
  );

  // 2. Criar nova instância (Admin)
  await testEndpoint(
    'Criar Instância (Admin)',
    `${BASE_URL}/instance/create`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: {
        instanceName: 'test_manager_' + Date.now()
      }
    }
  );

  // 3. Info do servidor
  await testEndpoint(
    'Info do Servidor',
    `${BASE_URL}/server/info`,
    {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    }
  );

  console.log('\n' + '='.repeat(60));
  console.log('📱 TESTE 2: ENDPOINTS DE INSTÂNCIA');
  console.log('='.repeat(60));
  console.log('ℹ️  Nota: Vamos precisar de um instanceToken específico');

  // Vamos tentar com um instance token fictício para ver o erro
  const FAKE_INSTANCE_TOKEN = 'test-token-123';

  // 4. QR Code (Instance)
  await testEndpoint(
    'Gerar QR Code (Instance Token)',
    `${BASE_URL}/instance/qrcode/${FAKE_INSTANCE_TOKEN}`,
    {
      headers: { 'Authorization': `Bearer ${FAKE_INSTANCE_TOKEN}` }
    }
  );

  // 5. Status (Instance)
  await testEndpoint(
    'Status da Instância (Instance Token)',
    `${BASE_URL}/instance/status/${FAKE_INSTANCE_TOKEN}`,
    {
      headers: { 'Authorization': `Bearer ${FAKE_INSTANCE_TOKEN}` }
    }
  );

  console.log('\n' + '='.repeat(60));
  console.log('🔍 TESTE 3: EXPLORANDO ENDPOINTS DISPONÍVEIS');
  console.log('='.repeat(60));

  // Tentar diferentes padrões de endpoints
  const endpointsToTest = [
    '/health',
    '/status',
    '/api/health',
    '/instance',
    '/instances/list',
    '/admin/instances',
  ];

  for (const endpoint of endpointsToTest) {
    await testEndpoint(
      `Explorar: ${endpoint}`,
      `${BASE_URL}${endpoint}`,
      {
        headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
      }
    );
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TESTES CONCLUÍDOS');
  console.log('='.repeat(60));
  console.log('\n💡 Próximos passos:');
  console.log('   1. Verificar quais endpoints funcionaram');
  console.log('   2. Identificar como listar instâncias existentes');
  console.log('   3. Entender estrutura de tokens');
  console.log('   4. Implementar no WhatPro Manager\n');
}

// Executar testes
runTests().catch(console.error);
