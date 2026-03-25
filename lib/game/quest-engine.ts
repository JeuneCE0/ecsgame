import { createClient } from '@/lib/supabase/server';
import { logXPEvent } from '@/lib/game/xp-engine';

type QuestType = 'daily' | 'weekly' | 'main' | 'special';
type QuestStatus = 'available' | 'in_progress' | 'completed' | 'expired';

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: QuestType;
  xp_reward: number;
  required_count: number;
  source_filter: string | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
}

interface QuestWithProgress extends Quest {
  user_quest: {
    id: string;
    progress: number;
    status: QuestStatus;
    completed_at: string | null;
    claimed_at: string | null;
  } | null;
}

interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  progress: number;
  status: QuestStatus;
  completed_at: string | null;
  claimed_at: string | null;
  created_at: string;
}

export async function getAvailableQuests(userId: string, orgId: string): Promise<QuestWithProgress[]> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: quests, error: questsError } = await supabase
    .from('quests')
    .select('id, title, description, quest_type, xp_reward, required_count, source_filter, is_active, starts_at, expires_at')
    .eq('is_active', true)
    .or(`organization_id.is.null,organization_id.eq.${orgId}`)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gte.${now}`);

  if (questsError) throw questsError;

  const typedQuests = quests as Quest[];

  const { data: userQuests, error: userQuestsError } = await supabase
    .from('user_quests')
    .select('id, quest_id, progress, status, completed_at, claimed_at')
    .eq('user_id', userId);

  if (userQuestsError) throw userQuestsError;

  const typedUserQuests = userQuests as { id: string; quest_id: string; progress: number; status: QuestStatus; completed_at: string | null; claimed_at: string | null }[];
  const userQuestMap = new Map(typedUserQuests.map((uq) => [uq.quest_id, uq]));

  return typedQuests.map((quest) => {
    const uq = userQuestMap.get(quest.id) ?? null;
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
}

export async function startQuest(userId: string, questId: string): Promise<UserQuest> {
  const supabase = createClient();

  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('id, is_active, expires_at')
    .eq('id', questId)
    .single();

  if (questError) throw questError;

  const typedQuest = quest as { id: string; is_active: boolean; expires_at: string | null };

  if (!typedQuest.is_active) {
    throw new Error('Quest is not active');
  }

  if (typedQuest.expires_at && new Date(typedQuest.expires_at) < new Date()) {
    throw new Error('Quest has expired');
  }

  const { data, error } = await supabase
    .from('user_quests')
    .insert({
      user_id: userId,
      quest_id: questId,
      status: 'in_progress' as QuestStatus,
      progress: 0,
    })
    .select('id, user_id, quest_id, progress, status, completed_at, claimed_at, created_at')
    .single();

  if (error) throw error;

  return data as UserQuest;
}

export async function updateQuestProgress(
  userId: string,
  questId: string,
  increment: number
): Promise<UserQuest> {
  const supabase = createClient();

  const { data: userQuest, error: fetchError } = await supabase
    .from('user_quests')
    .select('id, progress, status, quest_id')
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .single();

  if (fetchError) throw fetchError;

  const typedUserQuest = userQuest as { id: string; progress: number; status: QuestStatus; quest_id: string };

  if (typedUserQuest.status === 'completed' || typedUserQuest.status === 'expired') {
    throw new Error(`Quest is already ${typedUserQuest.status}`);
  }

  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('required_count, expires_at, is_active')
    .eq('id', questId)
    .single();

  if (questError) throw questError;

  const typedQuest = quest as { required_count: number; expires_at: string | null; is_active: boolean };

  if (typedQuest.expires_at && new Date(typedQuest.expires_at) < new Date()) {
    const { data: expired, error: expireError } = await supabase
      .from('user_quests')
      .update({ status: 'expired' as QuestStatus })
      .eq('id', typedUserQuest.id)
      .select('id, user_id, quest_id, progress, status, completed_at, claimed_at, created_at')
      .single();

    if (expireError) throw expireError;
    return expired as UserQuest;
  }

  const newProgress = typedUserQuest.progress + increment;
  const isCompleted = newProgress >= typedQuest.required_count;

  const updatePayload: { progress: number; status?: QuestStatus; completed_at?: string } = {
    progress: newProgress,
  };

  if (isCompleted) {
    updatePayload.status = 'completed';
    updatePayload.completed_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await supabase
    .from('user_quests')
    .update(updatePayload)
    .eq('id', typedUserQuest.id)
    .select('id, user_id, quest_id, progress, status, completed_at, claimed_at, created_at')
    .single();

  if (updateError) throw updateError;

  return updated as UserQuest;
}

export async function claimQuestReward(userId: string, questId: string): Promise<UserQuest> {
  const supabase = createClient();

  const { data: userQuest, error: fetchError } = await supabase
    .from('user_quests')
    .select('id, status, claimed_at, quest_id')
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .single();

  if (fetchError) throw fetchError;

  const typedUserQuest = userQuest as { id: string; status: QuestStatus; claimed_at: string | null; quest_id: string };

  if (typedUserQuest.status !== 'completed') {
    throw new Error('Quest is not completed');
  }

  if (typedUserQuest.claimed_at) {
    throw new Error('Reward already claimed');
  }

  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('xp_reward, title')
    .eq('id', questId)
    .single();

  if (questError) throw questError;

  const typedQuest = quest as { xp_reward: number; title: string };

  await logXPEvent(
    userId,
    'quest_completion',
    typedQuest.xp_reward,
    `Quest completed: ${typedQuest.title}`
  );

  const { data: claimed, error: claimError } = await supabase
    .from('user_quests')
    .update({ claimed_at: new Date().toISOString() })
    .eq('id', typedUserQuest.id)
    .select('id, user_id, quest_id, progress, status, completed_at, claimed_at, created_at')
    .single();

  if (claimError) throw claimError;

  return claimed as UserQuest;
}

export async function getDailyQuests(orgId: string): Promise<Quest[]> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('quests')
    .select('id, title, description, quest_type, xp_reward, required_count, source_filter, is_active, starts_at, expires_at')
    .eq('quest_type', 'daily')
    .eq('is_active', true)
    .or(`organization_id.is.null,organization_id.eq.${orgId}`)
    .or(`expires_at.is.null,expires_at.gte.${now}`);

  if (error) throw error;

  return data as Quest[];
}

export async function getWeeklyQuests(orgId: string): Promise<Quest[]> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('quests')
    .select('id, title, description, quest_type, xp_reward, required_count, source_filter, is_active, starts_at, expires_at')
    .eq('quest_type', 'weekly')
    .eq('is_active', true)
    .or(`organization_id.is.null,organization_id.eq.${orgId}`)
    .or(`expires_at.is.null,expires_at.gte.${now}`);

  if (error) throw error;

  return data as Quest[];
}
