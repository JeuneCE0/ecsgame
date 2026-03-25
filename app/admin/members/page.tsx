import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminMembersClient from './admin-members-client';

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: members, error: membersError } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url, level, total_xp, current_streak, longest_streak, role, created_at, last_active_date')
    .order('total_xp', { ascending: false });

  if (membersError) {
    return (
      <div className="card-ecs text-center py-12">
        <p className="text-red-400 text-sm">Erreur lors du chargement des membres.</p>
      </div>
    );
  }

  type MemberRow = {
    id: string;
    display_name: string;
    email: string;
    avatar_url: string | null;
    level: number;
    total_xp: number;
    current_streak: number;
    longest_streak: number;
    role: string;
    created_at: string;
    last_active_date: string | null;
  };

  return <AdminMembersClient members={(members ?? []) as MemberRow[]} />;
}
