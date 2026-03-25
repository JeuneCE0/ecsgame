'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { AvatarDisplay } from '@/components/game/AvatarDisplay';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatarUrl?: string;
  totalXP: number;
  previousRank?: number;
}

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  fullLeaderboardHref?: string;
}

function getRankMedal(rank: number): { color: string; bgColor: string; borderColor: string } | null {
  switch (rank) {
    case 1:
      return {
        color: '#FFBF00',
        bgColor: 'rgba(255, 191, 0, 0.12)',
        borderColor: 'rgba(255, 191, 0, 0.25)',
      };
    case 2:
      return {
        color: '#C0C0C0',
        bgColor: 'rgba(192, 192, 192, 0.1)',
        borderColor: 'rgba(192, 192, 192, 0.2)',
      };
    case 3:
      return {
        color: '#CD7F32',
        bgColor: 'rgba(205, 127, 50, 0.1)',
        borderColor: 'rgba(205, 127, 50, 0.2)',
      };
    default:
      return null;
  }
}

function RankChangeIndicator({ currentRank, previousRank }: { currentRank: number; previousRank: number }) {
  const diff = previousRank - currentRank;

  if (diff === 0) return null;

  const isUp = diff > 0;

  return (
    <motion.span
      className={cn(
        'text-[10px] font-display font-bold',
        isUp ? 'text-green-500' : 'text-red-500'
      )}
      initial={{ opacity: 0, y: isUp ? 6 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    >
      {isUp ? `+${diff}` : diff}
    </motion.span>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
  index,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  index: number;
}) {
  const medal = getRankMedal(entry.rank);

  return (
    <motion.div
      layout
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors',
        'border',
        isCurrentUser
          ? 'border-ecs-amber/20'
          : 'border-transparent hover:border-white/[0.04]'
      )}
      style={{
        background: isCurrentUser
          ? 'linear-gradient(135deg, rgba(255, 191, 0, 0.06) 0%, rgba(26, 26, 26, 0.8) 100%)'
          : 'transparent',
      }}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{
        x: 3,
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }}
    >
      {/* Rank number */}
      <div className="w-7 shrink-0 flex flex-col items-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={entry.rank}
            className={cn(
              'font-display font-bold text-sm leading-none',
              medal ? '' : 'text-ecs-gray'
            )}
            style={medal ? { color: medal.color } : undefined}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            {entry.rank}
          </motion.span>
        </AnimatePresence>
        {entry.previousRank !== undefined && (
          <RankChangeIndicator
            currentRank={entry.rank}
            previousRank={entry.previousRank}
          />
        )}
      </div>

      {/* Avatar mini */}
      <AvatarDisplay
        avatarUrl={entry.avatarUrl}
        name={entry.name}
        size="sm"
      />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-display text-sm font-bold truncate',
            isCurrentUser ? 'text-ecs-amber' : 'text-white/90'
          )}
        >
          {entry.name}
          {isCurrentUser && (
            <span className="text-[10px] font-normal text-ecs-amber/50 ml-1">
              (vous)
            </span>
          )}
        </p>
      </div>

      {/* XP */}
      <div className="shrink-0 text-right">
        <motion.span
          key={entry.totalXP}
          className={cn(
            'font-display text-sm font-bold',
            isCurrentUser ? 'text-gradient-amber' : 'text-white/70'
          )}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatXP(entry.totalXP)}
        </motion.span>
        <span className="text-[10px] text-ecs-gray ml-0.5">XP</span>
      </div>
    </motion.div>
  );
}

export function MiniLeaderboard({
  entries,
  currentUserId,
  fullLeaderboardHref = '/dashboard/leaderboard',
}: MiniLeaderboardProps) {
  const topFive = entries.slice(0, 5);
  const currentUserInTop = topFive.some((e) => e.id === currentUserId);
  const currentUserEntry = entries.find((e) => e.id === currentUserId);

  return (
    <div
      className="rounded-xl border border-ecs-gray-border p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-ecs-amber" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
            Classement
          </h3>
        </div>
      </div>

      {/* Top 5 list */}
      <div className="space-y-1">
        {topFive.map((entry, index) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            isCurrentUser={entry.id === currentUserId}
            index={index}
          />
        ))}
      </div>

      {/* Current user position (if not in top 5) */}
      {!currentUserInTop && currentUserEntry && (
        <>
          <div className="flex items-center justify-center my-2">
            <div className="flex items-center gap-1">
              <div className="h-[1px] w-6 bg-ecs-gray-border" />
              <span className="text-[9px] text-ecs-gray/50 font-display">...</span>
              <div className="h-[1px] w-6 bg-ecs-gray-border" />
            </div>
          </div>
          <LeaderboardRow
            entry={currentUserEntry}
            isCurrentUser
            index={5}
          />
        </>
      )}

      {/* View all link */}
      <Link
        href={fullLeaderboardHref}
        className="group flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-ecs-gray-border/50"
      >
        <span className="text-xs font-display font-bold uppercase tracking-wider text-ecs-amber/70 group-hover:text-ecs-amber transition-colors">
          Voir tout
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-ecs-amber/50 group-hover:text-ecs-amber group-hover:translate-x-0.5 transition-all" />
      </Link>
    </div>
  );
}
