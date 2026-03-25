import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorldClient from './world-client';

export const dynamic = 'force-dynamic';

export default async function WorldPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('level, total_xp, business_type, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return (
    <WorldClient
      userId={user.id}
      level={profile.level ?? 1}
      totalXP={profile.total_xp ?? 0}
      businessType={profile.business_type ?? 'freelance'}
      fullName={profile.full_name ?? 'Entrepreneur'}
    />
  );
}
