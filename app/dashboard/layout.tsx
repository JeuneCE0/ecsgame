import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from './DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('level, total_xp, current_streak, display_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <DashboardShell
      initialPlayer={{
        level: profile?.level ?? 1,
        totalXP: profile?.total_xp ?? 0,
        currentStreak: profile?.current_streak ?? 0,
      }}
    >
      {children}
    </DashboardShell>
  );
}
