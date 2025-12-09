/**
 * Quick Provider Config Restore
 * Migrates the hardcoded Evolution and Uazapi configs to database
 */

const { PrismaClient } = require('@prisma/client');
const { encrypt } = require('./lib/utils/encryption.util.ts');

const prisma = new PrismaClient();

async function restoreProviders() {
  console.log('🔄 Restoring provider configurations...\n');

  try {
    // Evolution API Config (from old hardcoded values)
    const evolutionToken = 'B6D711FCDE4D4FD5936544120E713976'; // Your Evolution admin token
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

    console.log('✅ Evolution API configured');
    console.log(`   URL: ${evolution.baseUrl}`);

    // Uazapi Config (from old hardcoded values)
    const uazapiToken = 'uazapi_hZIEhIxOcDGWTGxlGTMJQJPUWRXXXXXX'; // Your Uazapi admin token
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

    console.log('✅ Uazapi configured');
    console.log(`   URL: ${uazapi.baseUrl}`);

    console.log('\n✅ All provider configurations restored!');
    console.log('\n📝 Note: Tokens are now encrypted in the database for security.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restoreProviders()
  .then(() => {
    console.log('\n✅ Done! Providers are ready to use.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
