import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RewardsClient from './rewards-client';

export const dynamic = 'force-dynamic';

export default async function RewardsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('total_xp')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement du profil.</p>
      </div>
    );
  }

  const { data: rewards, error: rewardsError } = await supabase
    .from('rewards')
    .select('id, name, description, image_url, cost_xp, is_active, stock')
    .eq('is_active', true)
    .order('cost_xp', { ascending: true });

  if (rewardsError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement des r&eacute;compenses.</p>
      </div>
    );
  }

  const { data: claimedRewards, error: claimedError } = await supabase
    .from('reward_claims')
    .select('id, reward_id, claimed_at, status, reward:rewards (id, name, description, image_url, cost_xp)')
    .eq('user_id', user.id)
    .order('claimed_at', { ascending: false });

  type RewardRow = {
    id: string;
    name: string;
    description: string;
    image_url: string | null;
    cost_xp: number;
    is_active: boolean;
    stock: number | null;
  };

  type ClaimedRewardRow = {
    id: string;
    reward_id: string;
    claimed_at: string;
    reward: {
      id: string;
      name: string;
      description: string;
      image_url: string | null;
      cost_xp: number;
    };
  };

  return (
    <RewardsClient
      rewards={(rewards ?? []) as RewardRow[]}
      claimedRewards={((claimedRewards ?? []) as unknown as ClaimedRewardRow[])}
      currentXP={Number((profile as { total_xp: number }).total_xp)}
    />
  );
}
