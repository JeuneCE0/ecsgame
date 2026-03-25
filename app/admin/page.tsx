import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './admin-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  // Active today
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count: activeToday } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gte('last_active_date', todayStart.toISOString().split('T')[0]);

  // Total XP awarded
  const { data: xpTotal } = await supabase
    .from('xp_events')
    .select('amount')
    .in('verification_status', ['auto_verified', 'approved']);

  const totalXPAwarded = (xpTotal as { amount: number }[] ?? []).reduce(
    (sum, e) => sum + e.amount,
    0
  );

  // Pending reviews
  const { count: pendingReviews } = await supabase
    .from('xp_events')
    .select('id', { count: 'exact', head: true })
    .eq('verification_status', 'pending_review');

  // Recent pending XP events
  const { data: pendingEvents } = await supabase
    .from('xp_events')
    .select('id, user_id, source, amount, description, verification_status, created_at')
    .eq('verification_status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(10);

  type PendingEvent = {
    id: string;
    user_id: string;
    source: string;
    amount: number;
    description: string | null;
    verification_status: string;
    created_at: string;
  };

  return (
    <AdminDashboardClient
      stats={{
        totalUsers: totalUsers ?? 0,
        activeToday: activeToday ?? 0,
        totalXPAwarded,
        pendingReviews: pendingReviews ?? 0,
      }}
      pendingEvents={(pendingEvents ?? []) as PendingEvent[]}
    />
  );
}
