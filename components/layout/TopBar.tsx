'use client';

import { motion } from 'framer-motion';
import { Flame, Menu, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';
import { LEVEL_TITLES } from '@/lib/constants';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useGameStore } from '@/stores/useGameStore';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { NotificationBell } from '@/components/game/NotificationCenter';
import { useGameSounds } from '@/hooks/useGameSounds';

function getPageTitle(pathname: string): string {
  const item = NAV_ITEMS.find(
    (nav) =>
      pathname === nav.href ||
      (nav.href !== '/dashboard' && pathname.startsWith(nav.href))
  );
  return item?.label ?? 'Dashboard';
}

export default function TopBar() {
  const pathname = usePathname();
  const { level, totalXP, currentStreak } = usePlayerStore();
  const { toggleSidebar } = useGameStore();
  const { toggleMute, isMuted } = useGameSounds();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'flex h-14 items-center justify-between gap-4 px-4 md:px-6',
          'rounded-2xl',
          'bg-black/50 backdrop-blur-xl',
          'border border-white/[0.04]',
          'shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
        )}
      >
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl',
              'text-ecs-gray hover:text-white',
              'bg-white/[0.03] hover:bg-white/[0.06]',
              'transition-colors duration-200 md:hidden'
            )}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          <motion.h1
            key={pageTitle}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-lg font-bold tracking-wide text-white/90"
          >
            {pageTitle}
          </motion.h1>
        </div>

        {/* Right: streak, XP, level badge, avatar */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Streak counter with flame */}
          {currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={cn(
                'relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl',
                'bg-ecs-amber/[0.06] border border-ecs-amber/10'
              )}
            >
              {/* Animated particle dots */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-3 pointer-events-none">
                <span className="particle-dot" />
                <span className="particle-dot" />
                <span className="particle-dot" />
              </div>

              <div className="relative animate-flame">
                <Flame className="h-4 w-4 text-ecs-amber icon-glow-amber" />
              </div>
              <span className="text-sm font-display font-bold text-ecs-amber">
                {currentStreak}
              </span>
            </motion.div>
          )}

          {/* XP display with animated counter feel */}
          <motion.div
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl',
              'bg-white/[0.03] border border-white/[0.04]'
            )}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Sparkles className="h-3.5 w-3.5 text-ecs-orange icon-glow-amber" />
            <motion.span
              key={totalXP}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-sm font-display font-semibold text-white/80"
            >
              {formatXP(totalXP)}
              <span className="text-ecs-gray ml-0.5 text-xs">XP</span>
            </motion.span>
          </motion.div>

          {/* Level: hexagonal badge */}
          <motion.div
            className="relative flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="relative flex h-9 w-9 items-center justify-center">
              {/* Hex background */}
              <div className="hex-badge absolute inset-0 bg-gradient-to-br from-ecs-amber/25 to-ecs-orange/15" />
              <div className="hex-badge absolute inset-[1.5px] bg-[#111111]" />
              <span className="relative z-10 font-display text-xs font-bold text-ecs-amber">
                {level}
              </span>
            </div>
            <span className="hidden lg:block text-xs font-display font-medium text-white/50">
              {LEVEL_TITLES[level] ?? 'Inconnu'}
            </span>
          </motion.div>

          {/* Sound mute toggle */}
          <motion.button
            type="button"
            onClick={toggleMute}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl',
              'bg-white/[0.03] hover:bg-white/[0.06]',
              'border border-white/[0.04] hover:border-white/[0.06]',
              'text-ecs-gray hover:text-white',
              'transition-colors duration-200'
            )}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? (
              <VolumeX className="h-[18px] w-[18px]" />
            ) : (
              <Volume2 className="h-[18px] w-[18px]" />
            )}
          </motion.button>

          {/* Notification bell */}
          <NotificationBell />

          {/* Avatar with status ring */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="relative"
          >
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full',
                'bg-gradient-to-br from-ecs-black-card to-ecs-black-light',
                'border border-white/[0.06]',
                'status-ring-amber',
                'cursor-pointer'
              )}
            >
              <span className="font-display text-xs font-bold text-gradient-amber">
                {level}
              </span>
            </div>
            {/* Online indicator dot */}
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#111111]" />
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}
