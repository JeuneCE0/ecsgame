'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';
type EmblemSize = 'sm' | 'md' | 'lg';

interface RankEmblemProps {
  tier: RankTier;
  size?: EmblemSize;
  showLabel?: boolean;
  className?: string;
}

const sizeMap: Record<EmblemSize, { px: number; labelClass: string; rangeClass: string }> = {
  sm: { px: 40, labelClass: 'text-[9px]', rangeClass: 'text-[8px]' },
  md: { px: 64, labelClass: 'text-xs', rangeClass: 'text-[10px]' },
  lg: { px: 96, labelClass: 'text-sm', rangeClass: 'text-xs' },
};

interface TierConfig {
  label: string;
  color: string;
  colorSecondary: string;
  glowColor: string;
  levelRange: string;
}

const tierConfig: Record<RankTier, TierConfig> = {
  bronze: {
    label: 'Bronze',
    color: '#CD7F32',
    colorSecondary: '#8B5A2B',
    glowColor: 'rgba(205, 127, 50, 0.4)',
    levelRange: 'Niv. 1-3',
  },
  silver: {
    label: 'Argent',
    color: '#C0C0C0',
    colorSecondary: '#808080',
    glowColor: 'rgba(192, 192, 192, 0.4)',
    levelRange: 'Niv. 4-6',
  },
  gold: {
    label: 'Or',
    color: '#FFD700',
    colorSecondary: '#CC9900',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    levelRange: 'Niv. 7-9',
  },
  platinum: {
    label: 'Platine',
    color: '#E5E4E2',
    colorSecondary: '#A0A0A0',
    glowColor: 'rgba(229, 228, 226, 0.4)',
    levelRange: 'Niv. 10-12',
  },
  diamond: {
    label: 'Diamant',
    color: '#B9F2FF',
    colorSecondary: '#7DD4E8',
    glowColor: 'rgba(185, 242, 255, 0.4)',
    levelRange: 'Niv. 13-14',
  },
  legend: {
    label: 'Legende',
    color: '#FFBF00',
    colorSecondary: '#FF9D00',
    glowColor: 'rgba(255, 191, 0, 0.5)',
    levelRange: 'Niv. 15',
  },
};

function BronzeShield({ size, color, colorSecondary }: { size: number; color: string; colorSecondary: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="bronze-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={colorSecondary} />
        </linearGradient>
      </defs>
      <path
        d="M32,4 L56,14 L56,36 Q56,52 32,60 Q8,52 8,36 L8,14 Z"
        fill="url(#bronze-fill)"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.9"
      />
      <path
        d="M32,10 L50,18 L50,35 Q50,48 32,54 Q14,48 14,35 L14,18 Z"
        fill="#0C0C0C"
        opacity="0.7"
      />
      <path
        d="M32,16 L44,22 L44,34 Q44,44 32,48 Q20,44 20,34 L20,22 Z"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.5"
      />
    </svg>
  );
}

function SilverShield({ size, color, colorSecondary }: { size: number; color: string; colorSecondary: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="silver-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={colorSecondary} />
        </linearGradient>
      </defs>
      {/* Wings */}
      <path d="M8,20 Q2,14 4,8 Q10,12 14,16 Z" fill={colorSecondary} opacity="0.6" />
      <path d="M56,20 Q62,14 60,8 Q54,12 50,16 Z" fill={colorSecondary} opacity="0.6" />
      <path d="M10,26 Q3,22 2,16 Q9,18 14,22 Z" fill={colorSecondary} opacity="0.4" />
      <path d="M54,26 Q61,22 62,16 Q55,18 50,22 Z" fill={colorSecondary} opacity="0.4" />
      {/* Shield body */}
      <path
        d="M32,6 L54,14 L54,36 Q54,50 32,58 Q10,50 10,36 L10,14 Z"
        fill="url(#silver-fill)"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.9"
      />
      <path
        d="M32,12 L48,18 L48,35 Q48,46 32,52 Q16,46 16,35 L16,18 Z"
        fill="#0C0C0C"
        opacity="0.7"
      />
      {/* Star detail */}
      <path
        d="M32,22 L34,28 L40,28 L35,32 L37,38 L32,34 L27,38 L29,32 L24,28 L30,28 Z"
        fill={color}
        opacity="0.3"
      />
    </svg>
  );
}

