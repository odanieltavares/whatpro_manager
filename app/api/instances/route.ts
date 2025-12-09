/**
 * GET /api/instances - Lista instâncias (Prisma)
 * POST /api/instances - Cria nova instância no provider
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProviderFactory } from '@/lib/providers/factory';

export async function GET() {
  try {
    const instances = await prisma.instance.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        behavior: true,
        instanceChatwootConfig: true,
      },
    });

    // Sanitiza tokens e garante camelCase esperado pelo frontend legado
    const sanitized = instances.map((inst) => ({
      id: inst.id,
      tenantId: inst.tenantId,
      projectId: inst.projectId,
      provider: inst.provider,
      instanceIdentifier: inst.instanceIdentifier,
      status: inst.status,
      baseUrl: inst.baseUrl,
      apiToken: undefined,
      createdAt: inst.createdAt,
      updatedAt: inst.updatedAt,
      profileName: inst.profileName,
      profilePicUrl: inst.profilePicUrl,
      phoneNumber: inst.phoneNumber,
      isBusiness: inst.isBusiness,
      systemName: inst.systemName,
      owner: inst.owner,
      ownerJid: inst.ownerJid,
      integration: inst.integration,
      businessId: inst.businessId,
      lastDisconnect: inst.lastDisconnect,
      lastDisconnectReason: inst.lastDisconnectReason,
      lastSyncAt: inst.lastSyncAt,
      project: inst.project || undefined,
      behavior: inst.behavior || undefined,
      instanceChatwootConfig: inst.instanceChatwootConfig || undefined,
    }));

    return NextResponse.json({ instances: sanitized });
  } catch (error) {
    console.error('Error fetching instances (Prisma):', error);
    return NextResponse.json(
      { error: 'Failed to fetch instances', instances: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, name, systemName, adminField01, adminField02 } = body;

    // Validar provider
    if (!provider || !['EVOLUTION', 'UAZAPI'].includes(provider)) {
      return NextResponse.json(
        { error: 'Provider must be EVOLUTION or UAZAPI' },
        { status: 400 }
      );
    }

    // Validar nome
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Instance name is required' },
        { status: 400 }
      );
    }

    // Buscar configuração do provider
    const providerConfig = await ProviderFactory.findConfig(provider);
    if (!providerConfig) {
      return NextResponse.json(
        { error: `Provider ${provider} not configured. Run: npm run update-tokens` },
        { status: 404 }
      );
    }

    // Criar provider instance usando a config
    const providerInstance = ProviderFactory.create(providerConfig);

    // Criar instância no provider
    const instanceData = await providerInstance.createInstance({
      name: name.trim(),
      systemName,
      adminField01,
      adminField02
    });

    // Salvar no banco de dados
    const instance = await prisma.instance.create({
      data: {
        tenantId: 'tenant-default',
        provider,
        instanceIdentifier: instanceData.name,
        status: instanceData.status || 'disconnected',
        baseUrl: providerConfig.baseUrl,
        apiToken: instanceData.token, // Token gerado pelo provider
        profileName: instanceData.profileName,
        profilePicUrl: instanceData.profilePicUrl,
        phoneNumber: instanceData.phoneNumber,
        isBusiness: instanceData.isBusiness || false,
        systemName: systemName || null,
        owner: null,
        ownerJid: instanceData.ownerJid,
        integration: instanceData.integration,
        businessId: instanceData.businessId,
        lastSyncAt: new Date(),
      },
      include: {
        behavior: true,
      }
    });

    // Criar behavior padrão
    if (!instance.behavior) {
      await prisma.instanceBehavior.create({
        data: {
          instanceId: instance.id,
          rejectCall: false,
          groupsIgnore: true,
          alwaysOnline: false,
          readMessages: false,
          readStatus: false,
          syncFullHistory: false,
          timezone: 'America/Sao_Paulo',
        }
      });
    }

    return NextResponse.json({
      id: instance.id,
      tenantId: instance.tenantId,
      provider: instance.provider,
      instanceIdentifier: instance.instanceIdentifier,
      status: instance.status,
      baseUrl: instance.baseUrl,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating instance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create instance',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
