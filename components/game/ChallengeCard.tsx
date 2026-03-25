'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Coins, Zap, Shield, Flame, Skull, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Difficulty = 'facile' | 'moyen' | 'difficile' | 'extreme';
type ChallengeStatus = 'en_cours' | 'termine' | 'expire';

interface ChallengeCardProps {
  title: string;
  description: string;
  xpReward: number;
  /** Remaining time in seconds */
  timeRemaining: number;
  progress: number;
  maxProgress: number;
  difficulty: Difficulty;
  status?: ChallengeStatus;
}

/* ------------------------------------------------------------------ */
/*  Difficulty config                                                  */
/* ------------------------------------------------------------------ */

interface DifficultyConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderColor: string;
  glowColor: string;
  icon: React.ReactNode;
}

const DIFFICULTY_MAP: Record<Difficulty, DifficultyConfig> = {
  facile: {
    label: 'Facile',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    glowColor: 'rgba(52, 211, 153, 0.12)',
    icon: <Zap className="h-3 w-3" />,
  },
  moyen: {
    label: 'Moyen',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    glowColor: 'rgba(251, 191, 36, 0.12)',
    icon: <Shield className="h-3 w-3" />,
  },
  difficile: {
    label: 'Difficile',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    glowColor: 'rgba(239, 68, 68, 0.12)',
    icon: <Flame className="h-3 w-3" />,
  },
  extreme: {
    label: 'Extreme',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    glowColor: 'rgba(168, 85, 247, 0.12)',
    icon: <Skull className="h-3 w-3" />,
  },
};

/* ------------------------------------------------------------------ */
/*  Time formatting                                                    */
/* ------------------------------------------------------------------ */

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: ChallengeStatus }) {
  const configs: Record<ChallengeStatus, { label: string; icon: React.ReactNode; className: string }> = {
    en_cours: {
      label: 'En cours',
      icon: <Clock className="h-3 w-3" />,
      className: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    },
    termine: {
      label: 'Termine',
      icon: <CheckCircle className="h-3 w-3" />,
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    expire: {
      label: 'Expire',
      icon: <XCircle className="h-3 w-3" />,
      className: 'bg-red-500/10 text-red-400 border-red-500/30',
    },
  };

  const cfg = configs[status];

  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider',
        cfg.className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
    >
      {cfg.icon}
      {cfg.label}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ChallengeCard({
  title,
  description,
  xpReward,
  timeRemaining: initialTime,
  progress,
  maxProgress,
  difficulty,
  status: externalStatus,
}: ChallengeCardProps) {
  const [remaining, setRemaining] = useState(initialTime);
  const diff = DIFFICULTY_MAP[difficulty];
  const progressPercent = maxProgress > 0 ? Math.min(100, Math.round((progress / maxProgress) * 100)) : 0;
  const isUrgent = remaining > 0 && remaining < 3600;
  const isExpired = remaining <= 0;
  const isComplete = progress >= maxProgress;

  const computedStatus: ChallengeStatus = externalStatus ?? (isComplete ? 'termine' : isExpired ? 'expire' : 'en_cours');

  /* Countdown timer */
  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining]);

  /* Sync if prop changes */
  const syncTime = useCallback(() => {
    setRemaining(initialTime);
  }, [initialTime]);

  useEffect(() => {
    syncTime();
  }, [syncTime]);

  return (
    <motion.div
      className="relative group"
      whileHover={{ y: -6, rotateX: 2, rotateY: -1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 800 }}
    >
      {/* Animated border — urgency = red, normal = difficulty color */}
      <div
        className={cn(
          'absolute -inset-[1px] rounded-xl transition-opacity duration-300',
          isUrgent ? 'opacity-100 animate-pulse-glow' : 'opacity-50 group-hover:opacity-100'
        )}
        style={{
          background: isUrgent
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.5), transparent 40%, transparent 60%, rgba(239, 68, 68, 0.5))'
            : isComplete
              ? 'linear-gradient(135deg, #FFBF00, #FF9D00, #FFBF00)'
              : `linear-gradient(135deg, ${diff.borderColor}, transparent 40%, transparent 60%, ${diff.borderColor})`,
          ...(isUrgent
            ? { boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }
            : {}),
        }}
      />

      {/* Card body */}
      <div
        className={cn(
          'relative rounded-xl p-5 overflow-hidden transition-shadow duration-300',
          'bg-gradient-to-br from-ecs-black-card to-[#111111]',
          'group-hover:shadow-[0_8px_32px_rgba(255,191,0,0.08)]'
        )}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${diff.glowColor} 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          {/* Top row: difficulty badge + status + timer */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {/* Difficulty badge */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider',
                  diff.bgClass,
                  diff.textClass
                )}
                style={{ borderColor: diff.borderColor }}
              >
                {diff.icon}
                {diff.label}
              </span>

              <StatusBadge status={computedStatus} />
            </div>

            {/* XP badge */}
            <motion.div
              className="flex items-center gap-1 shrink-0"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            >
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                  boxShadow: '0 0 8px rgba(255, 191, 0, 0.25)',
                }}
              >
                <Coins className="h-3.5 w-3.5 text-ecs-black" />
              </div>
              <span className="text-xs font-display font-bold text-gradient-amber">
                +{formatXP(xpReward)}
              </span>
            </motion.div>
          </div>

          {/* Title + description */}
          <h3 className="font-display font-bold text-white text-base leading-tight mb-1">
            {title}
          </h3>
          <p className="text-sm text-ecs-gray line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>

          {/* Timer */}
          <div className="flex items-center gap-2 mb-4">
            {isUrgent && !isExpired && (
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
            )}
            <Clock
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                isUrgent ? 'text-red-400' : 'text-ecs-gray'
              )}
            />
            <span
              className={cn(
                'text-sm font-mono font-bold tabular-nums',
                isUrgent ? 'text-red-400' : isExpired ? 'text-ecs-gray/40' : 'text-white'
              )}
            >
              {formatCountdown(remaining)}
            </span>
            {isUrgent && !isExpired && (
              <span className="text-[10px] font-display uppercase tracking-wider text-red-400/70">
                Urgent
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ecs-gray font-display">
                {progress} / {maxProgress}
              </span>
              <span className="font-display font-bold text-gradient-amber">
                {progressPercent}%
              </span>
            </div>

            <div
              className="h-2 rounded-full overflow-hidden relative"
              style={{
                background: '#1A1A1A',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background: isComplete
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                  boxShadow: progressPercent > 0
                    ? isComplete
                      ? '0 0 8px rgba(34, 197, 94, 0.4)'
                      : '0 0 8px rgba(255, 191, 0, 0.4)'
                    : 'none',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
              >
                <div
                  className="absolute inset-0 animate-shimmer-sweep"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                    width: '40%',
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
