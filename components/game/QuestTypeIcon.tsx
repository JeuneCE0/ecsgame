'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type QuestIconType = 'daily' | 'weekly' | 'main' | 'special';
type IconSize = 'sm' | 'md' | 'lg';

interface QuestTypeIconProps {
  type: QuestIconType;
  size?: IconSize;
  animated?: boolean;
  className?: string;
}

const sizeMap: Record<IconSize, number> = {
  sm: 28,
  md: 40,
  lg: 56,
};

function DailyIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      animate={animated ? { rotate: [0, 2, -2, 0] } : undefined}
      transition={animated ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <defs>
        <linearGradient id="daily-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFBF00" />
          <stop offset="100%" stopColor="#FF9D00" />
        </linearGradient>
        <clipPath id="daily-clip">
          <rect x="0" y="12" width="40" height="28" />
        </clipPath>
      </defs>

      {/* Sun rising behind */}
      <g clipPath="url(#daily-clip)">
        <circle cx="20" cy="18" r="7" fill="url(#daily-sun)" opacity="0.3" />
        {/* Sun rays */}
        {[0, 30, 60, 90, 120, 150, 180].map((angle) => (
          <motion.line
            key={angle}
            x1="20"
            y1="18"
            x2={20 + Math.cos((angle * Math.PI) / 180) * 12}
            y2={18 + Math.sin((angle * Math.PI) / 180) * -12}
            stroke="#FFBF00"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.25"
            animate={animated ? { opacity: [0.15, 0.4, 0.15] } : undefined}
            transition={animated ? { duration: 2, repeat: Infinity, delay: angle * 0.01, ease: 'easeInOut' } : undefined}
          />
        ))}
      </g>

      {/* Left sword */}
      <g transform="translate(8, 14) rotate(-30, 8, 14)">
        <rect x="7" y="2" width="2" height="16" rx="0.5" fill="#FFBF00" />
        <rect x="4" y="18" width="8" height="2" rx="1" fill="#FF9D00" />
        <rect x="6" y="20" width="4" height="4" rx="0.5" fill="#FF9D00" opacity="0.8" />
      </g>

      {/* Right sword */}
      <g transform="translate(20, 14) rotate(30, 8, 14)">
        <rect x="7" y="2" width="2" height="16" rx="0.5" fill="#FFBF00" />
        <rect x="4" y="18" width="8" height="2" rx="1" fill="#FF9D00" />
        <rect x="6" y="20" width="4" height="4" rx="0.5" fill="#FF9D00" opacity="0.8" />
      </g>

      {/* Cross point spark */}
      <motion.circle
        cx="20"
        cy="22"
        r="1.5"
        fill="#FFBF00"
        animate={animated ? { r: [1, 2, 1], opacity: [0.6, 1, 0.6] } : undefined}
        transition={animated ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />
    </motion.svg>
  );
}

