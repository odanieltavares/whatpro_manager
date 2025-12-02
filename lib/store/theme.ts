'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      actualTheme: 'light',
      setTheme: (theme) => {
        set({ theme });
        
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          root.classList.add(systemTheme);
          set({ actualTheme: systemTheme });
        } else {
          root.classList.add(theme);
          set({ actualTheme: theme });
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
