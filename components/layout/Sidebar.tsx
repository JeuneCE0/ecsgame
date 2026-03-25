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

/* XP thresholds per level for the mini XP bar */
const LEVEL_XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 200,
  3: 500,
  4: 1000,
  5: 2000,
  6: 3500,
  7: 5500,
  8: 8000,
  9: 12000,
  10: 17000,
  11: 24000,
  12: 33000,
  13: 45000,
  14: 60000,
  15: 80000,
};

function getXPProgress(level: number, totalXP: number): number {
  const currentThreshold = LEVEL_XP_THRESHOLDS[level] ?? 0;
  const nextThreshold = LEVEL_XP_THRESHOLDS[level + 1] ?? currentThreshold + 5000;
  if (nextThreshold <= currentThreshold) return 100;
  return Math.min(100, ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
}

/* Stagger animation variants */
const navContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.15,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useGameStore();
  const { level, totalXP } = usePlayerStore();
  const xpProgress = getXPProgress(level, totalXP);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={cn(
              'fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col',
              'bg-black/60 backdrop-blur-xl',
              'border-r border-white/[0.04]',
              'md:z-30'
            )}
          >
            {/* Sidebar inner glow accent */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-2xl">
              <div className="absolute -left-20 top-0 h-40 w-40 rounded-full bg-ecs-amber/[0.04] blur-[60px]" />
              <div className="absolute -left-10 bottom-20 h-32 w-32 rounded-full bg-ecs-orange/[0.03] blur-[50px]" />
            </div>

            {/* Logo area */}
            <div className="relative flex h-[72px] items-center gap-3.5 px-6 border-b border-white/[0.04]">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Image
                  src="/logo.png"
                  alt="ECS Game"
                  width={40}
                  height={40}
                  className="relative z-10 rounded-xl"
                />
                {/* Ambient glow behind logo */}
                <div className="absolute inset-0 rounded-xl bg-ecs-amber/20 blur-lg glow-pulse" />
              </motion.div>
              <span className="font-display text-lg font-bold tracking-wide text-gradient-amber-animated">
                ECS GAME
              </span>
            </div>

            {/* Navigation */}
            <nav className="relative flex-1 overflow-y-auto px-3 py-5">
              <motion.ul
                className="flex flex-col gap-1"
                variants={navContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {NAV_ITEMS.map((item) => {
                  const Icon = ICON_MAP[item.icon];
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <motion.li key={item.href} variants={navItemVariants}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setSidebarOpen(false);
                          }
                        }}
                        className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                      >
                        {/* Active state: amber gradient left border + glowing bg */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-xl"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          >
                            {/* Left accent bar */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-gradient-to-b from-ecs-amber to-ecs-orange shadow-[0_0_8px_rgba(255,191,0,0.5)]" />
                            {/* Background glow */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-ecs-amber/[0.08] via-ecs-amber/[0.03] to-transparent" />
                          </motion.div>
                        )}

                        {/* Hover reveal (non-active) */}
                        {!isActive && (
                          <div className="absolute inset-0 rounded-xl bg-white/[0.02] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        )}

                        {/* Icon */}
                        {Icon && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                          >
                            <Icon
                              className={cn(
                                'relative z-10 h-5 w-5 shrink-0 transition-all duration-200',
                                isActive
                                  ? 'text-ecs-amber icon-glow-amber'
                                  : 'text-ecs-gray group-hover:text-white/80'
                              )}
                            />
                          </motion.div>
                        )}

                        {/* Label */}
                        <span
                          className={cn(
                            'relative z-10 transition-colors duration-200',
                            isActive
                              ? 'text-ecs-amber'
                              : 'text-ecs-gray group-hover:text-white/80'
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </nav>

            {/* Bottom: Level badge + XP bar */}
            <div className="relative border-t border-white/[0.04] px-4 py-5">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {/* Level hex badge */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                  <div className="hex-badge absolute inset-0 bg-gradient-to-br from-ecs-amber/20 to-ecs-orange/10" />
                  <div className="hex-badge absolute inset-[2px] bg-ecs-black" />
                  <span className="relative z-10 font-display text-sm font-bold text-ecs-amber">
                    {level}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-semibold text-white/80 truncate">
                      {LEVEL_TITLES[level] ?? 'Inconnu'}
                    </span>
                    <span className="text-[10px] font-medium text-ecs-gray ml-2 shrink-0">
                      Niv. {level}
                    </span>
                  </div>

                  {/* XP mini-bar */}
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-ecs-amber to-ecs-orange"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Static spacer for desktop */}
      <div className="hidden md:block w-[260px] shrink-0" />
    </>
  );
}
