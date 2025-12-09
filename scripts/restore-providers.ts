/**
 * Quick Provider Config Restore
 * Run with: npx tsx scripts/restore-providers.ts
 */

import { PrismaClient } from '@prisma/client';
import { encrypt } from '../lib/utils/encryption.util';

const prisma = new PrismaClient();

async function restoreProviders() {
  console.log('🔄 Restoring provider configurations...\n');

  try {
    // Evolution API Config
    const evolutionToken = 'B6D711FCDE4D4FD5936544120E713976';
    const evolutionEncrypted = encrypt(evolutionToken);

    const evolution = await prisma.providerConfig.upsert({
      where: {
        provider_baseUrl: {
          provider: 'EVOLUTION',
          baseUrl: 'https://evo.whatpro.com.br'
        }
      },
      update: {
        adminToken: evolutionEncrypted,
        isActive: true
      },
      create: {
        provider: 'EVOLUTION',
        baseUrl: 'https://evo.whatpro.com.br',
        adminToken: evolutionEncrypted,
        isActive: true
      }
    });

    console.log('✅ Evolution API');
    console.log(`   ${evolution.baseUrl}`);

    // Uazapi Config
    const uazapiToken = 'uazapi_hZIEhIxOcDGWTGxlGTMJQJPUWRXXXXXX';
    const uazapiEncrypted = encrypt(uazapiToken);

    const uazapi = await prisma.providerConfig.upsert({
      where: {
        provider_baseUrl: {
          provider: 'UAZAPI',
          baseUrl: 'https://whatpro.uazapi.com'
        }
      },
      update: {
        adminToken: uazapiEncrypted,
        isActive: true
      },
      create: {
        provider: 'UAZAPI',
        baseUrl: 'https://whatpro.uazapi.com',
        adminToken: uazapiEncrypted,
        isActive: true
      }
    });

    console.log('✅ Uazapi');
    console.log(`   ${uazapi.baseUrl}`);

    console.log('\n✅ Providers restored! Tokens encrypted in database.');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restoreProviders();
