import { create } from 'zustand';
import type { PlayerStats } from '@/lib/game/stats-engine';

interface PlayerState {
  level: number;
  totalXP: number;
  currentStreak: number;
  showLevelUpModal: boolean;
  newLevel: number | null;
  xpNotification: { amount: number; source: string } | null;
  stats: PlayerStats;

  setPlayer: (data: { level: number; totalXP: number; currentStreak: number }) => void;
  addXP: (amount: number, source: string) => void;
  triggerLevelUp: (newLevel: number) => void;
  dismissLevelUp: () => void;
  clearXPNotification: () => void;
  setStats: (stats: PlayerStats) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  level: 1,
  totalXP: 0,
  currentStreak: 0,
  showLevelUpModal: false,
  newLevel: null,
  xpNotification: null,
  stats: { closing: 0, prospection: 0, management: 0, creation: 0, networking: 0 },

  setPlayer: (data) =>
    set({ level: data.level, totalXP: data.totalXP, currentStreak: data.currentStreak }),

  addXP: (amount, source) =>
    set((state) => ({
      totalXP: state.totalXP + amount,
      xpNotification: { amount, source },
    })),

  triggerLevelUp: (newLevel) =>
    set({ showLevelUpModal: true, newLevel, level: newLevel }),

  dismissLevelUp: () =>
    set({ showLevelUpModal: false, newLevel: null }),

  clearXPNotification: () =>
    set({ xpNotification: null }),

  setStats: (stats) =>
    set({ stats }),
}));
