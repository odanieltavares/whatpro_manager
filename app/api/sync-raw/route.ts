/**
 * Sync API Endpoint (Prisma)
 */

import { NextRequest, NextResponse } from 'next/server';
import { InstanceSyncService } from '@/lib/sync/instance-sync.service';

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Starting instance sync (Prisma)...');
    
    const syncService = new InstanceSyncService();
    const result = await syncService.syncAll();
    
    console.log('✅ Sync completed!');
    console.log(`  - Synced: ${result.synced} instances`);
    console.log(`  - Created: ${result.created}`);
    console.log(`  - Updated: ${result.updated}`);
    console.log(`  - Removed: ${result.removed}`);
    
    if (result.errors.length > 0) {
      console.log(`  - Errors: ${result.errors.length}`);
      result.errors.forEach(err => console.log(`    - ${err}`));
    }
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        synced: 0,
        created: 0,
        updated: 0,
        errors: [String(error)]
      }, 
      { status: 500 }
    );
  }
}
