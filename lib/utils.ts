import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

export function getXPProgressPercent(currentXP: number, currentLevelXP: number, nextLevelXP: number): number {
  if (nextLevelXP <= currentLevelXP) return 100;
  return Math.min(100, ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
}
