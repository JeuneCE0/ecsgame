'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SocialActivity {
  id: string;
  type: 'deal_closed' | 'level_up' | 'quest_complete' | 'streak_milestone' | 'badge_earned';
  playerName: string;
  detail: string;
  /** Timestamp in ms */
  timestamp: number;
}

interface SocialProofProps {
  /** Number of currently active players */
  activePlayerCount: number;
  /** Feed of recent activities */
  activities: SocialActivity[];
  /** Whether new activities may arrive (realtime) */
  isLive?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Activity type config                                               */
/* ------------------------------------------------------------------ */

interface ActivityConfig {
  emoji: string;
  verb: string;
}

const ACTIVITY_MAP: Record<SocialActivity['type'], ActivityConfig> = {
  deal_closed: { emoji: '\uD83D\uDCB0', verb: 'a close un deal' },
  level_up: { emoji: '\u2B06\uFE0F', verb: 'est passe' },
  quest_complete: { emoji: '\u2705', verb: 'a termine une quete' },
  streak_milestone: { emoji: '\uD83D\uDD25', verb: 'a atteint un streak de' },
  badge_earned: { emoji: '\uD83C\uDFC5', verb: 'a debloque le badge' },
};

/* ------------------------------------------------------------------ */
/*  Relative time formatter                                            */
/* ------------------------------------------------------------------ */

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return "a l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;

  return `il y a ${Math.floor(hours / 24)}j`;
}

/* ------------------------------------------------------------------ */
/*  Ticker component                                                   */
/* ------------------------------------------------------------------ */

const TICKER_INTERVAL_MS = 4000;

function ActivityTicker({ activities }: { activities: SocialActivity[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activities.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, TICKER_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activities.length]);

  if (activities.length === 0) return null;

  const activity = activities[currentIndex];
  const config = ACTIVITY_MAP[activity.type];

  return (
    <div className="relative h-5 overflow-hidden flex-1">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${activity.id}-${currentIndex}`}
          className="absolute inset-0 flex items-center"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <span className="text-[11px] text-ecs-gray font-body truncate">
            <span className="mr-1">{config.emoji}</span>
            <span className="text-white/80 font-display font-bold">{activity.playerName}</span>
            {' '}{config.verb} {activity.detail}
            <span className="text-ecs-gray/40 ml-1.5">{formatRelativeTime(activity.timestamp)}</span>
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SocialProof({
  activePlayerCount,
  activities,
  isLive = false,
  className,
}: SocialProofProps) {
  const sortedActivities = [...activities].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-2.5 border border-ecs-gray-border/50',
        className,
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(12, 12, 12, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* Active players count */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Pulsing green dot */}
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-green-500"
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-ecs-gray/70" />
          <motion.span
            key={activePlayerCount}
            className="text-[11px] font-display font-bold text-white/80 tabular-nums"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {activePlayerCount}
          </motion.span>
          <span className="text-[10px] text-ecs-gray/50 font-display hidden sm:inline">
            actif{activePlayerCount > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-3.5 bg-ecs-gray-border/50 shrink-0" />

      {/* Activity ticker */}
      <ActivityTicker activities={sortedActivities} />

      {/* Live indicator */}
      {isLive && (
        <div className="flex items-center gap-1 shrink-0">
          <Zap className="h-3 w-3 text-ecs-amber/50" />
          <span className="text-[9px] font-display text-ecs-amber/40 uppercase tracking-wider">
            Live
          </span>
        </div>
      )}
    </motion.div>
  );
}
