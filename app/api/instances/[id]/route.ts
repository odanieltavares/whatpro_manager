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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting instance:', error);
    return NextResponse.json(
      { error: 'Failed to delete instance' },
      { status: 500 }
    );
  }
}
