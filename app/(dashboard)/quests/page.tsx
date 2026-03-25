import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuestsClient from './quests-client';

export default async function QuestsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  const orgId = profile?.organization_id ?? null;

  const now = new Date().toISOString();

  const { data: quests, error: questsError } = await supabase
    .from('quests')
    .select('id, title, description, quest_type, xp_reward, required_count, source_filter, is_active, starts_at, expires_at')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gte.${now}`);

  if (questsError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement des qu&ecirc;tes.</p>
      </div>
    );
  }

  const { data: userQuests, error: userQuestsError } = await supabase
    .from('user_quests')
    .select('id, quest_id, progress, status, completed_at, claimed_at')
    .eq('user_id', user.id);

  if (userQuestsError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement de la progression.</p>
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
  };

  type UserQuestRow = {
    id: string;
    quest_id: string;
    progress: number;
    status: string;
    completed_at: string | null;
    claimed_at: string | null;
  };

  const typedQuests = (quests ?? []) as QuestRow[];
  const typedUserQuests = (userQuests ?? []) as UserQuestRow[];

  const userQuestMap = new Map(typedUserQuests.map((uq) => [uq.quest_id, uq]));

  const questsWithProgress = typedQuests.map((quest) => {
    const uq = userQuestMap.get(quest.id);
    return {
      ...quest,
      user_quest: uq
        ? {
            id: uq.id,
            progress: uq.progress,
            status: uq.status,
            completed_at: uq.completed_at,
            claimed_at: uq.claimed_at,
          }
        : null,
    };
  });

  return <QuestsClient quests={questsWithProgress} userId={user.id} />;
}
