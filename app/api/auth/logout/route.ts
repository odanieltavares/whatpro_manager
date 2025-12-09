import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // In a stateless JWT system, logout is handled client-side
  // by removing tokens from storage
  
  // Optionally, you could:
  // 1. Blacklist the token in Redis
  // 2. Log the logout event in audit_logs
  
  return NextResponse.json({
    message: 'Logged out successfully',
  });
}
