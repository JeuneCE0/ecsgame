import { createClient } from '@/lib/supabase/server';
import { STREAK_BONUSES } from '@/lib/constants';
import { checkAndAwardStreakBadges as checkStreakBadges } from '@/lib/game/badge-engine';

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakBonus: number;
}

export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak, last_active_date')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null, streakBonus: 0 };
  }

  const profile = data as { current_streak: number; longest_streak: number; last_active_date: string | null };

  return {
    currentStreak: profile.current_streak,
    longestStreak: profile.longest_streak,
    lastActiveDate: profile.last_active_date,
    streakBonus: calculateStreakBonus(profile.current_streak),
  };
}

export function calculateStreakBonus(streakDays: number): number {
  let bonus = 0;

  const thresholds = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (streakDays >= threshold) {
      bonus = STREAK_BONUSES[threshold];
      break;
    }
  }

  return bonus;
}

export async function checkAndAwardStreakBadges(userId: string, currentStreak: number): Promise<void> {
  await checkStreakBadges(userId, currentStreak);
}
