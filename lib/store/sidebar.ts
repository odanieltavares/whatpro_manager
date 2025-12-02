import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleOpen: () => void;
  toggleCollapsed: () => void;
  setOpen: (open: boolean) => void;
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: false, // Para mobile
      isCollapsed: false, // Para desktop
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);
