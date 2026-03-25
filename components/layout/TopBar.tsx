'use client';

import { Flame, Menu, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';
import { LEVEL_TITLES } from '@/lib/constants';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useGameStore } from '@/stores/useGameStore';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';

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
  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center justify-between gap-4 px-4 md:px-8',
        'bg-ecs-black-light/80 backdrop-blur-lg border-b border-ecs-gray-border'
      )}
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ecs-gray hover:bg-ecs-black-card hover:text-white transition-colors md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-lg font-bold tracking-wide">
          {pageTitle}
        </h1>
      </div>

      {/* Right: streak, XP, level, avatar */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Streak counter */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Flame className="h-4 w-4 text-ecs-amber" />
            <span className="text-ecs-amber">{currentStreak}</span>
          </div>
        )}

        {/* XP display */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ecs-gray">
          <Sparkles className="h-4 w-4 text-ecs-orange" />
          <span>{formatXP(totalXP)} XP</span>
        </div>

        {/* Level badge */}
        <span className="badge-level text-xs">
          Niv. {level}
          <span className="hidden sm:inline">
            {' '}— {LEVEL_TITLES[level] ?? 'Inconnu'}
          </span>
        </span>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ecs-black-card border border-ecs-gray-border">
          <span className="text-xs font-display font-bold text-ecs-amber">
            {level}
          </span>
        </div>
      </div>
    </header>
  );
}
