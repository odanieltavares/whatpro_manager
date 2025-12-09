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
      await prisma.providerConfig.update({
        where: {
          provider_baseUrl: {
            provider: 'EVOLUTION',
            baseUrl: 'https://evo.whatpro.com.br'
          }
        },
        data: {
          adminToken: encrypted
        }
      });
      console.log('✅ Evolution token updated\n');
    }

    // Uazapi token
    const uazapiToken = await question('Uazapi Admin Token: ');
    if (uazapiToken.trim()) {
      const encrypted = encrypt(uazapiToken.trim());
      await prisma.providerConfig.update({
        where: {
          provider_baseUrl: {
            provider: 'UAZAPI',
            baseUrl: 'https://whatpro.uazapi.com'
          }
        },
        data: {
          adminToken: encrypted
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
