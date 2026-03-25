import { createClient } from '@/lib/supabase/server';
import { logXPEvent } from '@/lib/game/xp-engine';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition_type: string;
  condition_value: Record<string, unknown>;
  xp_bonus: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

interface BadgeWithProgress extends Badge {
  earned: boolean;
  progress: number;
  target: number;
}

// ── Condition checkers ──────────────────────────────────────────────

async function checkXPEventsCount(userId: string, conditionValue: { min: number }): Promise<{ met: boolean; current: number }> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('xp_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;

  const current = count ?? 0;
  return { met: current >= conditionValue.min, current };
}

async function checkStreak(userId: string, conditionValue: { min: number }): Promise<{ met: boolean; current: number }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak')
    .eq('id', userId)
    .single();

  if (error) throw error;

  const profile = data as { current_streak: number; longest_streak: number };
  const best = Math.max(profile.current_streak, profile.longest_streak);
  return { met: best >= conditionValue.min, current: best };
}

async function checkSourceCount(
  userId: string,
  conditionValue: { source: string; min: number }
): Promise<{ met: boolean; current: number }> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('xp_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', conditionValue.source)
    .in('verification_status', ['auto_verified', 'approved']);

  if (error) throw error;

  const current = count ?? 0;
  return { met: current >= conditionValue.min, current };
}

async function checkTotalXP(userId: string, conditionValue: { min: number }): Promise<{ met: boolean; current: number }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('total_xp')
    .eq('id', userId)
    .single();

  if (error) throw error;

  const current = Number((data as { total_xp: number }).total_xp);
  return { met: current >= conditionValue.min, current };
}

async function checkLevel(userId: string, conditionValue: { min: number }): Promise<{ met: boolean; current: number }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('level')
    .eq('id', userId)
    .single();

  if (error) throw error;

  const current = (data as { level: number }).level;
  return { met: current >= conditionValue.min, current };
}

type ConditionChecker = (userId: string, conditionValue: Record<string, unknown>) => Promise<{ met: boolean; current: number }>;

const CONDITION_CHECKERS: Record<string, ConditionChecker> = {
  xp_events_count: checkXPEventsCount as ConditionChecker,
  streak: checkStreak as ConditionChecker,
  source_count: checkSourceCount as ConditionChecker,
  total_xp: checkTotalXP as ConditionChecker,
  level: checkLevel as ConditionChecker,
};

function getTargetFromCondition(conditionType: string, conditionValue: Record<string, unknown>): number {
  if (conditionType === 'source_count') {
    return (conditionValue as { min: number }).min;
  }
  return (conditionValue as { min: number }).min;
}

// ── Public API ──────────────────────────────────────────────────────

export async function checkBadgeEligibility(userId: string): Promise<Badge[]> {
  const supabase = createClient();

  const { data: allBadges, error: badgesError } = await supabase
    .from('badges')
    .select('id, name, description, icon_url, rarity, condition_type, condition_value, xp_bonus');

  if (badgesError) throw badgesError;

  const { data: earnedBadges, error: earnedError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (earnedError) throw earnedError;

  const earnedIds = new Set((earnedBadges as { badge_id: string }[]).map((ub) => ub.badge_id));
  const unearnedBadges = (allBadges as Badge[]).filter((b) => !earnedIds.has(b.id));

  const eligible: Badge[] = [];

  for (const badge of unearnedBadges) {
    const checker = CONDITION_CHECKERS[badge.condition_type];
    if (!checker) continue;

    const result = await checker(userId, badge.condition_value);
    if (result.met) {
      eligible.push(badge);
    }
  }

  return eligible;
}

export async function awardBadge(userId: string, badgeId: string): Promise<void> {
  const supabase = createClient();

  const { data: badge, error: badgeError } = await supabase
    .from('badges')
    .select('id, name, xp_bonus')
    .eq('id', badgeId)
    .single();

  if (badgeError) throw badgeError;

  const typedBadge = badge as { id: string; name: string; xp_bonus: number };

  const { error: insertError } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
    });

  if (insertError) throw insertError;

  if (typedBadge.xp_bonus > 0) {
    await logXPEvent(
      userId,
      'badge_earned',
      typedBadge.xp_bonus,
      `Badge earned: ${typedBadge.name}`
    );
  }
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      id,
      badge_id,
      earned_at,
      badge:badges (
        id,
        name,
        description,
        icon_url,
        rarity,
        condition_type,
        condition_value,
        xp_bonus
      )
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw error;

  return data as unknown as UserBadge[];
}

export async function getAvailableBadges(userId: string): Promise<BadgeWithProgress[]> {
  const supabase = createClient();

  const { data: allBadges, error: badgesError } = await supabase
    .from('badges')
    .select('id, name, description, icon_url, rarity, condition_type, condition_value, xp_bonus');

  if (badgesError) throw badgesError;

  const { data: earnedBadges, error: earnedError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (earnedError) throw earnedError;

  const earnedIds = new Set((earnedBadges as { badge_id: string }[]).map((ub) => ub.badge_id));

  const results: BadgeWithProgress[] = [];

  for (const badge of allBadges as Badge[]) {
    const isEarned = earnedIds.has(badge.id);
    const target = getTargetFromCondition(badge.condition_type, badge.condition_value);

    let current = 0;
    if (!isEarned) {
      const checker = CONDITION_CHECKERS[badge.condition_type];
      if (checker) {
        const result = await checker(userId, badge.condition_value);
        current = result.current;
      }
    } else {
      current = target;
    }

    results.push({
      ...badge,
      earned: isEarned,
      progress: Math.min(current, target),
      target,
    });
  }

  return results;
}

export async function checkAndAwardStreakBadges(userId: string, currentStreak: number): Promise<void> {
  const supabase = createClient();

  const { data: streakBadges, error } = await supabase
    .from('badges')
    .select('id, condition_value')
    .eq('condition_type', 'streak');

  if (error) throw error;

  const { data: earnedBadges, error: earnedError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (earnedError) throw earnedError;

  const earnedIds = new Set((earnedBadges as { badge_id: string }[]).map((ub) => ub.badge_id));

  for (const badge of streakBadges as { id: string; condition_value: { min: number } }[]) {
    if (earnedIds.has(badge.id)) continue;

    if (currentStreak >= badge.condition_value.min) {
      await awardBadge(userId, badge.id);
    }
  }
}
