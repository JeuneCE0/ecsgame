'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { STREAK_BONUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

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

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const bonus = getStreakBonus(currentStreak);
  const isActive = currentStreak > 0;

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={cn(
          'flex items-center gap-1.5',
          isActive ? 'text-ecs-amber' : 'text-ecs-gray'
        )}
        animate={
          isActive
            ? {
                scale: [1, 1.1, 1],
              }
            : undefined
        }
        transition={
          isActive
            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
            : undefined
        }
      >
        <Flame className="h-5 w-5" />
        <span className="font-display font-bold text-lg">{currentStreak}</span>
      </motion.div>

      <div className="text-xs text-ecs-gray">
        <p>
          Série actuelle : <span className="text-white">{currentStreak}j</span>
        </p>
        <p>
          Record : <span className="text-white">{longestStreak}j</span>
        </p>
        {bonus > 0 && (
          <p className="text-ecs-amber font-medium">
            Bonus +{bonus}% XP
          </p>
        )}
      </div>
    </div>
  );
}
