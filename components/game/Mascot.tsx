'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type MascotMood = 'happy' | 'excited' | 'thinking' | 'cheering';
type MascotSize = 'sm' | 'md' | 'lg' | 'xl';

interface MascotProps {
  mood?: MascotMood;
  size?: MascotSize;
  message?: string;
  className?: string;
}

const sizeMap: Record<MascotSize, number> = {
  sm: 40,
  md: 60,
  lg: 100,
  xl: 160,
};

const moodEyes: Record<MascotMood, { leftD: string; rightD: string; mouthD: string }> = {
  happy: {
    leftD: 'M12,17 Q15,14 18,17',
    rightD: 'M26,17 Q29,14 32,17',
    mouthD: 'M16,28 Q22,33 28,28',
  },
  excited: {
    leftD: 'M11,14 L19,14 L19,20 L11,20 Z',
    rightD: 'M25,14 L33,14 L33,20 L25,20 Z',
    mouthD: 'M14,27 Q22,36 30,27 Z',
  },
  thinking: {
    leftD: 'M12,17 L18,17',
    rightD: 'M26,15 Q29,12 32,15 Q29,18 26,15',
    mouthD: 'M18,30 Q22,28 26,30',
  },
  cheering: {
    leftD: 'M11,14 L19,14 L19,19 L11,19 Z',
    rightD: 'M25,14 L33,14 L33,19 L25,19 Z',
    mouthD: 'M13,26 Q22,38 31,26 Z',
  },
};

function EchoSVG({ mood, size }: { mood: MascotMood; size: number }) {
  const eyes = moodEyes[mood];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="echo-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2A2A" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        <linearGradient id="echo-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFBF00" />
          <stop offset="100%" stopColor="#FF9D00" />
        </linearGradient>
        <filter id="echo-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="echo-glow-strong">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Head — angular geometric shape */}
      <path
        d="M6,8 L12,2 L32,2 L38,8 L40,18 L38,32 L32,38 L12,38 L6,32 L4,18 Z"
        fill="url(#echo-body)"
        stroke="#333333"
        strokeWidth="0.8"
      />

      {/* Top panel accent line */}
      <path
        d="M12,2 L32,2"
        stroke="url(#echo-accent)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Side accent lines */}
      <path
        d="M6,8 L4,18"
        stroke="url(#echo-accent)"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M38,8 L40,18"
        stroke="url(#echo-accent)"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Circuit line patterns */}
      <g className="echo-circuits" opacity="0.25">
        <path d="M10,10 L16,10 L18,12" stroke="#FFBF00" strokeWidth="0.4" fill="none" />
        <path d="M34,10 L28,10 L26,12" stroke="#FFBF00" strokeWidth="0.4" fill="none" />
        <path d="M8,22 L12,22 L14,24" stroke="#FFBF00" strokeWidth="0.4" fill="none" />
        <path d="M36,22 L32,22 L30,24" stroke="#FFBF00" strokeWidth="0.4" fill="none" />
        <circle cx="10" cy="10" r="0.8" fill="#FFBF00" />
        <circle cx="34" cy="10" r="0.8" fill="#FFBF00" />
        <circle cx="8" cy="22" r="0.8" fill="#FFBF00" />
        <circle cx="36" cy="22" r="0.8" fill="#FFBF00" />
      </g>

      {/* Visor / eye region background */}
      <path
        d="M10,12 L34,12 L36,17 L34,22 L10,22 L8,17 Z"
        fill="#0C0C0C"
        stroke="#333333"
        strokeWidth="0.5"
      />

      {/* Eyes — mood-dependent */}
      <g filter="url(#echo-glow)">
        <path
          d={eyes.leftD}
          stroke="#FFBF00"
          strokeWidth="1.8"
          fill={mood === 'excited' || mood === 'cheering' ? '#FFBF00' : 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="echo-eye"
        />
        <path
          d={eyes.rightD}
          stroke="#FFBF00"
          strokeWidth="1.8"
          fill={mood === 'excited' || mood === 'cheering' || mood === 'thinking' ? '#FFBF00' : 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="echo-eye"
        />
      </g>

      {/* Mouth area */}
      <path
        d={eyes.mouthD}
        stroke="#FFBF00"
        strokeWidth="0.8"
        fill={mood === 'excited' || mood === 'cheering' ? 'rgba(255,191,0,0.15)' : 'none'}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />

      {/* Chin detail */}
      <path
        d="M16,34 L28,34"
        stroke="url(#echo-accent)"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Antenna */}
      <line x1="22" y1="2" x2="22" y2="-2" stroke="#555555" strokeWidth="1" />
      <circle cx="22" cy="-3" r="1.8" fill="url(#echo-accent)" filter="url(#echo-glow)" />

      {/* Neck / body connector */}
      <rect x="18" y="38" width="8" height="4" rx="1" fill="#1A1A1A" stroke="#333333" strokeWidth="0.5" />

      {/* Shoulder plate */}
      <path
        d="M14,42 L30,42 L33,46 L11,46 Z"
        fill="url(#echo-body)"
        stroke="#333333"
        strokeWidth="0.5"
      />
      <path
        d="M14,42 L30,42"
        stroke="url(#echo-accent)"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function Mascot({ mood = 'happy', size = 'md', message, className }: MascotProps) {
  const px = sizeMap[size];
  const bubbleSize = size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('inline-flex items-end gap-2', className)}>
      <motion.div
        className="relative"
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ rotate: [-2, 2, -2, 0], scale: 1.08 }}
      >
        {/* Pulsing eye glow behind the SVG */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            filter: [
              'drop-shadow(0 0 3px rgba(255, 191, 0, 0.2))',
              'drop-shadow(0 0 8px rgba(255, 191, 0, 0.5))',
              'drop-shadow(0 0 3px rgba(255, 191, 0, 0.2))',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Circuit shimmer animation overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
          style={{ mixBlendMode: 'screen' }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          animate={{
            filter: [
              'drop-shadow(0 0 4px rgba(255, 191, 0, 0.15))',
              'drop-shadow(0 0 10px rgba(255, 191, 0, 0.4))',
              'drop-shadow(0 0 4px rgba(255, 191, 0, 0.15))',
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <EchoSVG mood={mood} size={px} />
        </motion.div>
      </motion.div>

      {/* Speech bubble */}
      {message && (
        <motion.div
          className={cn(
            'relative bg-ecs-black-card border border-ecs-gray-border rounded-lg px-3 py-2 max-w-[200px]',
            bubbleSize
          )}
          initial={{ opacity: 0, x: -8, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Arrow pointing to mascot */}
          <div
            className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: '6px solid #2A2A2A',
            }}
          />
          <span className="text-ecs-gray font-body leading-snug">{message}</span>
        </motion.div>
      )}
    </div>
  );
}
