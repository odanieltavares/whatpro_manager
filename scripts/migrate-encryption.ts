/**
 * Database Encryption Migration Script
 * 
 * Encrypts existing sensitive data in the database
 * Run this ONCE after setting up DATABASE_ENCRYPTION_KEY
 * 
 * Usage: npx tsx scripts/migrate-encryption.ts
 */

import { prisma } from '../lib/prisma';
import { encrypt, isEncrypted } from '../lib/utils/encryption.util';

async function migrateEncryption() {
  console.log('🔐 Starting encryption migration...\n');
  
  let totalEncrypted = 0;
  let totalSkipped = 0;
  
  try {
    // 1. Encrypt provider configs
    console.log('📦 Migrating Provider Configs...');
    const providers = await prisma.providerConfig.findMany();
    
    for (const provider of providers) {
      if (isEncrypted(provider.adminToken)) {
        console.log(`   ⏭️  Skipping ${provider.provider} (already encrypted)`);
        totalSkipped++;
        continue;
      }
      
      await prisma.providerConfig.update({
        where: { id: provider.id },
        data: {
          adminToken: encrypt(provider.adminToken),
        },
      });
      console.log(`   ✓ Encrypted ${provider.provider}`);
      totalEncrypted++;
    }
    
    // 2. Encrypt instance tokens
    console.log('\n📱 Migrating Instance Tokens...');
    const instances = await prisma.instance.findMany();
    
    for (const instance of instances) {
      if (isEncrypted(instance.apiToken)) {
        console.log(`   ⏭️  Skipping ${instance.instanceIdentifier} (already encrypted)`);
        totalSkipped++;
        continue;
      }
      
      await prisma.instance.update({
        where: { id: instance.id },
        data: {
          apiToken: encrypt(instance.apiToken),
        },
      });
      console.log(`   ✓ Encrypted ${instance.instanceIdentifier}`);
      totalEncrypted++;
    }
    
    // 3. Encrypt Chatwoot tokens
    console.log('\n💬 Migrating Chatwoot Integrations...');
    const chatwoot = await prisma.chatwootIntegration.findMany();
    
    for (const integration of chatwoot) {
      if (isEncrypted(integration.apiAccessToken)) {
        console.log(`   ⏭️  Skipping account ${integration.accountId} (already encrypted)`);
        totalSkipped++;
        continue;
      }
      
      await prisma.chatwootIntegration.update({
        where: { id: integration.id },
        data: {
          apiAccessToken: encrypt(integration.apiAccessToken),
        },
      });
      console.log(`   ✓ Encrypted account ${integration.accountId}`);
      totalEncrypted++;
    }
    
    // 4. Encrypt Chatwoot config tokens (legacy)
    console.log('\n⚙️  Migrating Instance Chatwoot Configs...');
    const chatwootConfigs = await prisma.instanceChatwootConfig.findMany();
    
    for (const config of chatwootConfigs) {
      if (!config.chatwootUserToken) {
        continue;
      }
      
      if (isEncrypted(config.chatwootUserToken)) {
        console.log(`   ⏭️  Skipping ${config.instanceName || config.id} (already encrypted)`);
        totalSkipped++;
        continue;
      }
      
      await prisma.instanceChatwootConfig.update({
        where: { id: config.id },
        data: {
          chatwootUserToken: encrypt(config.chatwootUserToken),
        },
      });
      console.log(`   ✓ Encrypted ${config.instanceName || config.id}`);
      totalEncrypted++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   - Encrypted: ${totalEncrypted} fields`);
    console.log(`   - Skipped: ${totalSkipped} fields (already encrypted)`);
    console.log(`   - Total processed: ${totalEncrypted + totalSkipped}`);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('   - Keep your DATABASE_ENCRYPTION_KEY safe!');
    console.log('   - Backup your database before running this in production');
    console.log('   - Do NOT change the encryption key after migration');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n⚠️  Database may be in inconsistent state.');
    console.error('   Please restore from backup if needed.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateEncryption()
  .then(() => {
    console.log('👋 Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
