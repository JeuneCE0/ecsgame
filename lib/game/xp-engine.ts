import { createClient } from '@/lib/supabase/server';
import { XP_THRESHOLDS } from '@/lib/constants';

type XPSource =
  | 'quest_completion'
  | 'call_booked'
  | 'deal_closed'
  | 'lead_generated'
  | 'formation_completed'
  | 'streak_bonus'
  | 'manual_log'
  | 'referral'
  | 'badge_earned'
  | 'admin_grant';

type VerificationStatus = 'auto_verified' | 'pending_review';

interface XPEvent {
  id: string;
  user_id: string;
  source: XPSource;
  amount: number;
  description: string | null;
  proof_url: string | null;
  verification_status: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface LevelThreshold {
  level: number;
  xp_required: number;
  title: string;
}

interface UserXPStats {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  weeklyXP: number;
}

export function getVerificationStatus(amount: number): VerificationStatus {
  return amount <= XP_THRESHOLDS.AUTO_VERIFY_MAX ? 'auto_verified' : 'pending_review';
}

export async function logXPEvent(
  userId: string,
  source: XPSource,
  amount: number,
  description?: string,
  proofUrl?: string,
  metadata?: Record<string, unknown>
): Promise<XPEvent> {
  const supabase = createClient();

  const verificationStatus = getVerificationStatus(amount);

  const { data, error } = await supabase
    .from('xp_events')
    .insert({
      user_id: userId,
      source,
      amount,
      description: description ?? null,
      proof_url: proofUrl ?? null,
      verification_status: verificationStatus,
      metadata: metadata ?? {},
    })
    .select('id, user_id, source, amount, description, proof_url, verification_status, metadata, created_at')
    .single();

  if (error) throw error;

  return data as XPEvent;
}

export async function getLevelForXP(xp: number): Promise<{ level: number; title: string; xpRequired: number }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('level_thresholds')
    .select('level, xp_required, title')
    .lte('xp_required', xp)
    .order('level', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;

  const threshold = data as LevelThreshold;

  return {
    level: threshold.level,
    title: threshold.title,
    xpRequired: threshold.xp_required,
  };
}

export async function getUserXPStats(userId: string): Promise<UserXPStats> {
  const supabase = createClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('total_xp, level')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return { totalXP: 0, level: 1, currentLevelXP: 0, nextLevelXP: 100, progressPercent: 0, weeklyXP: 0 };
  }

  const totalXP = Number(profile.total_xp);
  const currentLevel = profile.level as number;

  const { data: thresholds, error: thresholdsError } = await supabase
    .from('level_thresholds')
    .select('level, xp_required, title')
    .in('level', [currentLevel, currentLevel + 1])
    .order('level', { ascending: true });

  if (thresholdsError) {
    return { totalXP, level: currentLevel, currentLevelXP: 0, nextLevelXP: 100, progressPercent: 0, weeklyXP: 0 };
  }

  const typedThresholds = thresholds as LevelThreshold[];
  const currentThreshold = typedThresholds.find((t) => t.level === currentLevel);
  const nextThreshold = typedThresholds.find((t) => t.level === currentLevel + 1);

  const currentLevelXP = currentThreshold?.xp_required ?? 0;
  const nextLevelXP = nextThreshold?.xp_required ?? currentLevelXP;

  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = xpNeeded > 0 ? Math.min(Math.round((xpIntoLevel / xpNeeded) * 100), 100) : 100;

  const weekStart = getWeekStartISO();

  const { data: weeklyData, error: weeklyError } = await supabase
    .from('xp_events')
    .select('amount')
    .eq('user_id', userId)
    .in('verification_status', ['auto_verified', 'approved'])
    .gte('created_at', weekStart);

  const weeklyXP = weeklyError
    ? 0
    : (weeklyData as { amount: number }[]).reduce((sum, e) => sum + e.amount, 0);

  return {
    totalXP,
    level: currentLevel,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    weeklyXP,
  };
}

export async function getXPHistory(userId: string, limit: number = 20): Promise<XPEvent[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('xp_events')
    .select('id, user_id, source, amount, description, proof_url, verification_status, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];

  return data as XPEvent[];
}

function getWeekStartISO(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = start of week
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
}
