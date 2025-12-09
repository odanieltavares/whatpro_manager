/**
 * Provider Factory
 * Creates provider instances from database configuration
 */

import { IWhatsAppProvider } from './base-provider';
import { UazapiProvider } from './uazapi.provider';
import { EvolutionProvider } from './evolution.provider';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/utils/encryption.util';

export interface ProviderConfig {
  provider: string;
  baseUrl: string;
  adminToken: string;
}

export class ProviderFactory {
  /**
   * Get all active provider configs from database
   */
  static async getConfigs(): Promise<ProviderConfig[]> {
    const configs = await prisma.providerConfig.findMany({
      where: { isActive: true },
    });
    
    return configs.map(config => ({
      provider: config.provider,
      baseUrl: config.baseUrl,
      adminToken: decrypt(config.adminToken),
    }));
  }

  /**
   * Find provider configuration by provider name
   */
  static async findConfig(provider: string): Promise<ProviderConfig | null> {
    if (!provider || typeof provider !== 'string') {
      console.error('[ProviderFactory] Invalid provider:', provider);
      return null;
    }

    const providerUpper = provider.toUpperCase();
    
    const config = await prisma.providerConfig.findFirst({
      where: {
        provider: providerUpper,
        isActive: true
      }
    });

    if (!config) {
      console.warn(`[ProviderFactory] No active config found for provider: ${providerUpper}`);
      return null;
    }
    
    return {
      provider: config.provider,
      baseUrl: config.baseUrl,
      adminToken: decrypt(config.adminToken),
    };
  }

  /**
   * Create provider from config
   */
  static create(config: ProviderConfig): IWhatsAppProvider {
    switch (config.provider.toUpperCase()) {
      case 'UAZAPI':
        return new UazapiProvider(config.baseUrl, config.adminToken);
      
      case 'EVOLUTION':
        return new EvolutionProvider(config.baseUrl, config.adminToken);
      
      default:
        throw new Error(`Provider ${config.provider} not supported`);
    }
  }

  /**
   * Create provider by name using database config
   */
  static async createByName(providerName: string): Promise<IWhatsAppProvider> {
    const config = await this.findConfig(providerName);
    
    if (!config) {
      throw new Error(`Provider ${providerName} not found in database`);
    }
    
    return this.create(config);
  }

  /**
   * Create all configured providers
   */
  static async createAll(): Promise<Map<string, IWhatsAppProvider>> {
    const configs = await this.getConfigs();
    const providers = new Map<string, IWhatsAppProvider>();
    
    for (const config of configs) {
      providers.set(config.provider, this.create(config));
    }
    
    return providers;
  }
}
