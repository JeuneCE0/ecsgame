'use client';

import { motion } from 'framer-motion';
import { LEVEL_TITLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export function LevelBadge({ level, size = 'md', showTitle = false }: LevelBadgeProps) {
  const title = LEVEL_TITLES[level] ?? `Niveau ${level}`;

  return (
    <motion.span
      className={cn('badge-level', sizeClasses[size])}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      key={level}
      animate={{
        boxShadow: [
          '0 0 0px rgba(255, 191, 0, 0)',
          '0 0 12px rgba(255, 191, 0, 0.3)',
          '0 0 0px rgba(255, 191, 0, 0)',
        ],
      }}
      transition={{
        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
      }}
    >
      <span className="font-bold">{level}</span>
      {showTitle && (
        <span className="ml-1 font-medium opacity-80">{title}</span>
      )}
    </motion.span>
  );
}
