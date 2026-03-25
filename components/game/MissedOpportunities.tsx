'use client';

import { useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, CalendarX, Flame, ListChecks } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MissedBreakdown {
  /** XP from uncompleted quests */
  uncompletedQuestsXP: number;
  /** XP from missed daily bonuses */
  missedDailyBonusXP: number;
  /** XP lost from inactive days */
  inactiveDaysXP: number;
  /** Number of inactive days this week */
  inactiveDays: number;
  /** Number of uncompleted quests */
  uncompletedQuests: number;
}

interface MissedOpportunitiesProps {
  /** Total XP actually earned this week */
  earnedXP: number;
  /** Total potential XP this week */
  potentialXP: number;
  /** Breakdown of missed XP */
  breakdown: MissedBreakdown;
  /** Day of the week (1=Mon, 7=Sun) */
  dayOfWeek: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Dual-ring SVG                                                      */
/* ------------------------------------------------------------------ */

function PotentialRing({
  earned,
  potential,
  size = 100,
  strokeWidth = 7,
}: {
  earned: number;
  potential: number;
  size?: number;
  strokeWidth?: number;
}) {
  const gradientId = useId();
  const glowId = useId();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const earnedPercent = potential > 0 ? Math.min(earned / potential, 1) : 0;
  const earnedOffset = circumference * (1 - earnedPercent);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFBF00" />
            <stop offset="100%" stopColor="#FF9D00" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Background track (potential — gray) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(42, 42, 42, 0.5)"
          strokeWidth={strokeWidth}
        />

        {/* Glow under earned arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth + 3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={`url(#${glowId})`}
          opacity={0.35}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: earnedOffset }}
          transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        />

        {/* Earned arc (amber) */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: earnedOffset }}
          transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg font-bold text-gradient-amber leading-none">
          {Math.round(earnedPercent * 100)}%
        </span>
        <span className="text-[9px] text-ecs-gray font-display uppercase tracking-wider mt-0.5">
          du potentiel
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Breakdown row                                                      */
/* ------------------------------------------------------------------ */

interface BreakdownRowProps {
  icon: typeof Target;
  label: string;
  xp: number;
  detail: string;
  index: number;
}

function BreakdownRow({ icon: Icon, label, xp, detail, index }: BreakdownRowProps) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div
        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(42, 42, 42, 0.5)',
        }}
      >
        <Icon className="h-3.5 w-3.5 text-ecs-gray/60" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/70 font-display truncate">{label}</p>
        <p className="text-[10px] text-ecs-gray/50">{detail}</p>
      </div>

      <span className="text-xs font-display font-bold text-ecs-gray/50 tabular-nums shrink-0">
        -{formatXP(xp)} XP
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function MissedOpportunities({
  earnedXP,
  potentialXP,
  breakdown,
  dayOfWeek,
  className,
}: MissedOpportunitiesProps) {
  const missedXP = potentialXP - earnedXP;
  const daysRemaining = 7 - dayOfWeek;

  const breakdownRows = useMemo(
    () => [
      {
        icon: ListChecks,
        label: 'Quetes non completees',
        xp: breakdown.uncompletedQuestsXP,
        detail: `${breakdown.uncompletedQuests} quete${breakdown.uncompletedQuests > 1 ? 's' : ''}`,
      },
      {
        icon: CalendarX,
        label: 'Bonus quotidiens manques',
        xp: breakdown.missedDailyBonusXP,
        detail: `${breakdown.inactiveDays} jour${breakdown.inactiveDays > 1 ? 's' : ''} sans connexion`,
      },
      {
        icon: Flame,
        label: 'Jours inactifs',
        xp: breakdown.inactiveDaysXP,
        detail: `${breakdown.inactiveDays} jour${breakdown.inactiveDays > 1 ? 's' : ''} cette semaine`,
      },
    ],
    [breakdown],
  );

  if (missedXP <= 0) return null;

  return (
    <div
      className={cn('rounded-xl border border-ecs-gray-border overflow-hidden', className)}
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
      }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-ecs-amber" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
            Objectif semaine
          </h3>
        </div>

        {/* Ring + summary side by side */}
        <div className="flex items-center gap-5 mb-5">
          <PotentialRing earned={earnedXP} potential={potentialXP} />

          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-ecs-gray font-body">
                Cette semaine, tu aurais pu gagner
              </p>
              <p className="font-display text-lg font-bold text-white mt-0.5">
                <span className="text-gradient-amber">{formatXP(missedXP)}</span>{' '}
                <span className="text-sm text-ecs-gray font-normal">XP de plus</span>
              </p>
            </div>

            {/* Motivational message */}
            {daysRemaining > 0 && (
              <motion.p
                className="text-[11px] text-green-400/80 font-body leading-snug"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                La bonne nouvelle ? Il reste{' '}
                <span className="font-bold text-green-400">{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</span>{' '}
                cette semaine.
              </motion.p>
            )}
          </div>
        </div>

        {/* XP summary bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5 text-[10px] font-display">
            <span className="text-ecs-amber/70">{formatXP(earnedXP)} XP gagnes</span>
            <span className="text-ecs-gray/50">{formatXP(potentialXP)} XP potentiel</span>
          </div>
          <div className="relative h-2 rounded-full bg-ecs-gray-dark/30 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                boxShadow: '0 0 8px rgba(255, 191, 0, 0.3)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${potentialXP > 0 ? (earnedXP / potentialXP) * 100 : 0}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.015)' }}>
          <p className="text-[10px] font-display uppercase tracking-[0.15em] text-ecs-gray mb-2">
            Details
          </p>
          {breakdownRows
            .filter((row) => row.xp > 0)
            .map((row, i) => (
              <BreakdownRow
                key={row.label}
                icon={row.icon}
                label={row.label}
                xp={row.xp}
                detail={row.detail}
                index={i}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
