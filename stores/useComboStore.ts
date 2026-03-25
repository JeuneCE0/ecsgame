import { create } from 'zustand';

const COMBO_WINDOW_MS = 30_000;

interface ComboState {
  currentCombo: number;
  lastActionTime: number;
  incrementCombo: () => void;
  resetCombo: () => void;
}

export const useComboStore = create<ComboState>((set, get) => ({
  currentCombo: 0,
  lastActionTime: 0,

  incrementCombo: () => {
    const now = Date.now();
    const { lastActionTime, currentCombo } = get();
    const withinWindow = now - lastActionTime < COMBO_WINDOW_MS;

    set({
      currentCombo: withinWindow ? currentCombo + 1 : 1,
      lastActionTime: now,
    });
  },

  resetCombo: () =>
    set({
      currentCombo: 0,
      lastActionTime: 0,
    }),
}));

/** Derived multiplier: 1x base, +0.1x per combo level above 1, capped at 2x */
export function getComboMultiplier(combo: number): number {
  if (combo <= 1) return 1;
  return Math.min(1 + (combo - 1) * 0.1, 2);
}
