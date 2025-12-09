/**
 * GET /api/instances/:id/behavior - Get behavior settings (Global Access)
 * PUT /api/instances/:id/behavior - Update behavior settings (Global Access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: instanceId } = await context.params;

    let behavior = await prisma.instanceBehavior.findUnique({
      where: { instanceId },
    });

    // Create default if not exists
    if (!behavior) {
      behavior = await prisma.instanceBehavior.create({
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
    }

    return NextResponse.json(behavior);
  } catch (error) {
    console.error('Error fetching behavior:', error);
    return NextResponse.json(
      { error: 'Failed to fetch behavior' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: instanceId } = await context.params;
    const body = await request.json();

    const behavior = await prisma.instanceBehavior.upsert({
      where: { instanceId },
      update: body,
      create: {
        instanceId,
        ...body,
      },
    });

    return NextResponse.json(behavior);
  } catch (error) {
    console.error('Error updating behavior:', error);
    return NextResponse.json(
      { error: 'Failed to update behavior' },
      { status: 500 }
    );
  }
}
