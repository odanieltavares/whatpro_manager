import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProviderFactory } from '@/lib/providers/factory';
import { UazapiProvider } from '@/lib/providers/uazapi.provider';
import { EvolutionProvider } from '@/lib/providers/evolution.provider';

/**
 * POST /api/instances/:id/disconnect - desconecta instância no provider e marca como disconnected
 */
export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const instance = await prisma.instance.findUnique({ where: { id } });
    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Se já está desconectada, apenas confirma
    if (instance.status === 'disconnected') {
      return NextResponse.json({ success: true, message: 'Instance already disconnected' });
    }

    const providerName = instance.provider.toLowerCase();
    const config =
      await ProviderFactory.findConfig(instance.provider, instance.baseUrl) ||
      await ProviderFactory.findConfig(instance.provider);

    if (!config) {
      return NextResponse.json({ error: 'Provider configuration not found' }, { status: 500 });
    }

    let warning: string | undefined;

    try {
      if (providerName === 'uazapi') {
        if (!instance.apiToken) {
          return NextResponse.json(
            { error: 'Instance token missing for Uazapi disconnect' },
            { status: 400 }
          );
        }
        const provider = new UazapiProvider(config.baseUrl, config.adminToken);
        await provider.disconnect(instance.apiToken);
      } else if (providerName === 'evolution') {
        const provider = new EvolutionProvider(config.baseUrl, config.adminToken);
        await provider.disconnect(instance.instanceIdentifier);
      } else {
        return NextResponse.json(
          { error: `Disconnect not supported for provider ${instance.provider}` },
          { status: 400 }
        );
      }
    } catch (providerError: any) {
      const msg = providerError?.message || 'Provider disconnect failed';
      // Se provider respondeu 404 (instância não encontrada), considerar como já desconectado
      if (msg.toLowerCase().includes('404') || msg.toLowerCase().includes('not found')) {
        warning = 'Instance not found on provider; marked disconnected locally';
      } else {
        warning = `Provider disconnect error: ${msg}`;
      }
    }

    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: 'disconnected', updatedAt: new Date() },
    });

    // Mesmo com aviso do provider, retornamos sucesso para o frontend não quebrar
    return NextResponse.json(warning ? { success: true, warning } : { success: true });
  } catch (error: any) {
    console.error('Error disconnecting instance:', error);
    const message = error?.message || 'Failed to disconnect instance';
    return NextResponse.json(
      { error: message },
      { status: message.includes('token missing') ? 400 : 500 }
    );
  }
}
