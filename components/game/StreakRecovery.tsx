'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Zap, Sword, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { STREAK_BONUSES } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Urgency config                                                     */
/* ------------------------------------------------------------------ */

type UrgencyLevel = 'warning' | 'danger' | 'critical';

interface UrgencyConfig {
  borderColor: string;
  glowColor: string;
  textColor: string;
  bgGradient: string;
  label: string;
}

const URGENCY_MAP: Record<UrgencyLevel, UrgencyConfig> = {
  warning: {
    borderColor: 'rgba(234, 179, 8, 0.4)',
    glowColor: 'rgba(234, 179, 8, 0.12)',
    textColor: 'text-yellow-400',
    bgGradient: 'linear-gradient(135deg, rgba(234,179,8,0.06) 0%, rgba(12,12,12,0.95) 100%)',
    label: 'Attention',
  },
  danger: {
    borderColor: 'rgba(249, 115, 22, 0.5)',
    glowColor: 'rgba(249, 115, 22, 0.15)',
    textColor: 'text-orange-400',
    bgGradient: 'linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(12,12,12,0.95) 100%)',
    label: 'Danger',
  },
  critical: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    glowColor: 'rgba(239, 68, 68, 0.15)',
    textColor: 'text-red-400',
    bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(12,12,12,0.95) 100%)',
    label: 'Critique',
  },
};

function getUrgencyLevel(hour: number): UrgencyLevel {
  if (hour >= 22) return 'critical';
  if (hour >= 20) return 'danger';
  return 'warning';
}

/* ------------------------------------------------------------------ */
/*  Countdown timer                                                    */
/* ------------------------------------------------------------------ */

function CountdownToMidnight({ urgencyConfig }: { urgencyConfig: UrgencyConfig }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Clock className={cn('h-3.5 w-3.5', urgencyConfig.textColor)} />
      <span className={cn('text-sm font-display font-bold tabular-nums', urgencyConfig.textColor)}>
        {timeLeft}
      </span>
      <span className="text-[10px] text-ecs-gray font-display uppercase tracking-wider">
        avant minuit
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Streak loss preview                                                */
/* ------------------------------------------------------------------ */

function StreakLossPreview({ currentStreak }: { currentStreak: number }) {
  const nextBonusThreshold = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => a - b)
    .find((t) => t > currentStreak);

  const currentBonus = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => b - a)
    .find((t) => currentStreak >= t);

  const bonusPercent = currentBonus ? STREAK_BONUSES[currentBonus] : 0;

  return (
    <div className="space-y-2 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <p className="text-[10px] font-display uppercase tracking-[0.15em] text-ecs-gray">
        Ce que tu perds si le streak se brise :
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-red-400/80">
          <span className="w-1 h-1 rounded-full bg-red-400/80" />
          Streak de {currentStreak} jours remis a zero
        </div>
        {bonusPercent > 0 && (
          <div className="flex items-center gap-2 text-xs text-red-400/80">
            <span className="w-1 h-1 rounded-full bg-red-400/80" />
            Bonus XP de +{bonusPercent}% perdu
          </div>
        )}
        {nextBonusThreshold && (
          <div className="flex items-center gap-2 text-xs text-red-400/80">
            <span className="w-1 h-1 rounded-full bg-red-400/80" />
            Plus que {nextBonusThreshold - currentStreak} jour{nextBonusThreshold - currentStreak > 1 ? 's' : ''} pour le prochain palier
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const DISMISS_STORAGE_KEY = 'ecs-streak-recovery-dismissed';
const REAPPEAR_INTERVAL_MS = 60 * 60 * 1000; /* 1 hour */

interface StreakRecoveryProps {
  xpToday: number;
  className?: string;
}

export function StreakRecovery({ xpToday, className }: StreakRecoveryProps) {
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const [isDismissed, setIsDismissed] = useState(true);
  const reappearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Determine if we should show */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hour = new Date().getHours();

    /* Only show after 18h, when streak > 0 and no XP today */
    if (hour < 18 || currentStreak === 0 || xpToday > 0) {
      setIsDismissed(true);
      return;
    }

    /* Check if recently dismissed */
    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < REAPPEAR_INTERVAL_MS) {
        /* Schedule reappearance */
        const remaining = REAPPEAR_INTERVAL_MS - elapsed;
        reappearTimerRef.current = setTimeout(() => {
          setIsDismissed(false);
        }, remaining);
        return () => {
          if (reappearTimerRef.current) clearTimeout(reappearTimerRef.current);
        };
      }
    }

    setIsDismissed(false);
    return undefined;
  }, [currentStreak, xpToday]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    }

    /* Schedule reappearance */
    reappearTimerRef.current = setTimeout(() => {
      setIsDismissed(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      }
    }, REAPPEAR_INTERVAL_MS);
  }, []);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (reappearTimerRef.current) clearTimeout(reappearTimerRef.current);
    };
  }, []);

  const hour = new Date().getHours();
  const urgencyLevel = getUrgencyLevel(hour);
  const urgency = URGENCY_MAP[urgencyLevel];

  const shouldShow = !isDismissed && currentStreak > 0 && xpToday === 0 && hour >= 18;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className={cn('relative rounded-xl overflow-hidden', className)}
          style={{
            background: urgency.bgGradient,
            border: `1px solid ${urgency.borderColor}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${urgency.glowColor}`,
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          {/* Animated warning gradient border at top */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${urgency.borderColor}, transparent)`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  className={cn(
                    'flex items-center justify-center h-10 w-10 rounded-lg',
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${urgency.glowColor}, transparent)`,
                    border: `1px solid ${urgency.borderColor}`,
                  }}
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <AlertTriangle className={cn('h-5 w-5', urgency.textColor)} />
                </motion.div>

                <div>
                  <h3 className={cn('font-display font-bold text-base', urgency.textColor)}>
                    Ton streak de {currentStreak} jours est en danger !
                  </h3>
                  <p className="text-xs text-ecs-gray mt-0.5 font-body">
                    Tu n&apos;as pas encore logge d&apos;XP aujourd&apos;hui
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="shrink-0 p-1 rounded hover:bg-ecs-gray-dark/40 transition-colors"
                aria-label="Fermer l'alerte streak"
              >
                <X className="h-4 w-4 text-ecs-gray/60" />
              </button>
            </div>

            {/* Countdown */}
            <CountdownToMidnight urgencyConfig={urgency} />

            {/* What you lose */}
            <StreakLossPreview currentStreak={currentStreak} />

            {/* Quick actions */}
            <div className="flex items-center gap-3">
              <motion.a
                href="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-bold uppercase tracking-wider text-ecs-black"
                style={{
                  background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                  boxShadow: '0 0 12px rgba(255,191,0,0.3)',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Zap className="h-4 w-4" />
                Logger du XP
              </motion.a>

              <motion.a
                href="/dashboard/quests"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-bold uppercase tracking-wider text-white border border-ecs-gray-border hover:border-ecs-amber/30 transition-colors"
                style={{
                  background: 'rgba(26,26,26,0.8)',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Sword className="h-4 w-4" />
                Quete rapide
              </motion.a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
