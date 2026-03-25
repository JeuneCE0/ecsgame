import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserXPStats, getXPHistory } from '@/lib/game/xp-engine';
import { getAvailableQuests } from '@/lib/game/quest-engine';
import { getStreakInfo } from '@/lib/game/streak-engine';
import { SCALE_CORP_ORG_ID } from '@/lib/constants';
import { DashboardClient } from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, organization_id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    // Profile may not exist yet — use fallback values
  }

  const displayName = (profile?.full_name as string) ?? 'Joueur';
  const orgId = (profile?.organization_id as string) ?? SCALE_CORP_ORG_ID;

  let xpStats = { totalXP: 0, level: 1, currentLevelXP: 0, nextLevelXP: 100, progressPercent: 0, weeklyXP: 0 };
  let streakInfo = { currentStreak: 0, longestStreak: 0 };
  let quests: Awaited<ReturnType<typeof getAvailableQuests>> = [];
  let recentXP: Awaited<ReturnType<typeof getXPHistory>> = [];

  try {
    [xpStats, streakInfo, quests, recentXP] = await Promise.all([
      getUserXPStats(user.id),
      getStreakInfo(user.id),
      getAvailableQuests(user.id, orgId),
      getXPHistory(user.id, 10),
    ]);
  } catch {
    // One or more data sources failed — use fallback values
  }

  const todayQuests = quests
    .filter((q) => q.quest_type === 'daily')
    .slice(0, 3)
    .map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      xpReward: q.xp_reward,
      questType: q.quest_type as 'daily' | 'weekly' | 'main' | 'special',
      progress: q.user_quest?.progress ?? 0,
      requiredCount: q.required_count,
      status: (q.user_quest?.status ?? 'available') as
        | 'available'
        | 'in_progress'
        | 'completed'
        | 'expired',
    }));

  const { data: closesData } = await supabase
    .from('xp_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('source', 'deal_closed');

  const totalCloses = closesData?.length ?? 0;

  const recentActivity = recentXP.map((event) => ({
    id: event.id,
    source: event.source,
    amount: event.amount,
    description: event.description,
    createdAt: event.created_at,
  }));

  return (
    <DashboardClient
      displayName={displayName}
      xpStats={xpStats}
      streakInfo={{
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
      }}
      todayQuests={todayQuests}
      totalCloses={totalCloses}
      recentActivity={recentActivity}
    />
  );
}
