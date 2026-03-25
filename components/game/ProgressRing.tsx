'use client';

import { type ReactNode, useId } from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
}

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  children,
}: ProgressRingProps) {
  const gradientId = useId();
  const glowFilterId = useId();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(value, max));
  const percent = max > 0 ? clampedValue / max : 0;
  const dashOffset = circumference * (1 - percent);

  // Calculate the position of the progress edge for the glow dot
  const angle = percent * 360 - 90;
  const radians = (angle * Math.PI) / 180;
  const cx = size / 2 + radius * Math.cos(radians);
  const cy = size / 2 + radius * Math.sin(radians);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFBF00" />
            <stop offset="100%" stopColor="#FF9D00" />
          </linearGradient>
          <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(42, 42, 42, 0.6)"
          strokeWidth={strokeWidth}
        />

        {/* Glow under the progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={`url(#${glowFilterId})`}
          opacity={0.4}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{
            type: 'spring',
            stiffness: 60,
            damping: 20,
            mass: 1,
          }}
        />

        {/* Main progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{
            type: 'spring',
            stiffness: 60,
            damping: 20,
            mass: 1,
          }}
        />

        {/* Glow dot on the progress edge */}
        {percent > 0.02 && (
          <motion.circle
            cx={cx}
            cy={cy}
            r={strokeWidth / 2 + 2}
            fill="#FFBF00"
            opacity={0.7}
            filter={`url(#${glowFilterId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </svg>

      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
