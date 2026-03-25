import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'grid' },
  { href: '/admin/quests', label: 'Qu\u00eates', icon: 'sword' },
  { href: '/admin/members', label: 'Membres', icon: 'users' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) redirect('/dashboard');

  const role = (profile as { role: string }).role;

  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      {/* Admin sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-ecs-black-light border-r border-ecs-gray-border">
        <div className="p-6 border-b border-ecs-gray-border">
          <h2 className="font-display text-lg font-bold text-white">
            Admin
          </h2>
          <p className="text-xs text-red-400 font-display uppercase tracking-wider mt-1">
            Panneau d&apos;administration
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-display text-ecs-gray hover:text-white hover:bg-ecs-black-card transition-colors"
            >
              {item.icon === 'grid' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              )}
              {item.icon === 'sword' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              )}
              {item.icon === 'users' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              )}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-ecs-gray-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-ecs-gray hover:text-white transition-colors font-display"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Retour au dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile admin header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-ecs-gray-border bg-ecs-black-light">
          <h2 className="font-display text-lg font-bold text-white">Admin</h2>
          <Link
            href="/dashboard"
            className="text-sm text-ecs-gray hover:text-white transition-colors"
          >
            Retour
          </Link>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 p-2 border-b border-ecs-gray-border bg-ecs-black-light overflow-x-auto">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 rounded-lg text-sm font-display text-ecs-gray hover:text-white hover:bg-ecs-black-card transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
