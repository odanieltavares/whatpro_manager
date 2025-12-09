import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET/PUT chatwoot config da instância
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const config = await prisma.instanceChatwootConfig.findUnique({
      where: { instanceId: id },
    });
    return NextResponse.json(config || null);
  } catch (error) {
    console.error('Error fetching chatwoot config:', error);
    return NextResponse.json({ error: 'Failed to fetch chatwoot config' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const instance = await prisma.instance.findUnique({ where: { id } });
    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    const data = {
      tenantId: instance.tenantId,
      projectId: instance.projectId,
      instanceId: id,
      instanceName: instance.instanceIdentifier,
      instanceToken: instance.apiToken,
      instanceUrl: instance.baseUrl,
      chatwootAccountId: body.chatwootAccountId ?? null,
      chatwootUrl: body.chatwootUrl ?? null,
      chatwootUserToken: body.chatwootUserToken ?? null,
      inboxId: body.inboxId ?? null,
      inboxStatus: body.inboxStatus ?? null,
      logInbox: body.logInbox ?? false,
    };

    const saved = await prisma.instanceChatwootConfig.upsert({
      where: { instanceId: id },
      update: data,
      create: data,
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error saving chatwoot config:', error);
    return NextResponse.json({ error: 'Failed to save chatwoot config' }, { status: 500 });
  }
}
