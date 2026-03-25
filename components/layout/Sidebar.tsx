'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sword,
  Trophy,
  GraduationCap,
  Gift,
  Timer,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, LEVEL_TITLES } from '@/lib/constants';
import { useGameStore } from '@/stores/useGameStore';
import { usePlayerStore } from '@/stores/usePlayerStore';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Sword,
  Trophy,
  GraduationCap,
  Gift,
  Timer,
  User,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useGameStore();
  const { level } = usePlayerStore();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed left-0 top-0 z-50 flex h-screen w-60 flex-col',
              'bg-ecs-black border-r border-ecs-gray-border',
              'md:z-30'
            )}
          >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-5 border-b border-ecs-gray-border">
              <Image
                src="/logo.png"
                alt="ECS Game"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-display text-lg font-bold text-gradient-amber">
                ECS GAME
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = ICON_MAP[item.icon];
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'border-l-2 border-ecs-amber bg-ecs-amber/5 text-ecs-amber'
                            : 'text-ecs-gray hover:bg-ecs-black-light hover:text-white'
                        )}
                      >
                        {Icon && <Icon className="h-5 w-5 shrink-0" />}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom user section */}
            <div className="border-t border-ecs-gray-border px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ecs-black-card border border-ecs-gray-border">
                  <User className="h-4 w-4 text-ecs-gray" />
                </div>
                <div className="flex flex-col">
                  <span className="badge-level text-xs">
                    Niv. {level} — {LEVEL_TITLES[level] ?? 'Inconnu'}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Static spacer for desktop */}
      <div className="hidden md:block w-60 shrink-0" />
    </>
  );
}
