import { create } from 'zustand';

interface GameState {
  isSidebarOpen: boolean;
  activeTab: string;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isSidebarOpen: true,
  activeTab: 'dashboard',

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
