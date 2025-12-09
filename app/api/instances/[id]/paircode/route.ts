import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UazapiProvider } from '@/lib/providers/uazapi.provider';
import { ProviderFactory } from '@/lib/providers/factory';

/**
 * POST /api/instances/:id/paircode - Generate pairing code (Global Access)
 * Gera código de pareamento para conexão multidevice
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const phone: string | undefined = body?.phone;

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
      if (!phone) {
        return NextResponse.json(
          { error: 'Phone number is required' },
          { status: 400 }
        );
      }

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
      const pairData = await provider.generatePaircode(instance.apiToken || '', phone);

      return NextResponse.json({
        paircode: pairData.code,
        phone,
        instanceId: instance.id,
        instanceIdentifier: instance.instanceIdentifier,
      });
    }

    if (providerName === 'evolution') {
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
      const pairData = await provider.generatePaircode(instance.instanceIdentifier, phone || '');

      return NextResponse.json({
        paircode: pairData.code,
        phone: phone || null,
        instanceId: instance.id,
        instanceIdentifier: instance.instanceIdentifier,
      });
    }

    return NextResponse.json(
      { error: `Paircode não suportado para provider ${instance.provider}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error generating paircode:', error);

    let message = error?.message || 'Failed to generate paircode';
    let status = 500;

    // Tenta extrair status de mensagens comuns
    const lower = message.toLowerCase();
    if (lower.includes('not found') || lower.includes('404')) status = 404;
    else if (lower.includes('conflict') || lower.includes('409')) status = 409;
    else if (lower.includes('too many') || lower.includes('429')) status = 429;
    else if (lower.includes('unauthorized') || lower.includes('401')) status = 401;
    else if (lower.includes('pairing code')) status = 502;

    // Se a mensagem for JSON, tentar parsear
    try {
      const parsed = JSON.parse(message);
      if (parsed?.response?.message?.[0]) {
        message = parsed.response.message[0];
      } else if (parsed?.message) {
        message = parsed.message;
      }
      if (parsed?.status) {
        status = Number(parsed.status);
      }
    } catch (_) {
      // ignore parse failure
    }

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
