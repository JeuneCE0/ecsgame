import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ShopClient from './rewards-client';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [profileResult, claimedResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('total_xp, level')
      .eq('id', user.id)
      .single(),
    supabase
      .from('reward_claims')
      .select('id, reward_id, claimed_at, status')
      .eq('user_id', user.id)
      .order('claimed_at', { ascending: false }),
  ]);

  const { data: profile, error: profileError } = profileResult;
  const { data: claimedRewards } = claimedResult;

  if (profileError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement du profil.</p>
      </div>
    );
  }

  type ProfileRow = { total_xp: number; level: number };
  type ClaimedRow = {
    id: string;
    reward_id: string;
    claimed_at: string;
    status: string;
  };

  const p = profile as ProfileRow;

  return (
    <ShopClient
      currentXP={Number(p.total_xp)}
      currentLevel={Number(p.level)}
      purchasedItemIds={(claimedRewards ?? []).map((c: ClaimedRow) => c.reward_id)}
    />
  );
}
