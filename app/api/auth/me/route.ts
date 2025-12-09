import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';

async function handler(req: NextRequest, user: any) {
  return NextResponse.json({
    user: {
      id: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    },
  });
}

export const GET = withAuth(handler);
