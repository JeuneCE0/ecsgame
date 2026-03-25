'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Gift, Lock, Coins, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DayReward {
  day: number;
  xp: number;
  label: string;
  isJackpot: boolean;
}

type DayStatus = 'claimed' | 'today' | 'future';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'ecs_daily_reward';
const REWARDS: DayReward[] = [
  { day: 1, xp: 25, label: 'Jour 1', isJackpot: false },
  { day: 2, xp: 50, label: 'Jour 2', isJackpot: false },
  { day: 3, xp: 75, label: 'Jour 3', isJackpot: false },
  { day: 4, xp: 100, label: 'Jour 4', isJackpot: false },
  { day: 5, xp: 150, label: 'Jour 5', isJackpot: false },
  { day: 6, xp: 200, label: 'Jour 6', isJackpot: false },
  { day: 7, xp: 500, label: 'BONUS JACKPOT', isJackpot: true },
];

const CONFETTI_COLORS = ['#FFBF00', '#FF9D00', '#FFD700', '#FFA500', '#FFFFFF'];
const CONFETTI_COUNT = 28;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

interface StoredStreak {
  lastClaim: string;
  streakDay: number;
}

function loadStreak(): StoredStreak | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredStreak;
  } catch {
    return null;
  }
}

function saveStreak(data: StoredStreak): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isConsecutiveDay(prev: string, today: string): boolean {
  const d1 = new Date(prev);
  const d2 = new Date(today);
  const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0.5 && diff < 2;
}

/* ------------------------------------------------------------------ */
/*  Confetti particle                                                  */
/* ------------------------------------------------------------------ */

interface ConfettiPiece {
  angle: number;
  distance: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  rotateEnd: number;
  drift: number;
}

function ConfettiParticle({ piece }: { piece: ConfettiPiece }) {
  const endX = Math.cos((piece.angle * Math.PI) / 180) * piece.distance;
  const endY = Math.sin((piece.angle * Math.PI) / 180) * piece.distance + 60;

  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{
        width: piece.size,
        height: piece.size * 0.6,
        background: piece.color,
        top: '40%',
        left: '50%',
        boxShadow: `0 0 4px ${piece.color}60`,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        x: endX + piece.drift,
        y: endY,
        opacity: 0,
        scale: 0.2,
        rotate: piece.rotateEnd,
      }}
      transition={{
        duration: piece.duration,
        delay: piece.delay,
        ease: 'easeOut' as const,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Coin spin component                                                */
/* ------------------------------------------------------------------ */

function CoinSpin({ xp }: { xp: number }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ scale: 0, rotateY: 0 }}
      animate={{ scale: 1, rotateY: 720 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14, duration: 1.2 }}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
          boxShadow: '0 0 30px rgba(255, 191, 0, 0.5), inset 0 2px 0 rgba(255,255,255,0.4)',
        }}
      >
        <Coins className="h-8 w-8 text-ecs-black" />
      </div>
      <motion.span
        className="font-display text-2xl font-bold text-gradient-amber"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ textShadow: '0 0 20px rgba(255, 191, 0, 0.5)' }}
      >
        +{xp} XP
      </motion.span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Day cell                                                           */
/* ------------------------------------------------------------------ */

interface DayCellProps {
  reward: DayReward;
  status: DayStatus;
  index: number;
}

