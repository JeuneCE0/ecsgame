import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminQuestsClient from './admin-quests-client';

export const dynamic = 'force-dynamic';

export default async function AdminQuestsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: quests, error: questsError } = await supabase
    .from('quests')
    .select('id, title, description, quest_type, xp_reward, required_count, source_filter, is_active, starts_at, expires_at, created_at')
    .order('created_at', { ascending: false });

  if (questsError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement des qu&ecirc;tes.</p>
      </div>
    );
  }

  type QuestRow = {
    id: string;
    title: string;
    description: string;
    quest_type: string;
    xp_reward: number;
    required_count: number;
    source_filter: string | null;
    is_active: boolean;
    starts_at: string | null;
    expires_at: string | null;
    created_at: string;
  };

  return <AdminQuestsClient quests={(quests ?? []) as QuestRow[]} />;
}