function GoldShield({ size, color, colorSecondary }: { size: number; color: string; colorSecondary: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="gold-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="50%" stopColor="#FFEC8B" />
          <stop offset="100%" stopColor={colorSecondary} />
        </linearGradient>
      </defs>
      {/* Laurel left */}
      <path d="M12,44 Q6,38 8,30 Q12,34 14,38 Q10,36 8,34 Q9,40 12,44 Z" fill="#5A8C32" opacity="0.7" />
      <path d="M10,38 Q5,32 6,24 Q10,28 12,32 Z" fill="#5A8C32" opacity="0.5" />
      <path d="M9,32 Q4,26 6,18 Q9,22 10,26 Z" fill="#5A8C32" opacity="0.4" />
      {/* Laurel right */}
      <path d="M52,44 Q58,38 56,30 Q52,34 50,38 Q54,36 56,34 Q55,40 52,44 Z" fill="#5A8C32" opacity="0.7" />
      <path d="M54,38 Q59,32 58,24 Q54,28 52,32 Z" fill="#5A8C32" opacity="0.5" />
      <path d="M55,32 Q60,26 58,18 Q55,22 54,26 Z" fill="#5A8C32" opacity="0.4" />
      {/* Ornate shield */}
      <path
        d="M32,4 L56,14 L56,36 Q56,52 32,60 Q8,52 8,36 L8,14 Z"
        fill="url(#gold-fill)"
        stroke={color}
        strokeWidth="2"
        opacity="0.95"
      />
      <path
        d="M32,10 L50,18 L50,35 Q50,48 32,54 Q14,48 14,35 L14,18 Z"
        fill="#0C0C0C"
        opacity="0.75"
      />
      {/* Crown detail at top */}
      <path
        d="M24,14 L28,8 L32,12 L36,8 L40,14"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.6"
      />
      {/* Diamond center */}
      <path d="M32,24 L38,32 L32,40 L26,32 Z" fill={color} opacity="0.25" />
    </svg>
  );
}

function PlatinumHex({ size, color, colorSecondary }: { size: number; color: string; colorSecondary: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="plat-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor={colorSecondary} />
        </linearGradient>
      </defs>
      {/* Hexagon */}
      <path
        d="M32,4 L56,18 L56,46 L32,60 L8,46 L8,18 Z"
        fill="url(#plat-fill)"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.9"
      />
      <path
        d="M32,10 L50,21 L50,43 L32,54 L14,43 L14,21 Z"
        fill="#0C0C0C"
        opacity="0.75"
      />
      {/* Stars */}
      <circle cx="32" cy="26" r="2" fill={color} opacity="0.5" />
      <circle cx="24" cy="36" r="1.5" fill={color} opacity="0.4" />
      <circle cx="40" cy="36" r="1.5" fill={color} opacity="0.4" />
      <circle cx="32" cy="42" r="1" fill={color} opacity="0.3" />
      {/* Inner hexagon line */}
      <path
        d="M32,18 L44,26 L44,38 L32,46 L20,38 L20,26 Z"
        fill="none"
        stroke={color}
        strokeWidth="0.6"
        opacity="0.3"
      />
    </svg>
  );
}

function DiamondCrystal({ size, color, colorSecondary }: { size: number; color: string; colorSecondary: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="diamond-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor={colorSecondary} />
        </linearGradient>
      </defs>
      {/* Crystal shape with facets */}
      <path
        d="M32,2 L48,16 L54,32 L48,48 L32,62 L16,48 L10,32 L16,16 Z"
        fill="url(#diamond-fill)"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.85"
      />
      {/* Inner dark */}
      <path
        d="M32,8 L44,18 L48,32 L44,46 L32,56 L20,46 L16,32 L20,18 Z"
        fill="#0C0C0C"
        opacity="0.7"
      />
      {/* Facet lines */}
      <path d="M32,8 L32,56" stroke={color} strokeWidth="0.4" opacity="0.3" />
      <path d="M16,32 L48,32" stroke={color} strokeWidth="0.4" opacity="0.3" />
      <path d="M20,18 L44,46" stroke={color} strokeWidth="0.4" opacity="0.2" />
      <path d="M44,18 L20,46" stroke={color} strokeWidth="0.4" opacity="0.2" />
      {/* Center sparkle */}
      <path d="M32,28 L34,32 L32,36 L30,32 Z" fill={color} opacity="0.5" />
      <path d="M28,32 L32,30 L36,32 L32,34 Z" fill={color} opacity="0.4" />
    </svg>
  );
}

