'use client';

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/lib/store/sidebar';

export function MobileMenuButton() {
  const { toggleOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden h-9 w-9"
      onClick={toggleOpen}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );
}
