/**
 * Instance Sync Service (Prisma)
 * Lista instâncias nos providers e faz upsert no Postgres via Prisma.
 */

import { prisma } from '@/lib/prisma';
import { ProviderFactory, type ProviderConfig } from '../providers/factory';
import type { InstanceData } from '../providers/base-provider';

export interface SyncResult {
  synced: number;
  created: number;
  updated: number;
  removed: number;
  errors: string[];
}

export class InstanceSyncService {
  async syncAll(tenantId: string = 'tenant-default'): Promise<SyncResult> {
    const configs = await ProviderFactory.getConfigs();

    await this.ensureTenant(tenantId);

    const results: SyncResult = {
      synced: 0,
      created: 0,
      updated: 0,
      removed: 0,
      errors: []
    };

    for (const config of configs) {
      try {
        console.log(`\nSyncing provider: ${config.provider}...`);
        const result = await this.syncProvider(config, tenantId);

        results.synced += result.synced;
        results.created += result.created;
        results.updated += result.updated;
        results.removed += result.removed;

        console.log(
          `✓ ${config.provider}: ${result.created} created, ${result.updated} updated, ${result.removed} removed`
        );
      } catch (error) {
        const errorMsg = `${config.provider}: ${error instanceof Error ? error.message : String(error)}`;
        results.errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
      }
    }

    return results;
  }

  private async ensureTenant(tenantId: string) {
    await prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: {
        id: tenantId,
        name: 'WhatPro Manager',
        slug: 'default',
        status: 'active',
      },
    });
  }

  private async syncProvider(config: ProviderConfig, tenantId: string): Promise<SyncResult> {
    const provider = ProviderFactory.create(config);
    const remoteInstances = await provider.listInstances();

    let created = 0;
    let updated = 0;
    let removed = 0;

    const remoteNames = remoteInstances.map((r) => r.name);

    for (const remote of remoteInstances) {
      try {
        const result = await this.upsertInstance(remote, config, tenantId);
        if (result === 'created') created++;
        else updated++;
      } catch (error) {
        console.error(`Error syncing instance ${remote.name}:`, error);
        throw error;
      }
    }

    // Remover instâncias locais que não existem mais no provider
    const deleteResult = await prisma.instance.deleteMany({
      where: {
        tenantId,
        provider: config.provider,
        instanceIdentifier: { notIn: remoteNames },
      },
    });
    removed = deleteResult.count;

    return {
      synced: remoteInstances.length,
      created,
      updated,
      removed,
      errors: []
    };
  }

  private async upsertInstance(
    remote: InstanceData,
    config: ProviderConfig,
    tenantId: string
  ): Promise<'created' | 'updated'> {
    const baseUrl = config.baseUrl;

    const existing = await prisma.instance.findUnique({
      where: {
        tenantId_instanceIdentifier: {
          tenantId,
          instanceIdentifier: remote.name,
        },
      },
    });

    await prisma.instance.upsert({
      where: {
        tenantId_instanceIdentifier: {
          tenantId,
          instanceIdentifier: remote.name,
        },
      },
      create: {
        tenantId,
        provider: config.provider,
        instanceIdentifier: remote.name,
        baseUrl,
        status: remote.status,
        apiToken: remote.token,
        profileName: remote.profileName,
        profilePicUrl: remote.profilePicUrl,
        phoneNumber: remote.phoneNumber,
        isBusiness: remote.isBusiness ?? false,
        systemName: remote.systemName,
        owner: remote.owner,
        ownerJid: remote.ownerJid,
        integration: remote.integration,
        businessId: remote.businessId,
        lastDisconnect: remote.lastDisconnect ? new Date(remote.lastDisconnect) : null,
        lastDisconnectReason: remote.lastDisconnectReason,
        lastSyncAt: new Date(),
      },
      update: {
        provider: config.provider,
        baseUrl,
        status: remote.status,
        apiToken: remote.token,
        profileName: remote.profileName,
        profilePicUrl: remote.profilePicUrl,
        phoneNumber: remote.phoneNumber,
        isBusiness: remote.isBusiness ?? false,
        systemName: remote.systemName,
        owner: remote.owner,
        ownerJid: remote.ownerJid,
        integration: remote.integration,
        businessId: remote.businessId,
        lastDisconnect: remote.lastDisconnect ? new Date(remote.lastDisconnect) : null,
        lastDisconnectReason: remote.lastDisconnectReason,
        lastSyncAt: new Date(),
      },
    });

    return existing ? 'updated' : 'created';
  }
}
