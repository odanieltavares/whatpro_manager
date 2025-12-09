/**
 * Teste UAZ API - Endpoints Corretos
 * Baseado na documentação oficial uazapi-openapi-spec.yaml
 */

const UAZ_URL = 'https://whatpro.uazapi.com';
const UAZ_ADMIN_TOKEN = '8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H';

const EVO_URL = 'https://evo.whatpro.com.br';
const EVO_GLOBAL_KEY = 'WHATPROB6D711FCD936544120E713976V2';

console.log('🔍 Testando APIs com endpoints e headers corretos\n');

async function api(baseUrl, endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`\n📡 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
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

    const status = response.ok ? '✅' : '❌';
    console.log(`${status} ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      if (Array.isArray(data)) {
        console.log(`   📋 Array com ${data.length} itens`);
        if (data.length > 0) {
          console.log('   Primeiro item:', JSON.stringify(data[0], null, 2).substring(0, 300));
        }
      } else {
        console.log('   Resposta:', JSON.stringify(data, null, 2).substring(0, 500));
      }
    } else {
      console.log('   Erro:', JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`❌ Erro:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testUAZAPI() {
  console.log('═'.repeat(70));
  console.log('🔵 TESTANDO UAZ API GO');
  console.log('═'.repeat(70));

  // 1. Listar TODAS as instâncias (endpoint correto!)
  await api(UAZ_URL, '/instance/all', {
    method: 'GET',
    headers: { 'admintoken': UAZ_ADMIN_TOKEN }
  });

  // 2. Status da instância específica (usando token da instância)
  const BICIMOTOS_TOKEN = 'd751fa1a-0f43-4847-a5f0-6a5f04c00a32';
  await api(UAZ_URL, '/instance/status', {
    method: 'GET',
    headers: { 'token': BICIMOTOS_TOKEN }
  });

  // 3. Status da instância desconectada
  const WHATPRO_DEMO_TOKEN = 'c4d3f378-20bb-4239-9381-0d5a11e00f7d';
  await api(UAZ_URL, '/instance/status', {
    method: 'GET',
    headers: { 'token': WHATPRO_DEMO_TOKEN }
  });

  // 4. Tentar gerar QR Code para a desconectada
  await api(UAZ_URL, '/instance/connect', {
    method: 'POST',
    headers: { 'token': WHATPRO_DEMO_TOKEN },
    body: { instancetoken: WHATPRO_DEMO_TOKEN }
  });

  // 5. Criar nova instância (teste)
  await api(UAZ_URL, '/instance/init', {
    method: 'POST',
    headers: { 'admintoken': UAZ_ADMIN_TOKEN },
    body: {
      name: 'test_manager_' + Date.now(),
      systemName: 'WhatPro Manager'
    }
  });
}

async function testEvolutionAPI() {
  console.log('\n' + '═'.repeat(70));
  console.log('🟢 TESTANDO EVOLUTION API V2');
  console.log('═'.repeat(70));

  // 1. Listar todas as instâncias
  await api(EVO_URL, '/instance/fetchInstances', {
    method: 'GET',
    headers: { 'apikey': EVO_GLOBAL_KEY }
  });

  // 2. Info da API
  await api(EVO_URL, '/instance/settings/', {
    method: 'GET',
    headers: { 'apikey': EVO_GLOBAL_KEY }
  });
}

async function runTests() {
  await testUAZAPI();
  await testEvolutionAPI();

  console.log('\n' + '═'.repeat(70));
  console.log('✅ TESTES CONCLUÍDOS');
  console.log('═'.repeat(70));
  console.log(`
📋 RESUMO:

UAZ API Go:
  🔹 Endpoint correto para listar: /instance/all
  🔹 Header para admin: admintoken
  🔹 Header para instância: token
  🔹 Endpoint para conectar: /instance/connect

Evolution API v2:
  🔹 Endpoint para listar: /instance/fetchInstances
  🔹 Header global: apikey
  `);
}

runTests().catch(console.error);