function LegendCrown({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="legend-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFBF00" />
          <stop offset="100%" stopColor="#FF9D00" />
        </linearGradient>
        <filter id="legend-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Flame elements behind crown */}
      <path d="M16,32 Q14,20 20,12 Q18,24 22,28 Z" fill="#FF6600" opacity="0.4" />
      <path d="M22,28 Q20,18 26,8 Q24,20 28,26 Z" fill="#FF9D00" opacity="0.5" />
      <path d="M32,24 Q30,14 32,4 Q34,14 34,24 Z" fill="#FFBF00" opacity="0.5" />
      <path d="M42,28 Q44,18 38,8 Q40,20 36,26 Z" fill="#FF9D00" opacity="0.5" />
      <path d="M48,32 Q50,20 44,12 Q46,24 42,28 Z" fill="#FF6600" opacity="0.4" />
      {/* Crown body */}
      <path
        d="M12,36 L18,22 L26,32 L32,18 L38,32 L46,22 L52,36 L52,48 Q52,52 48,54 L16,54 Q12,52 12,48 Z"
        fill="url(#legend-fill)"
        stroke="#FFBF00"
        strokeWidth="1.5"
        filter="url(#legend-glow)"
      />
      {/* Dark inner */}
      <path
        d="M16,38 L20,28 L27,35 L32,24 L37,35 L44,28 L48,38 L48,46 Q48,48 46,50 L18,50 Q16,48 16,46 Z"
        fill="#0C0C0C"
        opacity="0.6"
      />
      {/* Gems on the crown */}
      <circle cx="22" cy="42" r="2.5" fill="#FF3333" opacity="0.8" />
      <circle cx="32" cy="38" r="3" fill="#FFBF00" opacity="0.8" />
      <circle cx="42" cy="42" r="2.5" fill="#FF3333" opacity="0.8" />
      {/* Crown band detail */}
      <path d="M16,50 L48,50" stroke="#FFBF00" strokeWidth="1" opacity="0.6" />
      <path
        d="M14,54 L50,54 L52,58 L12,58 Z"
        fill="url(#legend-fill)"
        opacity="0.8"
      />
    </svg>
  );
}

function TierShape({ tier, size }: { tier: RankTier; size: number }) {
  const config = tierConfig[tier];

  switch (tier) {
    case 'bronze':
      return <BronzeShield size={size} color={config.color} colorSecondary={config.colorSecondary} />;
    case 'silver':
      return <SilverShield size={size} color={config.color} colorSecondary={config.colorSecondary} />;
    case 'gold':
      return <GoldShield size={size} color={config.color} colorSecondary={config.colorSecondary} />;
    case 'platinum':
      return <PlatinumHex size={size} color={config.color} colorSecondary={config.colorSecondary} />;
    case 'diamond':
      return <DiamondCrystal size={size} color={config.color} colorSecondary={config.colorSecondary} />;
    case 'legend':
      return <LegendCrown size={size} />;
  }
}

export function RankEmblem({ tier, size = 'md', showLabel = true, className }: RankEmblemProps) {
  const config = tierConfig[tier];
  const sizeConfig = sizeMap[size];

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <motion.div
        className="relative"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        animate={{
          filter: [
            `drop-shadow(0 0 4px ${config.glowColor})`,
            `drop-shadow(0 0 12px ${config.glowColor})`,
            `drop-shadow(0 0 4px ${config.glowColor})`,
          ],
        }}
        style={{
          animationDuration: '3s',
        }}
      >
        {/* Animated border glow ring */}
        <motion.div
          className="absolute -inset-1 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 4px 1px ${config.glowColor}`,
              `0 0 12px 3px ${config.glowColor}`,
              `0 0 4px 1px ${config.glowColor}`,
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <TierShape tier={tier} size={sizeConfig.px} />
      </motion.div>

      {showLabel && (
        <div className="flex flex-col items-center gap-0.5">
          <motion.span
            className={cn('font-display font-bold uppercase tracking-wider', sizeConfig.labelClass)}
            style={{ color: config.color }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {config.label}
          </motion.span>
          <span className={cn('text-ecs-gray/60 font-display tracking-wider', sizeConfig.rangeClass)}>
            {config.levelRange}
          </span>
        </div>
      )}
    </div>
  );
}
