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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, email, level, total_xp, current_streak, longest_streak, last_active_date, created_at, organization_id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement du profil.</p>
      </div>
    );
  }

  const { data: badges, error: badgesError } = await supabase
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
    .order('earned_at', { ascending: false });

  const { data: xpEvents, error: xpError } = await supabase
    .from('xp_events')
    .select('id, source, amount, description, verification_status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(15);

  const { count: questsCompleted } = await supabase
    .from('user_quests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');

  type ProfileData = {
    id: string;
    display_name: string;
    avatar_url: string | null;
    email: string;
    level: number;
    total_xp: number;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
    created_at: string;
    organization_id: string | null;
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

  type XPEventData = {
    id: string;
    source: string;
    amount: number;
    description: string | null;
    verification_status: string;
    created_at: string;
  };

  return (
    <ProfileClient
      profile={profile as ProfileData}
      badges={((badges ?? []) as unknown as BadgeData[])}
      xpEvents={((xpEvents ?? []) as XPEventData[])}
      questsCompleted={questsCompleted ?? 0}
      badgesEarned={(badges ?? []).length}
    />
  );
}
