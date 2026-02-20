/**
 * Update Provider Tokens
 * Interactive script to update Evolution and Uazapi tokens
 */

import { PrismaClient } from '@prisma/client';
import { encrypt } from '../lib/utils/encryption.util';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateProviders() {
  console.log('🔐 Provider Token Update\n');
  console.log('Current tokens are returning Unauthorized errors.');
  console.log('Please provide the correct admin tokens:\n');

  try {
    // Evolution token
    const evolutionToken = await question('Evolution API Token (apikey): ');
    if (evolutionToken.trim()) {
      const encrypted = encrypt(evolutionToken.trim());
      await prisma.providerConfig.upsert({
        where: {
          provider_baseUrl: {
            provider: 'Evolution',
            baseUrl: 'https://evo.whatpro.com.br'
          }
        },
        update: {
          adminToken: encrypted
        },
        create: {
          provider: 'Evolution',
          baseUrl: 'https://evo.whatpro.com.br',
          adminToken: encrypted,
          isActive: true
        }
      });
      console.log('✅ Evolution token updated\n');
    }

    // Uazapi token
    const uazapiToken = await question('Uazapi Admin Token: ');
    if (uazapiToken.trim()) {
      const encrypted = encrypt(uazapiToken.trim());
      await prisma.providerConfig.upsert({
        where: {
          provider_baseUrl: {
            provider: 'UazapiGo',
            baseUrl: 'https://whatpro.uazapi.com'
          }
        },
        update: {
          adminToken: encrypted
        },
        create: {
          provider: 'UazapiGo',
          baseUrl: 'https://whatpro.uazapi.com',
          adminToken: encrypted,
          isActive: true
        }
      });
      console.log('✅ Uazapi token updated\n');
    }

    console.log('✅ Tokens updated successfully!');
    console.log('Try syncing again: npm run sync');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

updateProviders();
