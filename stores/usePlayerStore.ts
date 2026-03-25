import { create } from 'zustand';

interface PlayerState {
  level: number;
  totalXP: number;
  currentStreak: number;
  showLevelUpModal: boolean;
  newLevel: number | null;
  xpNotification: { amount: number; source: string } | null;

  setPlayer: (data: { level: number; totalXP: number; currentStreak: number }) => void;
  addXP: (amount: number, source: string) => void;
  triggerLevelUp: (newLevel: number) => void;
  dismissLevelUp: () => void;
  clearXPNotification: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  level: 1,
  totalXP: 0,
  currentStreak: 0,
  showLevelUpModal: false,
  newLevel: null,
  xpNotification: null,

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
}));
