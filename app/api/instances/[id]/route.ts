/**
 * GET /api/instances/:id - Get instance details (Global Access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: instanceId } = await context.params;

    // Carrega instância e comportamento; cria default se não existir
    let instance = await prisma.instance.findUnique({
      where: { id: instanceId },
      include: {
        behavior: true,
        instanceChatwootConfig: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    if (!instance.behavior) {
      await prisma.instanceBehavior.create({
        data: {
          instanceId,
          rejectCall: false,
          groupsIgnore: true,
          alwaysOnline: false,
          readMessages: false,
          readStatus: false,
          syncFullHistory: false,
        },
      });

      instance = await prisma.instance.findUnique({
        where: { id: instanceId },
        include: {
          behavior: true,
          instanceChatwootConfig: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error('Error fetching instance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instance' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: instanceId } = await context.params;
    const { searchParams } = new URL(request.url);
    const deleteFromApi = searchParams.get('deleteFromApi') === 'true';

    // Get instance details before deleting
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
      select: {
        instanceIdentifier: true,
        apiToken: true,
        provider: true,
        baseUrl: true
      }
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    // Delete from provider API if requested
    if (deleteFromApi) {
      try {
        const { ProviderFactory } = await import('@/lib/providers/factory');
        
        // Find the correct provider config from database
        const providerConfig = await ProviderFactory.findConfig(instance.provider);
        
        if (!providerConfig) {
          throw new Error(`Provider configuration not found for ${instance.provider}`);
        }

        const providerInstance = ProviderFactory.create(providerConfig);
        
        // Use instanceIdentifier for Evolution, apiToken for Uazapi
        const identifier = instance.provider === 'EVOLUTION' 
          ? instance.instanceIdentifier 
          : instance.apiToken;
          
        await providerInstance.deleteInstance(identifier);
      } catch (apiError: any) {
        console.error('Error deleting from provider API:', apiError);
        // Continue with database deletion even if API deletion fails
        // Return warning in response
        return NextResponse.json(
          { 
            success: true, 
            warning: `Instance deleted from Manager, but failed to delete from ${instance.provider} API: ${apiError.message}` 
          },
          { status: 200 }
        );
      }
    }

    // Remover dependências que não estão com cascade no schema
    await prisma.$transaction([
      prisma.messageMapping.deleteMany({ where: { instanceId } }),
      prisma.execucaoEvento.deleteMany({ where: { instanceId } }),
      prisma.webhookConfig.deleteMany({ where: { instanceId } }),
      prisma.chatwootInbox.deleteMany({ where: { instanceId } }),
      prisma.instanceChatwootConfig.deleteMany({ where: { instanceId } }),
      prisma.instanceBehavior.deleteMany({ where: { instanceId } }),
      prisma.instance.delete({ where: { id: instanceId } }),
    ]);

    return NextResponse.json({ 
      success: true,
      message: deleteFromApi 
        ? 'Instance deleted from Manager and API' 
        : 'Instance deleted from Manager only'
    });
  } catch (error) {
    console.error('Error deleting instance:', error);
    return NextResponse.json(
      { error: 'Failed to delete instance' },
      { status: 500 }
    );
  }
}
