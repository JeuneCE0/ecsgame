'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type PixelBarSize = 'sm' | 'md' | 'lg';

interface PixelBarProps {
  label: string;
  current: number;
  max: number;
  size?: PixelBarSize;
  color?: 'xp' | 'hp' | 'auto';
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Size config                                                         */
/* ------------------------------------------------------------------ */

interface SizeConfig {
  height: number;
  labelSize: string;
  valueSize: string;
  segmentWidth: number;
}

const SIZE_CONFIG: Record<PixelBarSize, SizeConfig> = {
  sm: { height: 12, labelSize: 'text-[8px]', valueSize: 'text-[8px]', segmentWidth: 6 },
  md: { height: 18, labelSize: 'text-[10px]', valueSize: 'text-[10px]', segmentWidth: 8 },
  lg: { height: 24, labelSize: 'text-xs', valueSize: 'text-xs', segmentWidth: 10 },
};

/* ------------------------------------------------------------------ */
/*  Color logic                                                         */
/* ------------------------------------------------------------------ */

function getBarColor(percent: number, colorMode: 'xp' | 'hp' | 'auto'): string {
  if (colorMode === 'xp') {
    return 'linear-gradient(90deg, #FFBF00, #FF9D00)';
  }

  // HP / auto mode: green -> yellow -> red
  if (percent > 60) {
    return 'linear-gradient(90deg, #22CC55, #44DD77)';
  }
  if (percent > 30) {
    return 'linear-gradient(90deg, #DDCC00, #FFEE44)';
  }
  return 'linear-gradient(90deg, #CC2222, #EE4444)';
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function PixelBar({
  label,
  current,
  max,
  size = 'md',
  color = 'auto',
  className,
}: PixelBarProps) {
  const config = SIZE_CONFIG[size];
  const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const barColor = getBarColor(percent, color);

  // Stepped animation: fill segment by segment
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const prevPercentRef = useRef(0);

  useEffect(() => {
    const targetPercent = percent;
    const startPercent = prevPercentRef.current;
    const diff = targetPercent - startPercent;
    const segmentPercent = 100 / Math.max(1, Math.floor(200 / config.segmentWidth));
    const totalSteps = Math.max(1, Math.ceil(Math.abs(diff) / segmentPercent));
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / totalSteps);
      const eased = progress; // Linear stepping for pixel feel
      setAnimatedPercent(startPercent + diff * eased);

      if (step >= totalSteps) {
        clearInterval(interval);
        setAnimatedPercent(targetPercent);
        prevPercentRef.current = targetPercent;
      }
    }, 40);

    return () => clearInterval(interval);
  }, [percent, config.segmentWidth]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Label */}
      <span
        className={cn('font-pixel shrink-0 text-ecs-amber uppercase', config.labelSize)}
        style={{ minWidth: size === 'sm' ? 24 : 32 }}
      >
        {label}
      </span>

      {/* Bar container */}
      <div className="flex-1 relative">
        <div
          className="pixel-bar-border relative overflow-hidden bg-[#111111]"
          style={{ height: config.height }}
        >
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 left-0 transition-none"
            style={{
              width: `${animatedPercent}%`,
              background: barColor,
            }}
          >
            {/* Pixel stepped highlight */}
            <div
              className="absolute inset-x-0 top-0"
              style={{
                height: Math.floor(config.height / 3),
                background: 'linear-gradient(180deg, rgba(255,255,255,0.35), transparent)',
              }}
            />
          </div>

          {/* Segment lines for pixel feel */}
          <div className="absolute inset-0 flex pointer-events-none">
            {Array.from(
              { length: Math.floor(200 / config.segmentWidth) },
              (_, i) => (
                <div
                  key={i}
                  className="shrink-0 border-r border-black/20"
                  style={{ width: config.segmentWidth }}
                />
              ),
            )}
          </div>
        </div>
      </div>

      {/* Value */}
      <span
        className={cn('font-pixel shrink-0 text-white/80 tabular-nums', config.valueSize)}
        style={{ minWidth: size === 'sm' ? 50 : 70 }}
      >
        {current}/{max}
      </span>
    </div>
  );
}
