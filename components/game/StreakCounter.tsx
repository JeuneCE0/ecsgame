'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Check } from 'lucide-react';
import { STREAK_BONUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  /** Array of 7 booleans for last 7 days (index 0 = 6 days ago, index 6 = today) */
  lastSevenDays?: boolean[];
}

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getStreakBonus(streak: number): number {
  let bonus = 0;
  const thresholds = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (streak >= threshold) {
      bonus = STREAK_BONUSES[threshold];
      break;
    }
  }
  return bonus;
}

function FlameIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative">
      {/* Fire glow behind */}
      {isActive && (
        <div
          className="absolute inset-0 blur-lg"
          style={{
            background: 'radial-gradient(circle, rgba(255, 157, 0, 0.5) 0%, transparent 70%)',
            transform: 'scale(2.5)',
          }}
        />
      )}

      {/* Flame icon with CSS animation */}
      <motion.div
        className={cn(
          'relative z-10',
          isActive ? 'animate-flame' : ''
        )}
        style={isActive ? {
          filter: 'drop-shadow(0 0 6px rgba(255, 157, 0, 0.6))',
        } : undefined}
      >
        <Flame
          className={cn(
            'h-10 w-10',
            isActive ? 'text-ecs-orange' : 'text-ecs-gray/40'
          )}
          style={isActive ? {
            fill: 'url(#flame-gradient)',
            stroke: '#FF9D00',
          } : undefined}
        />
      </motion.div>

      {/* SVG gradient definition for fill */}
      {isActive && (
        <svg className="absolute h-0 w-0">
          <defs>
            <linearGradient id="flame-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FF9D00" />
              <stop offset="50%" stopColor="#FFBF00" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
}

export function StreakCounter({ currentStreak, longestStreak, lastSevenDays }: StreakCounterProps) {
  const bonus = getStreakBonus(currentStreak);
  const isActive = currentStreak > 0;

  const defaultDays = useMemo(() => {
    if (lastSevenDays) return lastSevenDays;
    return Array.from({ length: 7 }, (_, i) => i < currentStreak && i < 7);
  }, [lastSevenDays, currentStreak]);

  return (
    <div
      className="rounded-xl border border-ecs-gray-border p-5 relative overflow-hidden"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(255, 157, 0, 0.04) 0%, #1A1A1A 50%, #141414 100%)'
          : 'linear-gradient(135deg, #1A1A1A 0%, #141414 100%)',
      }}
    >
      {/* Top section: flame + number + info */}
      <div className="flex items-center gap-4">
        <FlameIcon isActive={isActive} />

        <div className="flex-1">
          {/* Streak number large */}
          <div className="flex items-baseline gap-2">
            <motion.span
              className={cn(
                'font-display font-bold text-4xl leading-none',
                isActive ? 'text-gradient-amber animate-text-glow' : 'text-ecs-gray/40'
              )}
              key={currentStreak}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {currentStreak}
            </motion.span>
            <span className="text-sm text-ecs-gray font-display uppercase tracking-wider">
              {currentStreak === 1 ? 'jour' : 'jours'}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-xs text-ecs-gray">
              Record : <span className="text-white font-bold">{longestStreak}j</span>
            </span>

            {/* Bonus badge */}
            {bonus > 0 && (
              <motion.span
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-display font-bold uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.15), rgba(255, 157, 0, 0.1))',
                  border: '1px solid rgba(255, 191, 0, 0.2)',
                  color: '#FFBF00',
                  boxShadow: '0 0 8px rgba(255, 191, 0, 0.15)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.2 }}
              >
                +{bonus}% XP
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {/* Daily check marks - last 7 days */}
      <div className="mt-5 pt-4 border-t border-ecs-gray-border/50">
        <p className="text-[10px] text-ecs-gray font-display uppercase tracking-[0.2em] mb-3">
          7 derniers jours
        </p>
        <div className="flex items-center justify-between gap-1">
          {defaultDays.map((completed, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Day circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300',
                  completed
                    ? 'border-ecs-amber/40'
                    : 'border-ecs-gray-border bg-ecs-black-light'
                )}
                style={completed ? {
                  background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.15), rgba(255, 157, 0, 0.08))',
                  boxShadow: '0 0 8px rgba(255, 191, 0, 0.15)',
                } : undefined}
              >
                {completed ? (
                  <Check className="h-3.5 w-3.5 text-ecs-amber" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-ecs-gray-dark" />
                )}
              </div>

              {/* Day label */}
              <span
                className={cn(
                  'text-[9px] font-display uppercase',
                  completed ? 'text-ecs-amber/70' : 'text-ecs-gray/40'
                )}
              >
                {DAY_LABELS[i]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
