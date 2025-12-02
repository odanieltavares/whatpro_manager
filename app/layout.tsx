'use client';

import { useState, useEffect } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { useSidebar } from "@/lib/store/sidebar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Whatpro Manager - Gerenciamento WhatsApp</title>
        <meta name="description" content="Plataforma moderna para gerenciamento de instâncias WhatsApp via Uazapi" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <LayoutContent>{children}</LayoutContent>
        <Toaster />
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

  // Evita erro de hidratação garantindo que o estado só seja lido no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Durante SSR, renderiza com estado padrão
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
            <MobileMenuButton />
            <div className="flex-1" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto bg-muted/20 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          // Mobile: no margin (sidebar is overlay)
          'lg:ml-64',
          // Desktop: dynamic margin based on collapsed state
          isCollapsed && 'lg:ml-16'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <MobileMenuButton />
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
