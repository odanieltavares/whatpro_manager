import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UazapiProvider } from '@/lib/providers/uazapi.provider';
import { ProviderFactory } from '@/lib/providers/factory';

/**
 * GET /api/instances/:id/status - Get instance status (Global Access)
 * Busca status real-time da instância
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const instance = await prisma.instance.findUnique({
      where: { id },
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    const providerName = instance.provider.toLowerCase();

    if (providerName === 'uazapi') {
      try {
        const config =
          await ProviderFactory.findConfig(instance.provider, instance.baseUrl) ||
          await ProviderFactory.findConfig(instance.provider);
        if (!config) {
          return NextResponse.json(
            { error: 'Provider configuration not found' },
            { status: 500 }
          );
        }

        const provider = new UazapiProvider(config.baseUrl, config.adminToken);
        const statusData = await provider.getStatus(instance.apiToken || '');

        if (statusData.status && statusData.status !== instance.status) {
          await prisma.instance.update({
            where: { id: instance.id },
            data: { status: statusData.status },
          });
        }

        await prisma.instance.update({
          where: { id: instance.id },
          data: {
            status: statusData.status,
            ownerJid: statusData.ownerJid,
            phoneNumber: statusData.phoneNumber,
            profileName: statusData.profileName,
            profilePicUrl: statusData.profilePicUrl,
            isBusiness: statusData.isBusiness,
          },
        });
        return NextResponse.json({
          id: instance.id,
          instanceIdentifier: instance.instanceIdentifier,
          provider: instance.provider,
          status: statusData.status || instance.status,
          profileName: statusData.profileName,
          profilePicUrl: statusData.profilePicUrl,
          isBusiness: statusData.isBusiness,
        });
      } catch (apiError: unknown) {
        console.error('Error fetching status from Uazapi:', apiError);
        return NextResponse.json({
          id: instance.id,
          instanceIdentifier: instance.instanceIdentifier,
          provider: instance.provider,
          status: instance.status,
          error: 'Could not fetch real-time status',
        });
      }
    }

    if (providerName === 'evolution') {
      try {
        const config =
          await ProviderFactory.findConfig(instance.provider, instance.baseUrl) ||
          await ProviderFactory.findConfig(instance.provider);
        if (!config) {
          return NextResponse.json(
            { error: 'Provider configuration not found' },
            { status: 500 }
          );
        }
        const { EvolutionProvider } = await import('@/lib/providers/evolution.provider');
        const provider = new EvolutionProvider(config.baseUrl, config.adminToken);
        const statusData = await provider.getStatus(instance.instanceIdentifier);

        if (statusData.status && statusData.status !== instance.status) {
          await prisma.instance.update({
            where: { id: instance.id },
            data: { status: statusData.status },
          });
        }

        return NextResponse.json({
          id: instance.id,
          instanceIdentifier: instance.instanceIdentifier,
          provider: instance.provider,
          status: statusData.status || instance.status,
          profileName: statusData.profileName,
          profilePicUrl: statusData.profilePicUrl,
          isBusiness: statusData.isBusiness,
          ownerJid: statusData.ownerJid,
        });
      } catch (apiError: unknown) {
        console.error('Error fetching status from Evolution:', apiError);
        return NextResponse.json({
          id: instance.id,
          instanceIdentifier: instance.instanceIdentifier,
          provider: instance.provider,
          status: instance.status,
          error: 'Could not fetch real-time status (Evolution)',
        });
      }
    }

    return NextResponse.json({
      id: instance.id,
      instanceIdentifier: instance.instanceIdentifier,
      provider: instance.provider,
      status: instance.status,
    });
  } catch (error) {
    console.error('Error getting instance status:', error);
    return NextResponse.json(
      { error: 'Failed to get instance status' },
      { status: 500 }
    );
  }
}
