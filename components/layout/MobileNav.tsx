'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Sword,
  Trophy,
  GraduationCap,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV_ITEMS: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
}> = [
  { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
  { href: '/dashboard/quests', label: 'Quêtes', icon: Sword },
  { href: '/dashboard/leaderboard', label: 'Classement', icon: Trophy },
  { href: '/dashboard/formations', label: 'Formations', icon: GraduationCap },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'bg-ecs-black-light border-t border-ecs-gray-border',
        'safe-bottom'
      )}
    >
      <ul className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                  isActive ? 'text-ecs-amber' : 'text-ecs-gray'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 rounded-lg bg-ecs-amber/5"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10 text-[10px] font-medium leading-none">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
