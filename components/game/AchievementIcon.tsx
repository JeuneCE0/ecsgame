'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type AchievementSize = 'sm' | 'md' | 'lg';

interface AchievementIconProps {
  rarity: AchievementRarity;
  icon: ReactNode;
  earned: boolean;
  name: string;
  size?: AchievementSize;
  className?: string;
}

const sizeConfig: Record<AchievementSize, {
  outer: number;
  iconSize: string;
  lockSize: number;
  nameText: string;
}> = {
  sm: { outer: 40, iconSize: 'w-4 h-4', lockSize: 12, nameText: 'text-[9px]' },
  md: { outer: 56, iconSize: 'w-5 h-5', lockSize: 16, nameText: 'text-[10px]' },
  lg: { outer: 80, iconSize: 'w-7 h-7', lockSize: 22, nameText: 'text-xs' },
};

interface RarityStyle {
  borderColor: string;
  glowColor: string;
  bgGlow: string;
  label: string;
}

const rarityStyles: Record<AchievementRarity, RarityStyle> = {
  common: {
    borderColor: '#888888',
    glowColor: 'rgba(136, 136, 136, 0.3)',
    bgGlow: 'rgba(136, 136, 136, 0.05)',
    label: 'Commun',
  },
  rare: {
    borderColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    bgGlow: 'rgba(59, 130, 246, 0.08)',
    label: 'Rare',
  },
  epic: {
    borderColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    bgGlow: 'rgba(168, 85, 247, 0.08)',
    label: 'Epique',
  },
  legendary: {
    borderColor: '#FFBF00',
    glowColor: 'rgba(255, 191, 0, 0.5)',
    bgGlow: 'rgba(255, 191, 0, 0.1)',
    label: 'Legendaire',
  },
};

function HexagonClipPath({ size }: { size: number }) {
  const half = size / 2;
  const h = half * 0.866;
  const q = half * 0.5;

  return `polygon(${half}px 0px, ${half + h}px ${q}px, ${half + h}px ${half + q}px, ${half}px ${size}px, ${half - h}px ${half + q}px, ${half - h}px ${q}px)`;
}

function CommonEffect({ size }: { size: number }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ clipPath: HexagonClipPath({ size }) }}
      animate={{
        boxShadow: [
          'inset 0 0 8px rgba(136, 136, 136, 0.1)',
          'inset 0 0 16px rgba(136, 136, 136, 0.25)',
          'inset 0 0 8px rgba(136, 136, 136, 0.1)',
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function RareEffect({ size }: { size: number }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ clipPath: HexagonClipPath({ size }) }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(59, 130, 246, 0.3) 50%, transparent 60%)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

function EpicEffect({ size }: { size: number }) {
  return (
    <motion.div
      className="absolute -inset-[2px] pointer-events-none"
      style={{ clipPath: HexagonClipPath({ size: size + 4 }) }}
      animate={{
        background: [
          'linear-gradient(0deg, #A855F7, #6D28D9, #A855F7)',
          'linear-gradient(120deg, #A855F7, #6D28D9, #A855F7)',
          'linear-gradient(240deg, #A855F7, #6D28D9, #A855F7)',
          'linear-gradient(360deg, #A855F7, #6D28D9, #A855F7)',
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
  );
}

function LegendaryEffect({ size }: { size: number }) {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360,
    delay: i * 0.25,
  }));

  const radius = size / 2 + 6;

  return (
    <>
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: HexagonClipPath({ size }) }}
        animate={{
          boxShadow: [
            'inset 0 0 10px rgba(255, 191, 0, 0.2), 0 0 8px rgba(255, 191, 0, 0.2)',
            'inset 0 0 20px rgba(255, 191, 0, 0.4), 0 0 16px rgba(255, 191, 0, 0.4)',
            'inset 0 0 10px rgba(255, 191, 0, 0.2), 0 0 8px rgba(255, 191, 0, 0.2)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting particles */}
      {particles.map((p) => (
        <motion.div
          key={p.angle}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3,
            height: 3,
            background: '#FFBF00',
            boxShadow: '0 0 4px 1px rgba(255, 191, 0, 0.6)',
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [
              Math.cos((p.angle * Math.PI) / 180) * radius - 1.5,
              Math.cos(((p.angle + 360) * Math.PI) / 180) * radius - 1.5,
            ],
            y: [
              Math.sin((p.angle * Math.PI) / 180) * radius - 1.5,
              Math.sin(((p.angle + 360) * Math.PI) / 180) * radius - 1.5,
            ],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            x: { duration: 6, repeat: Infinity, ease: 'linear', delay: p.delay },
            y: { duration: 6, repeat: Infinity, ease: 'linear', delay: p.delay },
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
          }}
        />
      ))}
    </>
  );
}

export function AchievementIcon({
  rarity,
  icon,
  earned,
  name,
  size = 'md',
  className,
}: AchievementIconProps) {
  const config = sizeConfig[size];
  const style = rarityStyles[rarity];

  return (
    <div className={cn('group relative inline-flex flex-col items-center gap-1.5', className)}>
      <motion.div
        className="relative"
        style={{ width: config.outer, height: config.outer }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {/* Rarity effects for earned achievements */}
        {earned && rarity === 'common' && <CommonEffect size={config.outer} />}
        {earned && rarity === 'rare' && <RareEffect size={config.outer} />}
        {earned && rarity === 'epic' && (
          <>
            <EpicEffect size={config.outer} />
            {/* Inner content must re-clip over the border effect */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: HexagonClipPath({ size: config.outer }),
                background: '#0C0C0C',
              }}
            />
          </>
        )}
        {earned && rarity === 'legendary' && <LegendaryEffect size={config.outer} />}

        {/* Hexagonal main shape */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            clipPath: HexagonClipPath({ size: config.outer }),
            background: earned
              ? `linear-gradient(180deg, #1A1A1A 0%, #0C0C0C 100%)`
              : '#111111',
            border: 'none',
          }}
        >
          {/* Colored inner glow for earned */}
          {earned && (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, ${style.bgGlow} 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Icon */}
          <div
            className={cn(
              'relative z-10',
              config.iconSize,
              earned ? '' : 'grayscale opacity-30'
            )}
            style={earned ? { color: style.borderColor } : { color: '#555555' }}
          >
            {icon}
          </div>

          {/* Lock overlay for unearned */}
          {!earned && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Lock size={config.lockSize} className="text-ecs-gray/40" />
            </div>
          )}
        </div>

        {/* Hex border */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={config.outer}
          height={config.outer}
          viewBox={`0 0 ${config.outer} ${config.outer}`}
        >
          {(() => {
            const s = config.outer;
            const half = s / 2;
            const h = half * 0.866;
            const q = half * 0.5;
            const points = `${half},1 ${half + h - 1},${q} ${half + h - 1},${half + q} ${half},${s - 1} ${half - h + 1},${half + q} ${half - h + 1},${q}`;
            return (
              <polygon
                points={points}
                fill="none"
                stroke={earned ? style.borderColor : '#333333'}
                strokeWidth="1.5"
                opacity={earned ? 0.7 : 0.3}
              />
            );
          })()}
        </svg>
      </motion.div>

      {/* Tooltip on hover */}
      <div
        className={cn(
          'absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap',
          'bg-ecs-black-card border border-ecs-gray-border rounded px-2 py-1',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30',
          config.nameText
        )}
      >
        <span className="text-ecs-gray font-display">{name}</span>
        <span className="ml-1.5 font-display font-bold" style={{ color: earned ? style.borderColor : '#555555' }}>
          {style.label}
        </span>
      </div>
    </div>
  );
}