function WeeklyIcon({ size, animated }: { size: number; animated: boolean }) {
  const dotPositions = [
    { cx: 11, cy: 22 },
    { cx: 16, cy: 19 },
    { cx: 21, cy: 17 },
    { cx: 26, cy: 19 },
    { cx: 31, cy: 22 },
    { cx: 20, cy: 26 },
    { cx: 22, cy: 30 },
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="weekly-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFBF00" />
          <stop offset="100%" stopColor="#FF9D00" />
        </linearGradient>
      </defs>

      {/* Shield outline */}
      <path
        d="M20,4 L36,10 L36,24 Q36,34 20,38 Q4,34 4,24 L4,10 Z"
        fill="none"
        stroke="url(#weekly-shield)"
        strokeWidth="1.8"
        opacity="0.8"
      />

      {/* Shield inner */}
      <path
        d="M20,7 L33,12 L33,23 Q33,32 20,35 Q7,32 7,23 L7,12 Z"
        fill="#0C0C0C"
        opacity="0.5"
      />

      {/* 7 dots */}
      {dotPositions.map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.cx}
          cy={pos.cy}
          r="2"
          fill={animated ? '#FFBF00' : '#333333'}
          animate={
            animated
              ? {
                  fill: ['#333333', '#FFBF00', '#FFBF00'],
                  opacity: [0.3, 1, 1],
                }
              : undefined
          }
          transition={
            animated
              ? {
                  duration: 3.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

function MainIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      animate={animated ? { y: [0, -2, 0] } : undefined}
      transition={animated ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <defs>
        <linearGradient id="main-crown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF9D00" />
        </linearGradient>
        <filter id="main-glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Crown */}
      <path
        d="M6,28 L10,14 L16,22 L20,10 L24,22 L30,14 L34,28 L34,32 L6,32 Z"
        fill="url(#main-crown)"
        stroke="#FFD700"
        strokeWidth="0.8"
        filter="url(#main-glow)"
      />

      {/* Crown inner shade */}
      <path
        d="M10,28 L12,20 L17,25 L20,16 L23,25 L28,20 L30,28 Z"
        fill="#0C0C0C"
        opacity="0.3"
      />

      {/* Gems on crown points */}
      <circle cx="20" cy="12" r="1.5" fill="#FF3333" opacity="0.9" />
      <circle cx="10" cy="16" r="1.2" fill="#33AAFF" opacity="0.8" />
      <circle cx="30" cy="16" r="1.2" fill="#33AAFF" opacity="0.8" />

      {/* Band gems */}
      <circle cx="14" cy="30" r="1" fill="#FFBF00" opacity="0.6" />
      <circle cx="20" cy="30" r="1.2" fill="#FFBF00" opacity="0.7" />
      <circle cx="26" cy="30" r="1" fill="#FFBF00" opacity="0.6" />

      {/* Crown base */}
      <rect x="6" y="32" width="28" height="3" rx="1" fill="url(#main-crown)" opacity="0.9" />
    </motion.svg>
  );
}

function SpecialIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="special-bolt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFBF00" />
          <stop offset="100%" stopColor="#FF9D00" />
        </linearGradient>
        <filter id="special-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Lightning bolt */}
      <motion.path
        d="M24,2 L12,20 L18,20 L14,38 L30,16 L22,16 Z"
        fill="url(#special-bolt)"
        stroke="#FFBF00"
        strokeWidth="0.5"
        filter="url(#special-glow)"
        animate={animated ? { opacity: [0.8, 1, 0.8] } : undefined}
        transition={animated ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />

      {/* Spark particles */}
      {animated && (
        <>
          <motion.circle
            cx="10"
            cy="12"
            r="1"
            fill="#FFBF00"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
              x: [-2, 0, 2],
              y: [2, 0, -2],
            }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="32"
            cy="8"
            r="0.8"
            fill="#FF9D00"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
          <motion.circle
            cx="8"
            cy="28"
            r="0.6"
            fill="#FFBF00"
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.3, 0.5],
            }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.8 }}
          />
          <motion.circle
            cx="34"
            cy="24"
            r="0.7"
            fill="#FF9D00"
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.4, 0.5],
            }}
            transition={{ duration: 1.1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.circle
            cx="16"
            cy="6"
            r="0.5"
            fill="#FFBF00"
            animate={{
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{ duration: 0.9, repeat: Infinity, delay: 0.6 }}
          />
        </>
      )}
    </svg>
  );
}

export function QuestTypeIcon({ type, size = 'md', animated = true, className }: QuestTypeIconProps) {
  const px = sizeMap[size];

  const iconContent = (() => {
    switch (type) {
      case 'daily':
        return <DailyIcon size={px} animated={animated} />;
      case 'weekly':
        return <WeeklyIcon size={px} animated={animated} />;
      case 'main':
        return <MainIcon size={px} animated={animated} />;
      case 'special':
        return <SpecialIcon size={px} animated={animated} />;
    }
  })();

  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      whileHover={{ scale: 1.15, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {iconContent}
    </motion.div>
  );
}
