import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FormationsClient from './formations-client';

export const dynamic = 'force-dynamic';

export default async function FormationsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: formations, error: formationsError } = await supabase
    .from('formations')
    .select('id, title, description, thumbnail_url, duration_minutes, xp_reward, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (formationsError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement des formations.</p>
      </div>
    );
  }

  const { data: userFormations, error: userFormationsError } = await supabase
    .from('user_formations')
    .select('id, formation_id, progress_percent, status, started_at, completed_at')
    .eq('user_id', user.id);

  if (userFormationsError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement de la progression.</p>
      </div>
    );
  }

  type FormationRow = {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    duration_minutes: number;
    xp_reward: number;
    is_active: boolean;
    created_at: string;
  };

  type UserFormationRow = {
    id: string;
    formation_id: string;
    progress_percent: number;
    status: string;
    started_at: string | null;
    completed_at: string | null;
  };

  const typedFormations = (formations ?? []) as FormationRow[];
  const typedUserFormations = (userFormations ?? []) as UserFormationRow[];

  const userFormationMap = new Map(typedUserFormations.map((uf) => [uf.formation_id, uf]));

  const formationsWithProgress = typedFormations.map((formation) => {
    const uf = userFormationMap.get(formation.id);
    return {
      ...formation,
      user_formation: uf
        ? {
            id: uf.id,
            progress_percent: uf.progress_percent,
            status: uf.status,
            started_at: uf.started_at,
            completed_at: uf.completed_at,
          }
        : null,
    };
  });

  return <FormationsClient formations={formationsWithProgress} />;
}
