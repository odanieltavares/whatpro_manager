/**
 * Simplified User Menu (No Auth)
 * 
 * Displays static user info without authentication
 */

'use client';

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export function UserMenu() {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-sm">
        <p className="font-medium">Admin</p>
        <p className="text-xs text-muted-foreground">Sistema Global</p>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <User className="h-5 w-5" />
      </Button>
    </div>
  );
}
