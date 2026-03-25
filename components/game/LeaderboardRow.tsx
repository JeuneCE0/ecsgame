'use client';

import { motion } from 'framer-motion';
import { cn, formatXP } from '@/lib/utils';
import { LevelBadge } from '@/components/game/LevelBadge';
import { AvatarDisplay } from '@/components/game/AvatarDisplay';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  weeklyXP: number;
  isCurrentUser?: boolean;
}

function getRankStyle(rank: number): { color: string; glow: string } {
  switch (rank) {
    case 1:
      return { color: 'text-ecs-amber', glow: 'shadow-amber-glow' };
    case 2:
      return { color: 'text-gray-300', glow: 'shadow-[0_0_12px_rgba(192,192,192,0.15)]' };
    case 3:
      return { color: 'text-amber-700', glow: 'shadow-[0_0_12px_rgba(180,130,60,0.15)]' };
    default:
      return { color: 'text-ecs-gray', glow: '' };
  }
}

export function LeaderboardRow({
  rank,
  name,
  avatarUrl,
  level,
  totalXP,
  weeklyXP,
  isCurrentUser = false,
}: LeaderboardRowProps) {
  const rankStyle = getRankStyle(rank);

  return (
    <motion.div
      className={cn(
        'flex items-center gap-4 rounded-lg border p-4 transition-colors',
        isCurrentUser
          ? 'border-ecs-amber/40 bg-ecs-amber/[0.04]'
          : 'border-ecs-gray-border bg-ecs-black-card',
        rank <= 3 && rankStyle.glow
      )}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span
        className={cn(
          'w-8 text-center font-display font-bold text-lg',
          rankStyle.color
        )}
      >
        {rank}
      </span>

      <AvatarDisplay
        avatarUrl={avatarUrl}
        name={name}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <p className={cn('font-display font-bold truncate', isCurrentUser && 'text-ecs-amber')}>
          {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <LevelBadge level={level} size="sm" />
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-display font-bold text-white">
          {formatXP(totalXP)} <span className="text-xs text-ecs-gray">XP</span>
        </p>
        <p className="text-xs text-ecs-gray">
          +{formatXP(weeklyXP)} cette semaine
        </p>
      </div>
    </motion.div>
  );
}
