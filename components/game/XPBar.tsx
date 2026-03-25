'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getXPProgressPercent, formatXP } from '@/lib/utils';
import { LevelBadge } from '@/components/game/LevelBadge';

interface XPBarProps {
  currentXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  level: number;
}

function SparkParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute -top-1 rounded-full"
      style={{
        width: 3,
        height: 3,
        background: '#FFBF00',
        right: -1,
        boxShadow: '0 0 6px 2px rgba(255, 191, 0, 0.8)',
      }}
      animate={{
        y: [-2, -18],
        x: [0, (Math.random() - 0.5) * 16],
        opacity: [1, 0],
        scale: [1, 0.3],
      }}
      transition={{
        duration: 0.8 + Math.random() * 0.4,
        delay,
        repeat: Infinity,
        repeatDelay: 0.6 + Math.random() * 0.8,
        ease: 'easeOut' as const,
      }}
    />
  );
}

export function XPBar({ currentXP, currentLevelXP, nextLevelXP, level }: XPBarProps) {
  const percent = getXPProgressPercent(currentXP, currentLevelXP, nextLevelXP);
  const xpIntoLevel = currentXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;

  const sparkParticles = useMemo(
    () => Array.from({ length: 5 }, (_, i) => i * 0.15),
    []
  );

  return (
    <div className="w-full space-y-3">
      {/* Top row: level badges + XP count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LevelBadge level={level} size="sm" />
          <span className="text-xs text-ecs-gray font-display uppercase tracking-wider">
            Niveau {level}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-display font-bold text-gradient-amber">
            {formatXP(xpIntoLevel)} / {formatXP(xpNeeded)} XP
          </span>
          <LevelBadge level={level + 1} size="sm" />
        </div>
      </div>

      {/* XP Bar container */}
      <div className="relative">
        {/* Outer glow track */}
        <div
          className="h-[14px] rounded-full overflow-hidden relative"
          style={{
            background: 'linear-gradient(180deg, #1A1A1A 0%, #0F0F0F 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* Animated fill */}
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #FFBF00 0%, #FF9D00 60%, #FF8800 100%)',
              boxShadow: '0 0 12px rgba(255, 191, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 18,
              mass: 1,
            }}
          >
            {/* Top highlight line */}
            <div
              className="absolute inset-x-0 top-0 h-[3px] rounded-full"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
              }}
            />

            {/* Shimmer sweep */}
            <div
              className="absolute inset-0 animate-shimmer-sweep"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                width: '50%',
              }}
            />

            {/* Spark particles at the fill edge */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center">
              {sparkParticles.map((delay, i) => (
                <SparkParticle key={i} delay={delay} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Glowing edge at fill point */}
        <motion.div
          className="absolute top-0 bottom-0 w-[2px] rounded-full pointer-events-none"
          style={{
            background: '#FFBF00',
            boxShadow: '0 0 8px 3px rgba(255, 191, 0, 0.6), 0 0 20px 6px rgba(255, 191, 0, 0.2)',
          }}
          initial={{ left: '0%' }}
          animate={{ left: `${percent}%` }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 18,
            mass: 1,
          }}
        />
      </div>

      {/* Percentage indicator */}
      <div className="flex justify-center">
        <motion.span
          className="text-[10px] font-display uppercase tracking-[0.2em] text-ecs-gray"
          key={Math.round(percent)}
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {Math.round(percent)}% vers niveau {level + 1}
        </motion.span>
      </div>
    </div>
  );
}
