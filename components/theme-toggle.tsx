'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/store/theme';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);
    setMounted(true);
  }, [theme, setTheme]);

  // Evita flash durante hidratação
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
