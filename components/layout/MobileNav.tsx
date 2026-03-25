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
  { href: '/dashboard/quests', label: 'Quetes', icon: Sword },
  { href: '/dashboard/leaderboard', label: 'Classement', icon: Trophy },
  { href: '/dashboard/formations', label: 'Formations', icon: GraduationCap },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'safe-bottom'
      )}
    >
      {/* Frosted glass container */}
      <div
        className={cn(
          'mx-3 mb-3 rounded-2xl',
          'bg-black/60 backdrop-blur-xl',
          'border border-white/[0.05]',
          'shadow-[0_-4px_24px_rgba(0,0,0,0.4)]'
        )}
      >
        <ul className="flex items-center justify-around px-1 py-2">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <li key={item.href} className="relative flex-1">
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl"
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute inset-1 rounded-xl bg-ecs-amber/[0.07]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Icon with scale on active */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Icon
                      className={cn(
                        'relative z-10 h-5 w-5 transition-all duration-200',
                        isActive
                          ? 'text-ecs-amber icon-glow-amber'
                          : 'text-ecs-gray'
                      )}
                    />
                  </motion.div>

                  {/* Label */}
                  <span
                    className={cn(
                      'relative z-10 text-[10px] font-medium leading-none transition-colors duration-200',
                      isActive ? 'text-ecs-amber' : 'text-ecs-gray'
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active dot indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-ecs-amber shadow-[0_0_6px_rgba(255,191,0,0.6)]"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
}
