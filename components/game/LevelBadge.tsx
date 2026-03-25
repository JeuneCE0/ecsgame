'use client';

import { motion } from 'framer-motion';
import { LEVEL_TITLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

const sizeConfig: Record<string, {
  outer: string;
  inner: string;
  text: string;
  titleText: string;
  clipSize: number;
}> = {
  sm: {
    outer: 'w-8 h-9',
    inner: 'w-7 h-8',
    text: 'text-xs font-bold',
    titleText: 'text-[8px]',
    clipSize: 8,
  },
  md: {
    outer: 'w-11 h-12',
    inner: 'w-10 h-11',
    text: 'text-base font-bold',
    titleText: 'text-[9px]',
    clipSize: 11,
  },
  lg: {
    outer: 'w-16 h-[72px]',
    inner: 'w-[58px] h-[66px]',
    text: 'text-2xl font-bold',
    titleText: 'text-[10px]',
    clipSize: 16,
  },
};

function getShieldClip(): string {
  return 'polygon(50% 0%, 100% 10%, 100% 70%, 50% 100%, 0% 70%, 0% 10%)';
}

export function LevelBadge({ level, size = 'md', showTitle = false }: LevelBadgeProps) {
  const title = LEVEL_TITLES[level] ?? `Niveau ${level}`;
  const config = sizeConfig[size];

  return (
    <div className="inline-flex flex-col items-center gap-1">
      {/* Shield badge */}
      <motion.div
        className={cn('relative flex items-center justify-center', config.outer)}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        key={level}
        animate={{
          filter: [
            'drop-shadow(0 0 4px rgba(255, 191, 0, 0.3))',
            'drop-shadow(0 0 12px rgba(255, 191, 0, 0.6))',
            'drop-shadow(0 0 4px rgba(255, 191, 0, 0.3))',
          ],
        }}
        transition={{
          filter: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
          scale: { type: 'spring', stiffness: 400, damping: 15 },
        }}
      >
        {/* Outer gradient border (shield shape) */}
        <div
          className={cn('absolute inset-0', config.outer)}
          style={{
            clipPath: getShieldClip(),
            background: 'linear-gradient(180deg, #FFBF00 0%, #FF9D00 50%, #CC7A00 100%)',
          }}
        />

        {/* Inner dark fill */}
        <div
          className={cn(
            'absolute flex flex-col items-center justify-center',
            config.inner
          )}
          style={{
            clipPath: getShieldClip(),
            background: 'linear-gradient(180deg, #1E1E1E 0%, #0C0C0C 100%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Inner glow overlay */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: getShieldClip(),
              background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 191, 0, 0.15) 0%, transparent 70%)',
            }}
          />

          {/* Level number */}
          <span
            className={cn(
              'font-display relative z-10 text-gradient-amber leading-none',
              config.text
            )}
          >
            {level}
          </span>
        </div>
      </motion.div>

      {/* Rank title below */}
      {showTitle && (
        <motion.span
          className={cn(
            'font-display uppercase tracking-[0.15em] text-ecs-amber/70 text-center leading-tight',
            config.titleText
          )}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {title}
        </motion.span>
      )}
    </div>
  );
}
