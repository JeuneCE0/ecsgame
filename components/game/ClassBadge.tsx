'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BUSINESS_CLASSES, type BusinessClassId } from '@/lib/constants';

interface ClassBadgeProps {
  classId: BusinessClassId;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_STYLES = {
  sm: {
    container: 'px-2 py-0.5 gap-1 rounded-lg',
    emoji: 'text-xs',
    text: 'text-[10px]',
  },
  md: {
    container: 'px-2.5 py-1 gap-1.5 rounded-lg',
    emoji: 'text-sm',
    text: 'text-xs',
  },
  lg: {
    container: 'px-3 py-1.5 gap-2 rounded-xl',
    emoji: 'text-base',
    text: 'text-sm',
  },
} as const;

export function ClassBadge({ classId, size = 'md' }: ClassBadgeProps) {
  const cls = BUSINESS_CLASSES[classId];
  const styles = SIZE_STYLES[size];

  return (
    <motion.div
      className={cn(
        'inline-flex items-center font-display font-bold',
        styles.container
      )}
      style={{
        backgroundColor: `${cls.color}12`,
        border: `1px solid ${cls.color}30`,
        color: cls.color,
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className={styles.emoji}>{cls.emoji}</span>
      <span className={cn(styles.text, 'uppercase tracking-wider')}>{cls.name}</span>
    </motion.div>
  );
}