function DayCell({ reward, status, index }: DayCellProps) {
  const isClaimed = status === 'claimed';
  const isToday = status === 'today';
  const isFuture = status === 'future';

  return (
    <motion.div
      className={cn(
        'relative flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all',
        isClaimed && 'border-ecs-amber/30 bg-ecs-amber/[0.06]',
        isToday && 'border-ecs-amber/50 animate-pulse-glow',
        isFuture && 'border-ecs-gray-border/50 bg-ecs-black-light/50 opacity-50',
        reward.isJackpot && isToday && 'border-ecs-amber/70',
      )}
      style={
        reward.isJackpot && !isFuture
          ? {
              boxShadow: '0 0 24px rgba(255, 191, 0, 0.2), inset 0 0 20px rgba(255, 191, 0, 0.04)',
            }
          : undefined
      }
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isFuture ? 0.5 : 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Jackpot glow bg */}
      {reward.isJackpot && !isFuture && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 191, 0, 0.08) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Day label */}
      <span
        className={cn(
          'text-[10px] font-display uppercase tracking-[0.15em]',
          isClaimed ? 'text-ecs-amber/60' : isToday ? 'text-ecs-amber' : 'text-ecs-gray/40'
        )}
      >
        {reward.isJackpot ? 'J7' : `J${reward.day}`}
      </span>

      {/* Icon / check */}
      <div className="relative">
        {isClaimed ? (
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.2), rgba(255, 157, 0, 0.12))',
              border: '1px solid rgba(255, 191, 0, 0.3)',
            }}
          >
            <Check className="h-4 w-4 text-ecs-amber" />
          </div>
        ) : isFuture ? (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-ecs-gray-dark/30 border border-ecs-gray-border/30">
            <Lock className="h-3.5 w-3.5 text-ecs-gray/30" />
          </div>
        ) : (
          <motion.div
            className="flex items-center justify-center w-9 h-9 rounded-full"
            style={{
              background: reward.isJackpot
                ? 'linear-gradient(135deg, #FFBF00, #FF9D00)'
                : 'linear-gradient(135deg, rgba(255, 191, 0, 0.15), rgba(255, 157, 0, 0.08))',
              border: '1px solid rgba(255, 191, 0, 0.4)',
              boxShadow: '0 0 12px rgba(255, 191, 0, 0.3)',
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {reward.isJackpot ? (
              <Sparkles className="h-4 w-4 text-ecs-black" />
            ) : (
              <Gift className="h-4 w-4 text-ecs-amber" />
            )}
          </motion.div>
        )}
      </div>

      {/* XP amount */}
      <span
        className={cn(
          'text-xs font-display font-bold',
          isClaimed ? 'text-ecs-amber/50' : isToday ? 'text-ecs-amber' : 'text-ecs-gray/30',
          reward.isJackpot && isToday && 'text-gradient-amber'
        )}
      >
        {reward.xp} XP
      </span>

      {/* Jackpot label */}
      {reward.isJackpot && (
        <span
          className={cn(
            'text-[8px] font-display font-bold uppercase tracking-wider',
            isFuture ? 'text-ecs-gray/20' : 'text-gradient-amber'
          )}
        >
          Jackpot
        </span>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Modal                                                         */
/* ------------------------------------------------------------------ */

export function DailyRewardModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [streakDay, setStreakDay] = useState(1);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [perfectWeek, setPerfectWeek] = useState(false);
  const addXP = usePlayerStore((s) => s.addXP);

  /* Determine if we should show the modal on mount */
  useEffect(() => {
    const today = todayKey();
    const stored = loadStreak();

    if (stored && stored.lastClaim === today) {
      // Already claimed today
      return;
    }

    if (stored && isConsecutiveDay(stored.lastClaim, today)) {
      const nextDay = stored.streakDay >= 7 ? 1 : stored.streakDay + 1;
      setStreakDay(nextDay);
    } else if (stored && stored.lastClaim !== today) {
      // Streak broken, restart
      setStreakDay(1);
    }

    setIsOpen(true);
  }, []);

  /* Confetti pieces */
  const confettiPieces: ConfettiPiece[] = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        angle: (i / CONFETTI_COUNT) * 360 + (Math.random() - 0.5) * 30,
        distance: 80 + Math.random() * 140,
        size: 4 + Math.random() * 6,
        duration: 1.2 + Math.random() * 0.8,
        delay: 0.05 + Math.random() * 0.3,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotateEnd: (Math.random() - 0.5) * 900,
        drift: (Math.random() - 0.5) * 30,
      })),
    []
  );

  /* Get day status */
  const getDayStatus = useCallback(
    (day: number): DayStatus => {
      if (claimed && day === streakDay) return 'claimed';
      if (day < streakDay) return 'claimed';
      if (day === streakDay) return 'today';
      return 'future';
    },
    [streakDay, claimed]
  );

  /* Claim handler */
  const handleClaim = useCallback(async () => {
    if (claiming || claimed) return;
    setClaiming(true);

    const reward = REWARDS[streakDay - 1];
    const today = todayKey();

    try {
      await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: reward.xp,
          source: 'streak_bonus',
        }),
      });
    } catch {
      // Silently handle — XP will be added locally
    }

    addXP(reward.xp, 'streak_bonus');
    saveStreak({ lastClaim: today, streakDay });
    setClaimed(true);

    if (streakDay === 7) {
      setTimeout(() => setPerfectWeek(true), 1200);
    }

    setClaiming(false);
  }, [claiming, claimed, streakDay, addXP]);

  /* Close handler */
  const handleClose = useCallback(() => {
    if (claiming) return;
    setIsOpen(false);
  }, [claiming]);

  const currentReward = REWARDS[streakDay - 1];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(255, 191, 0, 0.04) 0%, rgba(0,0,0,0.85) 70%)',
            }}
            onClick={handleClose}
          />

          {/* Modal card */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%)',
              border: '1px solid rgba(255, 191, 0, 0.12)',
              boxShadow:
                '0 0 60px rgba(255, 191, 0, 0.1), 0 0 120px rgba(255, 157, 0, 0.05)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
            initial={{ scale: 0.5, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti on claim */}
            {claimed && (
              <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
                {confettiPieces.map((piece, i) => (
                  <ConfettiParticle key={i} piece={piece} />
                ))}
              </div>
            )}

            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-30 p-1.5 rounded-full border border-ecs-gray-border/50 bg-ecs-black-card/50 text-ecs-gray hover:text-white hover:border-ecs-gray/50 transition-colors"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 pt-8">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.p
                  className="text-[10px] font-display uppercase tracking-[0.3em] text-ecs-amber/60 mb-2"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Recompense quotidienne
                </motion.p>
                <motion.h2
                  className="font-display text-2xl font-bold text-gradient-amber"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ textShadow: '0 0 20px rgba(255, 191, 0, 0.3)' }}
                >
                  Jour {streakDay} / 7
                </motion.h2>
              </div>

              {/* Perfect week celebration */}
              <AnimatePresence>
                {perfectWeek && (
                  <motion.div
                    className="mb-6 rounded-xl p-4 text-center"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255, 191, 0, 0.12), rgba(255, 157, 0, 0.06))',
                      border: '1px solid rgba(255, 191, 0, 0.3)',
                      boxShadow: '0 0 30px rgba(255, 191, 0, 0.15)',
                    }}
                    initial={{ opacity: 0, scale: 0.8, height: 0 }}
                    animate={{ opacity: 1, scale: 1, height: 'auto' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  >
                    <motion.p
                      className="font-display text-lg font-bold text-gradient-amber neon-amber-strong"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      SEMAINE PARFAITE !
                    </motion.p>
                    <p className="text-xs text-ecs-amber/60 mt-1 font-display">
                      7 jours consecutifs — Legendaire !
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reward grid */}
              <div className="grid grid-cols-7 gap-1.5 mb-6">
                {REWARDS.map((reward, i) => (
                  <DayCell
                    key={reward.day}
                    reward={reward}
                    status={getDayStatus(reward.day)}
                    index={i}
                  />
                ))}
              </div>

              {/* Claim section */}
              <div className="flex flex-col items-center gap-4">
                {claimed ? (
                  <CoinSpin xp={currentReward.xp} />
                ) : (
                  <>
                    {/* Today's reward preview */}
                    <div className="text-center">
                      <p className="text-sm text-ecs-gray mb-1">
                        Recompense du jour
                      </p>
                      <p className="font-display text-xl font-bold text-gradient-amber">
                        +{currentReward.xp} XP
                        {currentReward.isJackpot && (
                          <span className="ml-2 text-sm">JACKPOT</span>
                        )}
                      </p>
                    </div>

                    {/* Claim button */}
                    <motion.button
                      className={cn(
                        'w-full flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wider',
                        'px-6 py-3.5 rounded-xl text-sm',
                        'bg-gradient-amber text-ecs-black',
                        claiming && 'opacity-50 cursor-not-allowed'
                      )}
                      style={{
                        boxShadow:
                          '0 0 20px rgba(255, 191, 0, 0.25), 0 0 40px rgba(255, 191, 0, 0.1)',
                      }}
                      onClick={handleClaim}
                      disabled={claiming}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      animate={{ boxShadow: ['0 0 20px rgba(255, 191, 0, 0.2)', '0 0 30px rgba(255, 191, 0, 0.4)', '0 0 20px rgba(255, 191, 0, 0.2)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Gift className="h-4 w-4" />
                      {claiming ? 'Chargement...' : 'Reclamer'}
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
