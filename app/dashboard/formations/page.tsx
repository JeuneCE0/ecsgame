import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getPhaseForLevel,
  getUnlockedModules,
  getLockedModules,
  getClassModules,
} from '@/lib/game/curriculum';
import FormationsClient from './formations-client';

export const dynamic = 'force-dynamic';

export default async function FormationsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  /* Fetch profile + user_formations in parallel */
  const [profileResult, userFormationsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('level, total_xp, business_type')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_formations')
      .select('id, formation_id, progress_percent, completed_at, created_at')
      .eq('user_id', user.id),
  ]);

  const { data: profile } = profileResult;
  const { data: userFormations, error: userFormationsError } = userFormationsResult;

  if (userFormationsError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">
          Erreur lors du chargement de la progression.
        </p>
      </div>
    );
  }

  const playerLevel = (profile?.level as number) ?? 1;
  const businessType = (profile?.business_type as string | null) ?? null;

  /* Derive curriculum data from the player level */
  const currentPhase = getPhaseForLevel(playerLevel);
  const unlockedModules = getUnlockedModules(playerLevel);
  const lockedModules = getLockedModules(playerLevel);
  const classModules = getClassModules(businessType);

  /* Build a map of formation_id -> progress for the client */
  type UserFormationRow = {
    id: string;
    formation_id: string;
    progress_percent: number;
    completed_at: string | null;
    created_at: string;
  };

  const typedUserFormations = (userFormations ?? []) as UserFormationRow[];

  const progressMap: Record<
    string,
    { id: string; progressPercent: number; completedAt: string | null }
  > = {};

  for (const uf of typedUserFormations) {
    progressMap[uf.formation_id] = {
      id: uf.id,
      progressPercent: uf.progress_percent,
      completedAt: uf.completed_at,
    };
  }

  return (
    <FormationsClient
      playerLevel={playerLevel}
      businessType={businessType}
      currentPhaseName={currentPhase?.phase.name ?? 'Les Fondations'}
      currentPhaseRange={
        currentPhase
          ? [currentPhase.phase.levelRange[0], currentPhase.phase.levelRange[1]]
          : [1, 3]
      }
      unlockedModules={unlockedModules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        lessons: [...m.lessons],
        xpReward: m.xpReward,
        unlockLevel: m.unlockLevel,
        estimatedMinutes: m.estimatedMinutes,
        actionItem: m.actionItem,
      }))}
      lockedModules={lockedModules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        lessons: [...m.lessons],
        xpReward: m.xpReward,
        unlockLevel: m.unlockLevel,
        estimatedMinutes: m.estimatedMinutes,
        actionItem: m.actionItem,
      }))}
      classModules={classModules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        lessons: [...m.lessons],
        xpReward: m.xpReward,
        estimatedMinutes: m.estimatedMinutes,
        actionItem: m.actionItem,
      }))}
      progressMap={progressMap}
    />
  );
}
