/**
 * Debug Script - Verificar Configuração
 * 
 * Execute: node debug-env.js
 */

// Simular o que o Next.js faz com variáveis
console.log('\n🔍 DEBUG - Verificando Configuração\n');

console.log('1. Variáveis de Ambiente:');
console.log('   NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('   NODE_ENV:', process.env.NODE_ENV);

console.log('\n2. O que deveria ser:');
console.log('   NEXT_PUBLIC_API_URL: http://localhost:3001/api');

console.log('\n3. Teste de Conexão:');
console.log('   Backend: http://localhost:3001/api/health');

console.log('\n⚠️  IMPORTANTE:');
console.log('   Se NEXT_PUBLIC_API_URL está undefined,');
console.log('   você precisa REINICIAR o servidor Next.js!');
console.log('   Ctrl+C no terminal do "npm run dev"');
console.log('   E depois: npm run dev novamente');

console.log('\n');
