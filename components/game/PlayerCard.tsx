'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Trophy, Flame, Sparkles } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { LEVEL_TITLES } from '@/lib/constants';
import { AvatarDisplay } from '@/components/game/AvatarDisplay';
import { RankEmblem } from '@/components/game/RankEmblem';
import { LevelBadge } from '@/components/game/LevelBadge';

type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';

interface Badge {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface PlayerCardProps {
  name: string;
  avatarUrl?: string;
  level: number;
  rankTier: RankTier;
  totalXP: number;
  currentStreak: number;
  topBadges: Badge[];
  shareUrl?: string;
}

const RARITY_COLORS: Record<Badge['rarity'], string> = {
  common: '#888888',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#FFBF00',
};

const TIER_PATTERNS: Record<RankTier, { primary: string; secondary: string }> = {
  bronze: { primary: 'rgba(205, 127, 50, 0.08)', secondary: 'rgba(139, 90, 43, 0.04)' },
  silver: { primary: 'rgba(192, 192, 192, 0.08)', secondary: 'rgba(128, 128, 128, 0.04)' },
  gold: { primary: 'rgba(255, 215, 0, 0.08)', secondary: 'rgba(204, 153, 0, 0.04)' },
  platinum: { primary: 'rgba(229, 228, 226, 0.08)', secondary: 'rgba(160, 160, 160, 0.04)' },
  diamond: { primary: 'rgba(185, 242, 255, 0.08)', secondary: 'rgba(125, 212, 232, 0.04)' },
  legend: { primary: 'rgba(255, 191, 0, 0.1)', secondary: 'rgba(255, 157, 0, 0.06)' },
};

const TIER_BORDER: Record<RankTier, string> = {
  bronze: 'rgba(205, 127, 50, 0.3)',
  silver: 'rgba(192, 192, 192, 0.3)',
  gold: 'rgba(255, 215, 0, 0.3)',
  platinum: 'rgba(229, 228, 226, 0.3)',
  diamond: 'rgba(185, 242, 255, 0.3)',
  legend: 'rgba(255, 191, 0, 0.4)',
};

const TIER_GLOW: Record<RankTier, string> = {
  bronze: '0 0 30px rgba(205, 127, 50, 0.15)',
  silver: '0 0 30px rgba(192, 192, 192, 0.15)',
  gold: '0 0 30px rgba(255, 215, 0, 0.15)',
  platinum: '0 0 30px rgba(229, 228, 226, 0.15)',
  diamond: '0 0 30px rgba(185, 242, 255, 0.2)',
  legend: '0 0 40px rgba(255, 191, 0, 0.25)',
};

export function PlayerCard({
  name,
  avatarUrl,
  level,
  rankTier,
  totalXP,
  currentStreak,
  topBadges,
  shareUrl,
}: PlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const title = LEVEL_TITLES[level] ?? `Niveau ${level}`;
  const pattern = TIER_PATTERNS[rankTier];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateY: (x - 0.5) * 16,
      rotateX: (0.5 - y) * 16,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  const handleShare = useCallback(async () => {
    const url = shareUrl ?? globalThis.location?.href ?? '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [shareUrl]);

  return (
    <div style={{ perspective: 800 }} className="inline-block">
      <motion.div
        ref={cardRef}
        className="relative w-[320px] rounded-2xl overflow-hidden cursor-default select-none"
        style={{
          background: `linear-gradient(160deg, ${pattern.primary} 0%, #0C0C0C 40%, #141414 100%)`,
          border: `1px solid ${TIER_BORDER[rankTier]}`,
          boxShadow: isHovered ? TIER_GLOW[rankTier] : '0 8px 32px rgba(0,0,0,0.4)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${pattern.secondary} 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Glass morphism header bar */}
        <div
          className="relative px-5 pt-5 pb-4"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${TIER_BORDER[rankTier]}, transparent)`,
            }}
          />

          <div className="flex items-start gap-4">
            <AvatarDisplay avatarUrl={avatarUrl} name={name} size="lg" />

            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-display font-bold text-lg text-white truncate leading-tight">
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <LevelBadge level={level} size="sm" />
                <span className="text-xs font-display uppercase tracking-wider text-ecs-amber/70">
                  {title}
                </span>
              </div>
            </div>

            <RankEmblem tier={rankTier} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Stats row */}
        <div className="px-5 py-4 border-t border-white/[0.04]">
          <div className="grid grid-cols-3 gap-3">
            {/* Total XP */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-ecs-amber" />
              </div>
              <p className="font-display font-bold text-base text-gradient-amber leading-none">
                {formatXP(totalXP)}
              </p>
              <p className="text-[9px] text-ecs-gray font-display uppercase tracking-widest mt-1">
                XP Total
              </p>
            </div>

            {/* Level */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-3.5 w-3.5 text-ecs-amber" />
              </div>
              <p className="font-display font-bold text-base text-white leading-none">
                {level}
              </p>
              <p className="text-[9px] text-ecs-gray font-display uppercase tracking-widest mt-1">
                Niveau
              </p>
            </div>

            {/* Streak */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="h-3.5 w-3.5 text-ecs-orange" />
              </div>
              <p className="font-display font-bold text-base text-white leading-none">
                {currentStreak}
              </p>
              <p className="text-[9px] text-ecs-gray font-display uppercase tracking-widest mt-1">
                {currentStreak === 1 ? 'Jour' : 'Jours'}
              </p>
            </div>
          </div>
        </div>

        {/* Top badges */}
        {topBadges.length > 0 && (
          <div className="px-5 py-3 border-t border-white/[0.04]">
            <p className="text-[9px] text-ecs-gray font-display uppercase tracking-[0.2em] mb-2.5">
              Badges
            </p>
            <div className="flex items-center gap-2">
              {topBadges.slice(0, 3).map((badge) => (
                <motion.div
                  key={badge.id}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                  style={{
                    background: `linear-gradient(135deg, ${RARITY_COLORS[badge.rarity]}15, ${RARITY_COLORS[badge.rarity]}08)`,
                    border: `1px solid ${RARITY_COLORS[badge.rarity]}30`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span
                    className="text-[10px] font-display font-bold uppercase tracking-wider"
                    style={{ color: RARITY_COLORS[badge.rarity] }}
                  >
                    {badge.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Share button */}
        <div className="px-5 py-3 border-t border-white/[0.04]">
          <motion.button
            type="button"
            onClick={handleShare}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-2.5',
              'font-display text-sm font-bold uppercase tracking-wider',
              'transition-colors duration-200'
            )}
            style={{
              background: copied
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))'
                : 'linear-gradient(135deg, rgba(255, 191, 0, 0.1), rgba(255, 157, 0, 0.06))',
              border: copied
                ? '1px solid rgba(34, 197, 94, 0.3)'
                : '1px solid rgba(255, 191, 0, 0.2)',
              color: copied ? '#22C55E' : '#FFBF00',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Share2 className="h-4 w-4" />
            {copied ? 'Lien copié !' : 'Partager'}
          </motion.button>
        </div>

        {/* Bottom accent line */}
        <div
          className="h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${TIER_BORDER[rankTier]}, transparent)`,
          }}
        />
      </motion.div>
    </div>
  );
}
