'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Gift, Lock, Trophy } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SeasonMilestone {
  id: string;
  label: string;
  xp: number;
  /** Position 0–100 on the progress bar */
  position: number;
  icon: 'star' | 'gift' | 'trophy';
  unlocked: boolean;
}

interface SeasonBannerProps {
  seasonName: string;
  seasonSubtitle: string;
  /** 0–100 */
  progress: number;
  /** End timestamp in ms */
  seasonEndTimestamp: number;
  milestones: SeasonMilestone[];
  /** Gradient theme colors [start, mid, end] */
  themeColors?: [string, string, string];
}

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const MILESTONE_ICONS = {
  star: Star,
  gift: Gift,
  trophy: Trophy,
} as const;

/* ------------------------------------------------------------------ */
/*  Countdown                                                          */
/* ------------------------------------------------------------------ */

function formatSeasonCountdown(seconds: number): string {
  if (seconds <= 0) return 'Terminee';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}j ${hours}h restants`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m restants`;
}

/* ------------------------------------------------------------------ */
/*  Milestone marker                                                   */
/* ------------------------------------------------------------------ */

function MilestoneMarker({ milestone, progress }: { milestone: SeasonMilestone; progress: number }) {
  const Icon = MILESTONE_ICONS[milestone.icon];
  const reached = progress >= milestone.position;

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
      style={{ left: `${milestone.position}%` }}
    >
      <motion.div
        className="relative group"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
      >
        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <div
            className="rounded-lg px-2.5 py-1.5 whitespace-nowrap"
            style={{
              background: 'rgba(20, 20, 20, 0.95)',
              border: '1px solid rgba(255, 191, 0, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p className="text-[10px] font-display font-bold text-white">{milestone.label}</p>
            <p className="text-[9px] font-display text-ecs-amber">+{formatXP(milestone.xp)} XP</p>
          </div>
        </div>

        {/* Marker circle */}
        <div
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all',
            reached
              ? 'border-ecs-amber bg-ecs-amber/20'
              : 'border-ecs-gray-dark bg-ecs-black-light'
          )}
          style={
            reached
              ? { boxShadow: '0 0 10px rgba(255, 191, 0, 0.3)' }
              : undefined
          }
        >
          {reached ? (
            <Icon className="h-3 w-3 text-ecs-amber" />
          ) : (
            <Lock className="h-2.5 w-2.5 text-ecs-gray/40" />
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SeasonBanner({
  seasonName,
  seasonSubtitle,
  progress,
  seasonEndTimestamp,
  milestones,
  themeColors = ['#FFBF00', '#FF9D00', '#FF8800'],
}: SeasonBannerProps) {
  const [remaining, setRemaining] = useState(0);

  const computeRemaining = useCallback(() => {
    const diff = Math.max(0, Math.floor((seasonEndTimestamp - Date.now()) / 1000));
    setRemaining(diff);
  }, [seasonEndTimestamp]);

  useEffect(() => {
    computeRemaining();
    const interval = setInterval(computeRemaining, 60000);
    return () => clearInterval(interval);
  }, [computeRemaining]);

  /* Animated gradient background keyframes */
  const gradientStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${themeColors[0]}08 0%, ${themeColors[1]}05 50%, ${themeColors[2]}03 100%)`,
    }),
    [themeColors]
  );

  const barGradient = useMemo(
    () => `linear-gradient(90deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})`,
    [themeColors]
  );

  return (
    <motion.div
      className="relative rounded-xl border border-ecs-gray-border overflow-hidden"
      style={gradientStyle}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 100% at 0% 0%, ${themeColors[0]}0A 0%, transparent 50%),
            radial-gradient(ellipse 40% 80% at 100% 100%, ${themeColors[2]}08 0%, transparent 50%)
          `,
        }}
      />

      {/* Moving gradient shimmer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${themeColors[0]}06 30%, ${themeColors[1]}08 50%, ${themeColors[2]}06 70%, transparent 100%)`,
            width: '200%',
          }}
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 p-5">
        {/* Top row: Season info + countdown */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.p
              className="text-[10px] font-display uppercase tracking-[0.25em] mb-1"
              style={{ color: themeColors[0], opacity: 0.7 }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {seasonSubtitle}
            </motion.p>
            <motion.h3
              className="font-display font-bold text-lg text-white leading-tight"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              style={{ textShadow: `0 0 20px ${themeColors[0]}30` }}
            >
              {seasonName}
            </motion.h3>
          </div>

          <motion.div
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 border"
            style={{
              background: 'rgba(12, 12, 12, 0.6)',
              borderColor: `${themeColors[0]}20`,
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Clock className="h-3 w-3" style={{ color: themeColors[0] }} />
            <span className="text-xs font-mono font-bold text-white tabular-nums">
              {formatSeasonCountdown(remaining)}
            </span>
          </motion.div>
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          {/* Labels */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-ecs-gray font-display">Progression saison</span>
            <span className="font-display font-bold" style={{ color: themeColors[0] }}>
              {progress}%
            </span>
          </div>

          {/* Progress bar with milestones */}
          <div className="relative">
            {/* Bar track */}
            <div
              className="h-3 rounded-full overflow-hidden relative"
              style={{
                background: 'rgba(26, 26, 26, 0.8)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              {/* Fill */}
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background: barGradient,
                  boxShadow: `0 0 12px ${themeColors[0]}40`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 60, damping: 18, delay: 0.3 }}
              >
                {/* Shimmer */}
                <div
                  className="absolute inset-0 animate-shimmer-sweep"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    width: '40%',
                  }}
                />

                {/* Top highlight */}
                <div
                  className="absolute inset-x-0 top-0 h-[2px] rounded-full"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                  }}
                />
              </motion.div>
            </div>

            {/* Milestone markers */}
            {milestones.map((milestone) => (
              <MilestoneMarker
                key={milestone.id}
                milestone={milestone}
                progress={progress}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
