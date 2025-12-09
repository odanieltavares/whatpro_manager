/**
 * Provider Configuration Seed Script
 * 
 * Populates the database with provider configurations
 * Run this ONCE after generating secrets and before migration
 * 
 * Usage: npx tsx scripts/seed-providers.ts
 */

import { prisma } from '../lib/prisma';
import { encrypt } from '../lib/utils/encryption.util';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function seedProviders() {
  console.log('🌱 Provider Configuration Seed Script');
  console.log('=====================================\n');
  
  try {
    // Check if providers already exist
    const existingProviders = await prisma.providerConfig.findMany();
    
    if (existingProviders.length > 0) {
      console.log('⚠️  Warning: Provider configurations already exist:');
      existingProviders.forEach(p => {
        console.log(`   - ${p.provider} (${p.baseUrl})`);
      });
      console.log('');
      
      const answer = await question('Do you want to update them? (yes/no): ');
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Seed cancelled');
        rl.close();
        return;
      }
      
      // Delete existing providers
      await prisma.providerConfig.deleteMany();
      console.log('✓ Deleted existing providers\n');
    }
    
    console.log('📝 Please provide your provider credentials:\n');
    
    // UAZ API Configuration
    console.log('1️⃣  UAZ API Configuration');
    const uazapiBaseUrl = await question('   Base URL (default: https://whatpro.uazapi.com): ') || 'https://whatpro.uazapi.com';
    const uazapiToken = await question('   Admin Token: ');
    
    if (!uazapiToken) {
      console.log('❌ UAZ API admin token is required');
      rl.close();
      return;
    }
    
    // Evolution API Configuration
    console.log('\n2️⃣  Evolution API Configuration');
    const evolutionBaseUrl = await question('   Base URL (default: https://evo.whatpro.com.br): ') || 'https://evo.whatpro.com.br';
    const evolutionToken = await question('   Admin Token: ');
    
    if (!evolutionToken) {
      console.log('❌ Evolution API admin token is required');
      rl.close();
      return;
    }
    
    console.log('\n🔐 Encrypting tokens...');
    
    // Create providers with encrypted tokens
    const providers = await Promise.all([
      prisma.providerConfig.create({
        data: {
          provider: 'UAZAPI',
          baseUrl: uazapiBaseUrl,
          adminToken: encrypt(uazapiToken),
          isActive: true,
        },
      }),
      prisma.providerConfig.create({
        data: {
          provider: 'EVOLUTION',
          baseUrl: evolutionBaseUrl,
          adminToken: encrypt(evolutionToken),
          isActive: true,
        },
      }),
    ]);
    
    console.log('\n✅ Providers seeded successfully!');
    console.log('================================\n');
    providers.forEach(p => {
      console.log(`✓ ${p.provider}`);
      console.log(`  URL: ${p.baseUrl}`);
      console.log(`  Active: ${p.isActive}`);
      console.log('');
    });
    
    console.log('📝 Next steps:');
    console.log('   1. Run: npx tsx scripts/migrate-encryption.ts (if you have existing instances)');
    console.log('   2. Start your application: npm run dev');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run seed
seedProviders()
  .then(() => {
    console.log('👋 Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
