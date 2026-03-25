import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const CRON_SECRET = process.env.CRON_SECRET;

interface CronSummary {
  leaderboardRefreshed: boolean;
  expiredQuestsReset: number;
  timestamp: string;
}

async function refreshLeaderboard(): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase.rpc('refresh_leaderboard_view');

  if (error) {
    throw new Error(`Failed to refresh leaderboard: ${error.message}`);
  }

  return true;
}

async function resetExpiredDailyQuests(): Promise<number> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: expiredQuests, error: fetchError } = await supabase
    .from('quests')
    .select('id')
    .eq('quest_type', 'daily')
    .eq('is_active', true)
    .lt('expires_at', now);

  if (fetchError) {
    throw new Error(`Failed to fetch expired quests: ${fetchError.message}`);
  }

  type QuestIdRow = { id: string };
  const typedQuests = expiredQuests as QuestIdRow[];

  if (typedQuests.length === 0) {
    return 0;
  }

  const questIds = typedQuests.map((q) => q.id);

  const { error: updateError } = await supabase
    .from('user_quests')
    .update({ status: 'expired' })
    .in('quest_id', questIds)
    .in('status', ['available', 'in_progress']);

  if (updateError) {
    throw new Error(`Failed to expire user quests: ${updateError.message}`);
  }

  const { error: deactivateError } = await supabase
    .from('quests')
    .update({ is_active: false })
    .in('id', questIds);

  if (deactivateError) {
    throw new Error(`Failed to deactivate expired quests: ${deactivateError.message}`);
  }

  return typedQuests.length;
}

export async function GET(request: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: 'Cron secret not configured' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const summary: CronSummary = {
    leaderboardRefreshed: false,
    expiredQuestsReset: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    summary.leaderboardRefreshed = await refreshLeaderboard();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error refreshing leaderboard';
    return NextResponse.json(
      { error: message, summary },
      { status: 500 }
    );
  }

  try {
    summary.expiredQuestsReset = await resetExpiredDailyQuests();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error resetting quests';
    return NextResponse.json(
      { error: message, summary },
      { status: 500 }
    );
  }

  return NextResponse.json({ summary }, { status: 200 });
}
