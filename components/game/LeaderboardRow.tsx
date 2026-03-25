'use client';

import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
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

interface RankStyle {
  color: string;
  bgGlow: string;
  crownColor: string;
  borderColor: string;
  showCrown: boolean;
  label: string;
}

function getRankStyle(rank: number): RankStyle {
  switch (rank) {
    case 1:
      return {
        color: 'text-ecs-amber',
        bgGlow: 'rgba(255, 191, 0, 0.06)',
        crownColor: '#FFBF00',
        borderColor: 'rgba(255, 191, 0, 0.3)',
        showCrown: true,
        label: 'Or',
      };
    case 2:
      return {
        color: 'text-gray-300',
        bgGlow: 'rgba(192, 192, 192, 0.04)',
        crownColor: '#C0C0C0',
        borderColor: 'rgba(192, 192, 192, 0.25)',
        showCrown: true,
        label: 'Argent',
      };
    case 3:
      return {
        color: 'text-amber-700',
        bgGlow: 'rgba(180, 130, 60, 0.04)',
        crownColor: '#CD7F32',
        borderColor: 'rgba(205, 127, 50, 0.25)',
        showCrown: true,
        label: 'Bronze',
      };
    default:
      return {
        color: 'text-ecs-gray',
        bgGlow: 'transparent',
        crownColor: 'transparent',
        borderColor: 'rgba(42, 42, 42, 1)',
        showCrown: false,
        label: '',
      };
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
  const isTopThree = rank <= 3;

  return (
    <motion.div
      className={cn(
        'relative flex items-center gap-4 rounded-xl border p-4 transition-colors overflow-hidden',
        isCurrentUser && 'animate-border-glow',
        isTopThree ? 'border-opacity-100' : 'border-ecs-gray-border'
      )}
      style={{
        borderColor: isCurrentUser
          ? 'rgba(255, 191, 0, 0.4)'
          : rankStyle.borderColor,
        background: isCurrentUser
          ? 'linear-gradient(135deg, rgba(255, 191, 0, 0.06) 0%, rgba(26, 26, 26, 1) 100%)'
          : `linear-gradient(135deg, ${rankStyle.bgGlow} 0%, #1A1A1A 100%)`,
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.05 }}
      whileHover={{
        scale: 1.015,
        x: 6,
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }}
    >
      {/* Subtle top-3 glow line on left */}
      {isTopThree && (
        <div
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
          style={{
            background: `linear-gradient(180deg, ${rankStyle.crownColor}, transparent)`,
            boxShadow: `0 0 8px ${rankStyle.crownColor}40`,
          }}
        />
      )}

      {/* Rank number + Crown */}
      <div className="flex flex-col items-center w-10 shrink-0">
        {rankStyle.showCrown && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Crown
              className="h-4 w-4 mb-0.5"
              style={{
                color: rankStyle.crownColor,
                filter: `drop-shadow(0 0 4px ${rankStyle.crownColor}60)`,
              }}
            />
          </motion.div>
        )}
        <span
          className={cn(
            'font-display font-bold text-xl leading-none',
            rankStyle.color
          )}
          style={isTopThree ? {
            textShadow: `0 0 10px ${rankStyle.crownColor}40`,
          } : undefined}
        >
          {rank}
        </span>
      </div>

      {/* Avatar */}
      <AvatarDisplay
        avatarUrl={avatarUrl}
        name={name}
        size="sm"
      />

      {/* Name + Level */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-display font-bold truncate text-base',
            isCurrentUser ? 'text-ecs-amber' : 'text-white'
          )}
        >
          {name}
          {isCurrentUser && (
            <span className="text-xs ml-2 font-normal text-ecs-amber/60">(vous)</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <LevelBadge level={level} size="sm" />
        </div>
      </div>

      {/* XP with animated reveal */}
      <div className="text-right shrink-0">
        <motion.p
          className="font-display font-bold text-white text-base"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + rank * 0.05 }}
        >
          <span className="text-gradient-amber">{formatXP(totalXP)}</span>
          <span className="text-xs text-ecs-gray ml-1">XP</span>
        </motion.p>
        <motion.p
          className="text-xs text-ecs-gray mt-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + rank * 0.05 }}
        >
          +{formatXP(weeklyXP)} cette semaine
        </motion.p>
      </div>
    </motion.div>
  );
}
