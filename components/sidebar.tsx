'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/lib/store/sidebar';
import {
  LayoutDashboard,
  Server,
  MessageSquare,
  Webhook,
  Settings,
  Send,
  ChevronLeft,
  X,
} from 'lucide-react';
import { Button } from './ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Instâncias', href: '/instances', icon: Server },
  { name: 'Mensagens', href: '/messages', icon: Send },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'Chatwoot', href: '/chatwoot', icon: MessageSquare },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isCollapsed, toggleOpen, toggleCollapsed, setOpen } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full border-r bg-background transition-all duration-300 flex flex-col',
          // Mobile
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile width
          'w-64'
        )}
      >
        {/* Logo / Header */}
        <div className="flex h-16 items-center border-b px-4 justify-between">
          <div className={cn('flex items-center gap-2', isCollapsed && 'lg:justify-center lg:w-full')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
              <Server className="h-4 w-4" />
            </div>
            {/* No mobile sempre mostra texto, no desktop depende do isCollapsed */}
            <span className={cn('text-lg font-semibold whitespace-nowrap', isCollapsed && 'lg:hidden')}>
              Whatpro Manager
            </span>
          </div>

          {/* Close button (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Collapse button (desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className={cn('hidden lg:flex h-8 w-8', isCollapsed && 'lg:hidden')}
            onClick={toggleCollapsed}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                  // Collapse apenas no desktop (lg)
                  isCollapsed && 'lg:justify-center lg:px-2'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {/* No mobile sempre mostra texto, no desktop depende do isCollapsed */}
                <span className={cn(isCollapsed && 'lg:hidden')}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Expand button (when collapsed) */}
        {isCollapsed && (
          <div className="border-t p-2 hidden lg:block">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={toggleCollapsed}
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className={cn('border-t p-4', isCollapsed && 'lg:hidden')}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@whatpro.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
