/**
 * GET /api/event-executions - List execution logs (Global Access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventExecutionService } from '@/lib/events/event-execution.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const direction = searchParams.get('direction');
    const statusFinal = searchParams.get('statusFinal');
    const limit = parseInt(searchParams.get('limit') || '50');

    const eventService = new EventExecutionService();

    // Get recent executions (global - no tenant filter)
    const executions = await eventService.getRecentExecutions({
      direction: direction || undefined,
      statusFinal: statusFinal || undefined,
      limit,
    });

    // Get stats (global)
    const stats = await eventService.countByStatus(
      undefined, // no tenant filter
      direction || undefined
    );

    return NextResponse.json({
      executions,
      stats,
      total: executions.length,
    });
  } catch (error: any) {
    console.error('[GET /api/event-executions] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
