import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileClient from './profile-client';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  /* Fetch all independent profile data in parallel for faster loading */
  const [profileResult, badgesResult, allBadgesResult, xpEventsResult, questsResult, formationsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email, level, total_xp, current_streak, longest_streak, last_active_date, created_at, organization_id, business_type, business_name, bio, goals, social_links, experience_level')
      .eq('id', user.id)
      .single(),
    supabase
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
          xp_bonus
        )
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false }),
    supabase
      .from('badges')
      .select('id, name, description, icon_url, rarity, xp_bonus')
      .order('rarity', { ascending: true }),
    supabase
      .from('xp_events')
      .select('id, source, amount, description, verification_status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('user_quests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed'),
    supabase
      .from('user_formations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('completed_at', 'is', null),
  ]);

  const { data: profile, error: profileError } = profileResult;

  if (profileError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement du profil.</p>
      </div>
    );
  }

  const { data: badges } = badgesResult;
  const { data: allBadges } = allBadgesResult;
  const { data: xpEvents } = xpEventsResult;
  const { count: questsCompleted } = questsResult;
  const { count: formationsCompleted } = formationsResult;

  /* Thresholds depend on profile.level, so fetched after the parallel batch */
  const { data: thresholds } = await supabase
    .from('level_thresholds')
    .select('level, xp_required, title')
    .in('level', [profile.level, profile.level + 1])
    .order('level', { ascending: true });

  const currentThreshold = (thresholds ?? []).find(
    (t: { level: number }) => t.level === profile.level
  );
  const nextThreshold = (thresholds ?? []).find(
    (t: { level: number }) => t.level === profile.level + 1
  );

  type ProfileData = {
    id: string;
    full_name: string;
    avatar_url: string | null;
    email: string;
    level: number;
    total_xp: number;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
    created_at: string;
    organization_id: string | null;
    business_type: string | null;
    business_name: string | null;
    bio: string | null;
    goals: string[] | null;
    social_links: Record<string, string> | null;
    experience_level: string | null;
  };

  type BadgeData = {
    id: string;
    badge_id: string;
    earned_at: string;
    badge: {
      id: string;
      name: string;
      description: string;
      icon_url: string | null;
      rarity: string;
      xp_bonus: number;
    };
  };

  type AllBadgeData = {
    id: string;
    name: string;
    description: string;
    icon_url: string | null;
    rarity: string;
    xp_bonus: number;
  };

  type XPEventData = {
    id: string;
    source: string;
    amount: number;
    description: string | null;
    verification_status: string;
    created_at: string;
  };

  type ThresholdData = {
    level: number;
    xp_required: number;
    title: string;
  };

  return (
    <ProfileClient
      profile={profile as ProfileData}
      badges={(badges ?? []) as unknown as BadgeData[]}
      allBadges={(allBadges ?? []) as AllBadgeData[]}
      xpEvents={(xpEvents ?? []) as XPEventData[]}
      questsCompleted={questsCompleted ?? 0}
      formationsCompleted={formationsCompleted ?? 0}
      badgesEarned={(badges ?? []).length}
      currentLevelXP={(currentThreshold as ThresholdData | undefined)?.xp_required ?? 0}
      nextLevelXP={(nextThreshold as ThresholdData | undefined)?.xp_required ?? 0}
    />
  );
}
