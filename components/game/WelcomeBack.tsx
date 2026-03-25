'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Flame, ArrowRight, Trophy, Zap, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Mascot } from '@/components/game/Mascot';
import { formatXP } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface YesterdayStats {
  xpGained: number;
  questsCompleted: number;
}

interface TodayPreview {
  dailyQuests: number;
  weeklyQuests: number;
}

interface WelcomeBackProps {
  playerName: string;
  currentStreak: number;
  streakMaintained: boolean;
  yesterdayStats: YesterdayStats;
  todayPreview: TodayPreview;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Storage key for daily display                                      */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'ecs-welcome-back-date';

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Animated stat card                                                 */
/* ------------------------------------------------------------------ */

function StatBadge({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 rounded-lg p-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,191,0,0.1)',
      }}
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
    >
      <span className="text-ecs-amber">{icon}</span>
      <span className="text-lg font-display font-bold text-white">{value}</span>
      <span className="text-[9px] font-display uppercase tracking-[0.15em] text-ecs-gray">
        {label}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function WelcomeBack({
  playerName,
  currentStreak,
  streakMaintained,
  yesterdayStats,
  todayPreview,
  className,
}: WelcomeBackProps) {
  const [isVisible, setIsVisible] = useState(false);

  /* Only show once per day */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const todayKey = getTodayKey();
    const lastShown = localStorage.getItem(STORAGE_KEY);

    if (lastShown === todayKey) return;

    /* Small delay for entrance */
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, getTodayKey());
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
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
              background: 'radial-gradient(ellipse at center, rgba(255,191,0,0.03) 0%, rgba(0,0,0,0.85) 70%)',
            }}
            onClick={handleDismiss}
          />

          {/* Card */}
          <motion.div
            className={cn(
              'relative w-full max-w-md rounded-2xl p-8 space-y-6 text-center overflow-hidden',
              className,
            )}
            style={{
              background: 'linear-gradient(180deg, rgba(26,26,26,0.97) 0%, rgba(12,12,12,0.99) 100%)',
              border: '1px solid rgba(255,191,0,0.2)',
              boxShadow: '0 0 60px rgba(255,191,0,0.1), 0 8px 40px rgba(0,0,0,0.6)',
            }}
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 20%, rgba(255,191,0,0.04) 0%, transparent 60%)',
              }}
            />

            {/* Mascot */}
            <motion.div
              className="relative z-10 flex justify-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            >
              <Mascot mood={streakMaintained ? 'cheering' : 'happy'} size="lg" />
            </motion.div>

            {/* Greeting */}
            <motion.div
              className="relative z-10 space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-display font-bold text-white">
                Bon retour, {playerName} !
              </h2>

              {/* Streak status */}
              {streakMaintained ? (
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,191,0,0.1), rgba(255,157,0,0.05))',
                    border: '1px solid rgba(255,191,0,0.2)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.6 }}
                >
                  <Flame className="h-4 w-4 text-ecs-orange" />
                  <span className="text-sm font-display font-bold text-gradient-amber">
                    Streak maintenu ! Jour {currentStreak}
                  </span>
                </motion.div>
              ) : (
                <motion.p
                  className="text-sm text-ecs-gray font-body leading-relaxed max-w-xs mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Le streak est reparti a 0... Mais chaque expert a commence par echouer. Recommence aujourd&apos;hui !
                </motion.p>
              )}
            </motion.div>

            {/* Yesterday's stats */}
            {(yesterdayStats.xpGained > 0 || yesterdayStats.questsCompleted > 0) && (
              <motion.div
                className="relative z-10 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-[10px] font-display uppercase tracking-[0.2em] text-ecs-gray">
                  Hier
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <StatBadge
                    icon={<Zap className="h-4 w-4" />}
                    value={`+${formatXP(yesterdayStats.xpGained)}`}
                    label="XP gagnes"
                    delay={0.8}
                  />
                  <StatBadge
                    icon={<Trophy className="h-4 w-4" />}
                    value={String(yesterdayStats.questsCompleted)}
                    label={yesterdayStats.questsCompleted === 1 ? 'quete terminee' : 'quetes terminees'}
                    delay={0.9}
                  />
                </div>
              </motion.div>
            )}

            {/* Today's preview */}
            <motion.div
              className="relative z-10 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <p className="text-[10px] font-display uppercase tracking-[0.2em] text-ecs-gray">
                Aujourd&apos;hui
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-ecs-gray font-body">
                <span className="flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5 text-sky-400" />
                  {todayPreview.dailyQuests} quetes du jour
                </span>
                {todayPreview.weeklyQuests > 0 && (
                  <span className="flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5 text-purple-400" />
                    {todayPreview.weeklyQuests} quetes hebdo
                  </span>
                )}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.button
              className="relative z-10 w-full flex items-center justify-center gap-2 text-sm font-display font-bold uppercase tracking-wider text-ecs-black px-6 py-3.5 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                boxShadow: '0 0 16px rgba(255,191,0,0.3), 0 4px 12px rgba(0,0,0,0.3)',
              }}
              onClick={handleDismiss}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Rocket className="h-4 w-4" />
              C&apos;est parti !
              <ArrowRight className="h-4 w-4" />
            </motion.button>

            {/* Auto-dismiss bar */}
            <div className="relative z-10 w-full h-[2px] rounded-full overflow-hidden bg-ecs-gray-dark/20">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 15, ease: 'linear' }}
                onAnimationComplete={handleDismiss}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
