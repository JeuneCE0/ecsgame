'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ComebackBonusProps {
  /** Days since last activity */
  daysAway: number;
  /** XP multiplier (e.g. 2 for 2x) */
  multiplier?: number;
  /** Duration in minutes once activated */
  durationMinutes?: number;
  /** Callback when user activates the boost */
  onActivate: () => void;
  /** Callback when dismissed */
  onDismiss: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Countdown hook                                                     */
/* ------------------------------------------------------------------ */

function useBoostCountdown(
  expiresAt: number | null,
): { timeLeft: string; isExpired: boolean; minutesLeft: number } {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return { timeLeft: '', isExpired: false, minutesLeft: 0 };

  const msRemaining = Math.max(0, expiresAt - now);
  const isExpired = msRemaining <= 0;

  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeLeft = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { timeLeft, isExpired, minutesLeft: minutes };
}

/* ------------------------------------------------------------------ */
/*  Lightning bolt animation                                           */
/* ------------------------------------------------------------------ */

function LightningBolt() {
  return (
    <motion.div
      className="relative"
      animate={{ rotate: [0, -5, 5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 blur-lg"
        style={{
          background: 'radial-gradient(circle, rgba(255, 191, 0, 0.5) 0%, transparent 70%)',
          transform: 'scale(2)',
        }}
      />
      <motion.div
        className="relative flex items-center justify-center w-14 h-14 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.15), rgba(255, 157, 0, 0.08))',
          border: '1px solid rgba(255, 191, 0, 0.3)',
          boxShadow: '0 0 24px rgba(255, 191, 0, 0.2)',
        }}
        animate={{
          boxShadow: [
            '0 0 24px rgba(255, 191, 0, 0.2)',
            '0 0 40px rgba(255, 191, 0, 0.4)',
            '0 0 24px rgba(255, 191, 0, 0.2)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Zap
          className="h-7 w-7 text-ecs-amber"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255, 191, 0, 0.6))' }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sparkle particles                                                  */
/* ------------------------------------------------------------------ */

function SparkleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${15 + (i * 10) % 80}%`,
            top: `${10 + ((i * 17) % 70)}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.2, 0.7, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="h-3 w-3 text-ecs-amber/30" />
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini banner (persistent after activation)                          */
/* ------------------------------------------------------------------ */

function ActiveBoostBanner({
  multiplier,
  timeLeft,
  minutesLeft,
}: {
  multiplier: number;
  timeLeft: string;
  minutesLeft: number;
}) {
  const isUrgent = minutesLeft < 10;

  return (
    <motion.div
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 border"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.06) 0%, rgba(12, 12, 12, 0.95) 100%)',
        border: isUrgent
          ? '1px solid rgba(249, 115, 22, 0.3)'
          : '1px solid rgba(255, 191, 0, 0.2)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Zap
          className="h-4 w-4 text-ecs-amber"
          style={{ filter: 'drop-shadow(0 0 4px rgba(255, 191, 0, 0.5))' }}
        />
      </motion.div>

      <div className="flex-1">
        <span className="text-xs font-display font-bold text-ecs-amber">
          Boost x{multiplier} actif
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Clock className={cn('h-3 w-3', isUrgent ? 'text-orange-400' : 'text-ecs-amber/60')} />
        <motion.span
          className={cn(
            'text-xs font-display font-bold tabular-nums',
            isUrgent ? 'text-orange-400' : 'text-ecs-amber/70',
          )}
          animate={isUrgent ? { opacity: [1, 0.5, 1] } : undefined}
          transition={isUrgent ? { duration: 1, repeat: Infinity } : undefined}
        >
          {timeLeft}
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const MIN_DAYS_THRESHOLD = 2;
const STORAGE_KEY = 'ecs_comeback_bonus';

interface StoredBoost {
  activatedAt: number;
  expiresAt: number;
}

function loadBoost(): StoredBoost | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredBoost;
  } catch {
    return null;
  }
}

function saveBoost(data: StoredBoost): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function ComebackBonus({
  daysAway,
  multiplier = 2,
  durationMinutes = 60,
  onActivate,
  onDismiss,
  className,
}: ComebackBonusProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const { timeLeft, isExpired, minutesLeft } = useBoostCountdown(expiresAt);

  /* Check if we should show / have an active boost */
  useEffect(() => {
    const stored = loadBoost();

    if (stored) {
      if (stored.expiresAt > Date.now()) {
        /* Active boost found */
        setIsActivated(true);
        setExpiresAt(stored.expiresAt);
        setIsVisible(true);
        return;
      }
      /* Expired, clean up */
      localStorage.removeItem(STORAGE_KEY);
    }

    /* Show offer if away long enough */
    if (daysAway >= MIN_DAYS_THRESHOLD) {
      setIsVisible(true);
    }
  }, [daysAway]);

  /* Auto-hide when expired */
  useEffect(() => {
    if (isExpired && isActivated) {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isExpired, isActivated]);

  const handleActivate = useCallback(() => {
    const now = Date.now();
    const expires = now + durationMinutes * 60 * 1000;

    saveBoost({ activatedAt: now, expiresAt: expires });
    setIsActivated(true);
    setExpiresAt(expires);
    onActivate();
  }, [durationMinutes, onActivate]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onDismiss();
  }, [onDismiss]);

  if (!isVisible) return null;

  /* Active boost: show mini banner */
  if (isActivated && !isExpired) {
    return (
      <div className={className}>
        <ActiveBoostBanner
          multiplier={multiplier}
          timeLeft={timeLeft}
          minutesLeft={minutesLeft}
        />
      </div>
    );
  }

  /* Expired boost */
  if (isActivated && isExpired) {
    return (
      <motion.div
        className={cn('rounded-xl px-4 py-3 border border-ecs-gray-border/50 text-center', className)}
        style={{ background: 'rgba(26, 26, 26, 0.9)' }}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 2, delay: 1 }}
      >
        <p className="text-xs text-ecs-gray font-display">Boost termine !</p>
      </motion.div>
    );
  }

  /* Offer card */
  return (
    <AnimatePresence>
      <motion.div
        className={cn('relative rounded-2xl overflow-hidden', className)}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.06) 0%, rgba(26, 26, 26, 0.96) 40%, rgba(12, 12, 12, 0.99) 100%)',
          border: '1px solid rgba(255, 191, 0, 0.2)',
          boxShadow: '0 0 40px rgba(255, 191, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px)',
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        {/* Sparkle particles */}
        <SparkleField />

        {/* Animated top border */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #FFBF00, #FF9D00, transparent)' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full border border-ecs-gray-border/50 bg-ecs-black-card/50 text-ecs-gray hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="relative p-6">
          {/* Lightning icon */}
          <div className="flex justify-center mb-4">
            <LightningBolt />
          </div>

          {/* Text */}
          <div className="text-center mb-5">
            <motion.p
              className="text-[10px] font-display uppercase tracking-[0.3em] text-ecs-amber/60 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Bonus de retour
            </motion.p>
            <motion.h3
              className="font-display text-xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            >
              Double XP pendant{' '}
              <span className="text-gradient-amber">{durationMinutes < 60 ? `${durationMinutes}min` : `${Math.floor(durationMinutes / 60)}h`}</span>
            </motion.h3>
            <motion.p
              className="text-xs text-ecs-gray font-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Content de te revoir ! Profite de ce boost pour rattraper ton retard.
            </motion.p>
          </div>

          {/* Multiplier badge */}
          <motion.div
            className="flex items-center justify-center gap-2 rounded-lg py-2 px-4 mx-auto w-fit mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.12), rgba(255, 157, 0, 0.06))',
              border: '1px solid rgba(255, 191, 0, 0.2)',
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="h-4 w-4 text-ecs-amber" />
            <span className="font-display text-lg font-bold text-gradient-amber">
              x{multiplier}
            </span>
            <span className="text-xs text-ecs-amber/60 font-display uppercase tracking-wider">
              XP
            </span>
          </motion.div>

          {/* Activate CTA */}
          <motion.button
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-bold uppercase tracking-wider text-sm text-ecs-black"
            style={{
              background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
              boxShadow: '0 0 20px rgba(255, 191, 0, 0.25), 0 0 40px rgba(255, 191, 0, 0.1)',
            }}
            onClick={handleActivate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 191, 0, 0.2)',
                '0 0 35px rgba(255, 191, 0, 0.4)',
                '0 0 20px rgba(255, 191, 0, 0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="h-4 w-4" />
            Active ton boost
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
