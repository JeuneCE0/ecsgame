'use client';

import { motion } from 'framer-motion';
import { getXPProgressPercent, formatXP } from '@/lib/utils';

interface XPBarProps {
  currentXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  level: number;
}

export function XPBar({ currentXP, currentLevelXP, nextLevelXP, level }: XPBarProps) {
  const percent = getXPProgressPercent(currentXP, currentLevelXP, nextLevelXP);
  const xpIntoLevel = currentXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-display font-bold text-ecs-amber">
          Niveau {level}
        </span>
        <span className="text-ecs-gray">
          {formatXP(xpIntoLevel)} / {formatXP(xpNeeded)} XP
        </span>
      </div>
      <div className="xp-bar h-[10px]">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
        />
      </div>
    </div>
  );
}
