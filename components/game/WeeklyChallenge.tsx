'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, CheckCircle, Gift, Star, Target } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xpReward: number;
  completed: boolean;
}

interface CompletionReward {
  id: string;
  label: string;
  xp: number;
  threshold: number;
  icon: 'star' | 'trophy' | 'gift';
}

interface WeeklyChallengeProps {
  challenges: Challenge[];
  /** End timestamp in ms */
  weekEndTimestamp: number;
  completionRewards?: CompletionReward[];
}

/* ------------------------------------------------------------------ */
/*  Countdown formatter                                                */
/* ------------------------------------------------------------------ */

function formatWeeklyCountdown(seconds: number): string {
  if (seconds <= 0) return '0j 0h 0m';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}j ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

/* ------------------------------------------------------------------ */
/*  Challenge row                                                      */
/* ------------------------------------------------------------------ */

function ChallengeRow({ challenge, index }: { challenge: Challenge; index: number }) {
  const percent =
    challenge.maxProgress > 0
      ? Math.min(100, Math.round((challenge.progress / challenge.maxProgress) * 100))
      : 0;

  return (
    <motion.div
      className={cn(
        'relative rounded-xl p-4 border transition-all',
        challenge.completed
          ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
          : 'border-ecs-gray-border bg-ecs-black-card/50'
      )}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Completed shimmer */}
      {challenge.completed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div
            className="absolute inset-0 animate-shimmer-sweep"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.06) 50%, transparent 100%)',
              width: '50%',
            }}
          />
        </div>
      )}

      <div className="relative z-10">
        {/* Top row: title + XP */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Animated check */}
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full shrink-0 border transition-all',
                challenge.completed
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-ecs-gray-border bg-ecs-black-light'
              )}
            >
              <AnimatePresence mode="wait">
                {challenge.completed ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="target"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Target className="h-4 w-4 text-ecs-gray/50" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'font-display font-bold text-sm leading-tight',
                  challenge.completed ? 'text-emerald-400' : 'text-white'
                )}
              >
                {challenge.title}
              </h4>
              <p className="text-xs text-ecs-gray mt-0.5 line-clamp-1">
                {challenge.description}
              </p>
            </div>
          </div>

          {/* XP reward */}
          <span
            className={cn(
              'text-xs font-display font-bold shrink-0',
              challenge.completed ? 'text-emerald-400' : 'text-gradient-amber'
            )}
          >
            +{formatXP(challenge.xpReward)} XP
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-ecs-gray font-display">
              {challenge.progress} / {challenge.maxProgress}
            </span>
            <span
              className={cn(
                'font-display font-bold',
                challenge.completed ? 'text-emerald-400' : 'text-ecs-amber'
              )}
            >
              {percent}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: '#1A1A1A', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: challenge.completed
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                boxShadow: challenge.completed
                  ? '0 0 6px rgba(34, 197, 94, 0.4)'
                  : '0 0 6px rgba(255, 191, 0, 0.3)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reward card                                                        */
/* ------------------------------------------------------------------ */

const REWARD_ICONS = {
  star: Star,
  trophy: Trophy,
  gift: Gift,
} as const;

function RewardCard({ reward, unlocked }: { reward: CompletionReward; unlocked: boolean }) {
  const Icon = REWARD_ICONS[reward.icon];

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl p-3 border transition-all',
        unlocked
          ? 'border-ecs-amber/30 bg-ecs-amber/[0.04]'
          : 'border-ecs-gray-border/40 bg-ecs-black-light/30 opacity-50'
      )}
      style={
        unlocked
          ? { boxShadow: '0 0 12px rgba(255, 191, 0, 0.1)' }
          : undefined
      }
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: unlocked ? 1 : 0.5, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          unlocked ? '' : 'grayscale'
        )}
        style={
          unlocked
            ? {
                background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                boxShadow: '0 0 10px rgba(255, 191, 0, 0.3)',
              }
            : { background: '#333333' }
        }
      >
        <Icon className={cn('h-4 w-4', unlocked ? 'text-ecs-black' : 'text-ecs-gray/50')} />
      </div>
      <span
        className={cn(
          'text-[10px] font-display font-bold text-center leading-tight',
          unlocked ? 'text-ecs-amber' : 'text-ecs-gray/40'
        )}
      >
        {reward.label}
      </span>
      <span
        className={cn(
          'text-[9px] font-display',
          unlocked ? 'text-ecs-amber/60' : 'text-ecs-gray/30'
        )}
      >
        +{formatXP(reward.xp)} XP
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function WeeklyChallenge({ challenges, weekEndTimestamp, completionRewards = [] }: WeeklyChallengeProps) {
  const [remaining, setRemaining] = useState(0);

  /* Update remaining time */
  const computeRemaining = useCallback(() => {
    const diff = Math.max(0, Math.floor((weekEndTimestamp - Date.now()) / 1000));
    setRemaining(diff);
  }, [weekEndTimestamp]);

  useEffect(() => {
    computeRemaining();
    const interval = setInterval(computeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [computeRemaining]);

  /* Overall progress */
  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;
  const overallPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalXP = challenges.reduce((sum, c) => sum + c.xpReward, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="rounded-xl border border-ecs-gray-border p-5 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 191, 0, 0.03) 0%, #1A1A1A 40%, #141414 100%)',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 20%, rgba(255, 191, 0, 0.04) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10">
          {/* Title row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.12), rgba(255, 157, 0, 0.06))',
                  border: '1px solid rgba(255, 191, 0, 0.2)',
                }}
              >
                <Trophy className="h-4.5 w-4.5 text-ecs-amber icon-glow-amber" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base leading-tight">
                  Defi de la semaine
                </h3>
                <p className="text-[10px] text-ecs-gray font-display uppercase tracking-wider mt-0.5">
                  {completedCount}/{totalCount} termines — {formatXP(totalXP)} XP total
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="h-3.5 w-3.5 text-ecs-gray" />
              <span className="text-xs font-mono font-bold text-white tabular-nums">
                {formatWeeklyCountdown(remaining)}
              </span>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-ecs-gray font-display">Progression globale</span>
              <span className="font-display font-bold text-gradient-amber">{overallPercent}%</span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden relative"
              style={{
                background: '#1A1A1A',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background:
                    overallPercent === 100
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                  boxShadow:
                    overallPercent === 100
                      ? '0 0 10px rgba(34, 197, 94, 0.4)'
                      : '0 0 10px rgba(255, 191, 0, 0.3)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${overallPercent}%` }}
                transition={{ type: 'spring', stiffness: 60, damping: 18 }}
              >
                <div
                  className="absolute inset-0 animate-shimmer-sweep"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    width: '50%',
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge rows */}
      <div className="space-y-2.5">
        {challenges.map((challenge, i) => (
          <ChallengeRow key={challenge.id} challenge={challenge} index={i} />
        ))}
      </div>

      {/* Completion rewards */}
      {completionRewards.length > 0 && (
        <div>
          <p className="text-[10px] font-display uppercase tracking-[0.2em] text-ecs-gray mb-3">
            Recompenses de completion
          </p>
          <div className="grid grid-cols-3 gap-2">
            {completionRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                unlocked={completedCount >= reward.threshold}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
