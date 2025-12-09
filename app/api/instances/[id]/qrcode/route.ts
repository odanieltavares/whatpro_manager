import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UazapiProvider } from '@/lib/providers/uazapi.provider';
import { ProviderFactory } from '@/lib/providers/factory';

/**
 * GET /api/instances/:id/qrcode - Get QR code (Global Access)
 * Gera QR code para conexão da instância
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

    // Resolver provider
    const providerName = instance.provider.toLowerCase();

    // Se já estiver conectado, não force geração de QR
    if (instance.status === 'connected') {
      return NextResponse.json(
        { error: 'Instância já conectada. Desconecte antes de gerar novo QR.' },
        { status: 400 }
      );
    }

    if (providerName === 'uazapi') {
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
      const qrData = await provider.generateQRCode(instance.apiToken || '');

      return NextResponse.json({
        qrcode: qrData.qrcode,
        instanceId: instance.id,
        instanceIdentifier: instance.instanceIdentifier,
        message: 'QR Code atualizado',
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
      const qrData = await provider.generateQRCode(instance.instanceIdentifier);
      if (!qrData.qrcode && !qrData.pairingCode) {
        return NextResponse.json(
          { error: 'QR code não retornado pelo provider' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        qrcode: qrData.qrcode,
        pairingCode: qrData.pairingCode,
        instanceId: instance.id,
        instanceIdentifier: instance.instanceIdentifier,
        message: qrData.pairingCode ? 'Pairing code atualizado' : 'QR Code atualizado',
      });
    }

    return NextResponse.json(
      { error: `QR code não suportado para provider ${instance.provider}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error getting QR code:', error);
    let message = error?.message || 'Failed to get QR code';
    let status = 500;

    // Tenta extrair status do payload JSON do provider (ex: {"code":404,"message":"Not Found"})
    try {
      const parsed = JSON.parse(message);
      if (parsed?.code) {
        status = Number(parsed.code);
        message = parsed.message || message;
      }
    } catch (e) {
      // ignore
    }

    const lower = message.toLowerCase();
    if (lower.includes('conflict')) status = 409;
    else if (lower.includes('too many requests')) status = 429;
    else if (lower.includes('unauthorized')) status = 401;
    else if (lower.includes('not found')) status = 404;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
