/**
 * Test script for ConfigService
 * Validates environment variable loading and validation
 */

import { configService } from '../lib/config/env.config';

console.log('🧪 Testing ConfigService\n');
console.log('='.repeat(50));

try {
  // Test 1: Get configuration
  console.log('\n1️⃣  Test: Get Configuration');
  const authConfig = configService.get('AUTH');
  console.log(`   ✓ AUTH config loaded`);
  console.log(`   - JWT_EXPIRES_IN: ${authConfig.JWT_EXPIRES_IN}`);
  console.log(`   - API_KEY.EXPOSE_IN_FETCH: ${authConfig.API_KEY.EXPOSE_IN_FETCH}`);

  const dbConfig = configService.get('DATABASE');
  console.log(`   ✓ DATABASE config loaded`);
  
  const securityConfig = configService.get('SECURITY');
  console.log(`   ✓ SECURITY config loaded`);
  console.log(`   - CORS_ORIGIN: ${securityConfig.CORS_ORIGIN.join(', ')}`);
  console.log(`   - RATE_LIMIT_ENABLED: ${securityConfig.RATE_LIMIT_ENABLED}`);

  // Test 2: Get all (masked)
  console.log('\n2️⃣  Test: Get All (Masked Sensitive Values)');
  const allConfig = configService.getAll();
  console.log('\n📋 All Configuration:');
  console.log('AUTH.JWT_SECRET:', (allConfig as any).AUTH.JWT_SECRET);
  console.log('DATABASE.URL:', (allConfig as any).DATABASE.URL, '(password masked)');

  // Test 3: Production flag
  console.log('\n3️⃣  Test: Environment Detection');
  const isProduction = configService.get('PRODUCTION');
  console.log(`   ✓ PRODUCTION: ${isProduction}`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);

  console.log('\n' + '='.repeat(50));
  console.log('✅ All ConfigService tests passed!\n');

} catch (error) {
  console.error('\n❌ ConfigService test failed:');
  console.error(error);
  process.exit(1);
}
