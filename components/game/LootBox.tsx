'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Sparkles, Star, Award, Coins } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { BADGE_RARITIES } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Rarity = keyof typeof BADGE_RARITIES;

type LootBoxPhase = 'idle' | 'shaking' | 'opening' | 'revealed';

interface LootBoxReward {
  name: string;
  xp: number;
  rarity: Rarity;
  badgeName?: string;
}

interface LootBoxProps {
  reward: LootBoxReward;
  onOpen?: () => void;
  onClose?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Rarity config                                                      */
/* ------------------------------------------------------------------ */

interface RarityVisual {
  glowColor: string;
  borderColor: string;
  bgGlow: string;
  confetti: boolean;
  particleCount: number;
  shakeIntensity: number;
  shakeDuration: number;
}

const RARITY_VISUALS: Record<Rarity, RarityVisual> = {
  common: {
    glowColor: 'rgba(136, 136, 136, 0.3)',
    borderColor: 'rgba(136, 136, 136, 0.3)',
    bgGlow: 'rgba(136, 136, 136, 0.05)',
    confetti: false,
    particleCount: 0,
    shakeIntensity: 2,
    shakeDuration: 0.4,
  },
  rare: {
    glowColor: 'rgba(59, 130, 246, 0.4)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    bgGlow: 'rgba(59, 130, 246, 0.06)',
    confetti: true,
    particleCount: 16,
    shakeIntensity: 4,
    shakeDuration: 0.6,
  },
  epic: {
    glowColor: 'rgba(168, 85, 247, 0.5)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    bgGlow: 'rgba(168, 85, 247, 0.08)',
    confetti: true,
    particleCount: 24,
    shakeIntensity: 6,
    shakeDuration: 0.8,
  },
  legendary: {
    glowColor: 'rgba(255, 191, 0, 0.5)',
    borderColor: 'rgba(255, 191, 0, 0.5)',
    bgGlow: 'rgba(255, 191, 0, 0.1)',
    confetti: true,
    particleCount: 36,
    shakeIntensity: 8,
    shakeDuration: 1.2,
  },
};

/* ------------------------------------------------------------------ */
/*  Confetti                                                           */
/* ------------------------------------------------------------------ */

interface ConfettiPiece {
  angle: number;
  distance: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  rotateEnd: number;
  drift: number;
}

function generateConfetti(rarity: Rarity): ConfettiPiece[] {
  const visual = RARITY_VISUALS[rarity];
  if (!visual.confetti) return [];

  const rarityColor = BADGE_RARITIES[rarity].color;
  const colors = [rarityColor, '#FFFFFF', '#FFBF00', rarityColor, '#FF9D00'];

  return Array.from({ length: visual.particleCount }, (_, i) => ({
    angle: (i / visual.particleCount) * 360 + (Math.random() - 0.5) * 25,
    distance: 60 + Math.random() * 120,
    size: 3 + Math.random() * 6,
    duration: 1 + Math.random() * 0.8,
    delay: Math.random() * 0.3,
    color: colors[i % colors.length],
    rotateEnd: (Math.random() - 0.5) * 720,
    drift: (Math.random() - 0.5) * 30,
  }));
}

function ConfettiParticle({ piece }: { piece: ConfettiPiece }) {
  const endX = Math.cos((piece.angle * Math.PI) / 180) * piece.distance;
  const endY = Math.sin((piece.angle * Math.PI) / 180) * piece.distance + 50;

  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{
        width: piece.size,
        height: piece.size * 0.6,
        background: piece.color,
        top: '50%',
        left: '50%',
        boxShadow: `0 0 4px ${piece.color}60`,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        x: endX + piece.drift,
        y: endY,
        opacity: 0,
        scale: 0.2,
        rotate: piece.rotateEnd,
      }}
      transition={{
        duration: piece.duration,
        delay: piece.delay,
        ease: 'easeOut' as const,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Light ring                                                         */
/* ------------------------------------------------------------------ */

function LightRing({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full border-2 pointer-events-none"
      style={{
        width: 80,
        height: 80,
        top: '50%',
        left: '50%',
        marginTop: -40,
        marginLeft: -40,
        borderColor: color,
      }}
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 3.5, opacity: 0 }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' as const }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Chest / box component                                              */
/* ------------------------------------------------------------------ */

function ChestIcon({ phase, rarity }: { phase: LootBoxPhase; rarity: Rarity }) {
  const visual = RARITY_VISUALS[rarity];
  const rarityInfo = BADGE_RARITIES[rarity];
  const isShaking = phase === 'shaking';

  return (
    <motion.div
      className="relative"
      animate={
        isShaking
          ? {
              x: [0, -visual.shakeIntensity, visual.shakeIntensity, -visual.shakeIntensity, visual.shakeIntensity, 0],
              rotate: [0, -2, 2, -2, 2, 0],
            }
          : { x: 0, rotate: 0 }
      }
      transition={
        isShaking
          ? { duration: 0.3, repeat: Math.floor(visual.shakeDuration / 0.3), ease: 'easeInOut' }
          : { type: 'spring', stiffness: 200, damping: 15 }
      }
    >
      {/* Glow behind chest */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl"
        style={{
          background: `radial-gradient(circle, ${visual.glowColor} 0%, transparent 70%)`,
          transform: 'scale(2)',
          opacity: isShaking ? 0.8 : 0.4,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Chest body */}
      <motion.div
        className="relative flex items-center justify-center w-24 h-24 rounded-2xl border-2"
        style={{
          background: `linear-gradient(180deg, #1E1E1E 0%, #0C0C0C 100%)`,
          borderColor: visual.borderColor,
          boxShadow: `0 0 30px ${visual.glowColor}, inset 0 0 20px ${visual.bgGlow}`,
        }}
        animate={
          isShaking
            ? { scale: [1, 1.05, 0.98, 1.03, 1] }
            : phase === 'opening'
              ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
              : { scale: 1 }
        }
        transition={
          phase === 'opening'
            ? { duration: 0.5, ease: 'easeIn' }
            : { duration: visual.shakeDuration }
        }
      >
        <Package
          className="h-10 w-10"
          style={{
            color: rarityInfo.color,
            filter: `drop-shadow(0 0 8px ${visual.glowColor})`,
          }}
        />

        {/* Rarity label */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <span
            className="text-[8px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              background: `${rarityInfo.color}15`,
              color: rarityInfo.color,
              border: `1px solid ${rarityInfo.color}30`,
            }}
          >
            {rarityInfo.label}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reward reveal                                                      */
/* ------------------------------------------------------------------ */

function RewardReveal({ reward }: { reward: LootBoxReward }) {
  const rarityInfo = BADGE_RARITIES[reward.rarity];

  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}
    >
      {/* Reward icon */}
      <motion.div
        className="flex items-center justify-center w-16 h-16 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${rarityInfo.color}20, ${rarityInfo.color}08)`,
          border: `2px solid ${rarityInfo.color}40`,
          boxShadow: `0 0 30px ${rarityInfo.color}30`,
        }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {reward.badgeName ? (
          <Award className="h-7 w-7" style={{ color: rarityInfo.color }} />
        ) : (
          <Coins className="h-7 w-7" style={{ color: rarityInfo.color }} />
        )}
      </motion.div>

      {/* Reward name */}
      <motion.h4
        className="font-display font-bold text-lg text-white text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ textShadow: `0 0 16px ${rarityInfo.color}40` }}
      >
        {reward.name}
      </motion.h4>

      {/* Badge name if present */}
      {reward.badgeName && (
        <motion.span
          className="text-xs font-display uppercase tracking-wider px-3 py-1 rounded-full"
          style={{
            color: rarityInfo.color,
            background: `${rarityInfo.color}10`,
            border: `1px solid ${rarityInfo.color}25`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {reward.badgeName}
        </motion.span>
      )}

      {/* XP amount */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
            boxShadow: '0 0 12px rgba(255, 191, 0, 0.4)',
          }}
        >
          <Coins className="h-4 w-4 text-ecs-black" />
        </div>
        <span
          className="font-display text-xl font-bold text-gradient-amber"
          style={{ textShadow: '0 0 20px rgba(255, 191, 0, 0.4)' }}
        >
          +{formatXP(reward.xp)} XP
        </span>
      </motion.div>

      {/* Rarity badge */}
      <motion.span
        className="text-[10px] font-display font-bold uppercase tracking-[0.2em]"
        style={{ color: rarityInfo.color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {rarityInfo.label}
      </motion.span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LootBox({ reward, onOpen, onClose }: LootBoxProps) {
  const [phase, setPhase] = useState<LootBoxPhase>('idle');
  const visual = RARITY_VISUALS[reward.rarity];
  const rarityInfo = BADGE_RARITIES[reward.rarity];

  const confettiPieces = useMemo(() => generateConfetti(reward.rarity), [reward.rarity]);

  const handleOpen = useCallback(() => {
    if (phase !== 'idle') return;

    setPhase('shaking');

    // Shake → open → reveal
    const shakeMs = visual.shakeDuration * 1000 + 200;
    const openMs = shakeMs + 500;

    setTimeout(() => setPhase('opening'), shakeMs);
    setTimeout(() => {
      setPhase('revealed');
      onOpen?.();
    }, openMs);
  }, [phase, visual.shakeDuration, onOpen]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Main reveal area */}
      <div className="relative flex items-center justify-center min-h-[200px] w-full">
        {/* Light rings on reveal */}
        <AnimatePresence>
          {phase === 'revealed' && (
            <div className="absolute inset-0 overflow-visible pointer-events-none">
              <LightRing color={`${rarityInfo.color}40`} delay={0} />
              <LightRing color={`${rarityInfo.color}25`} delay={0.2} />
              {(reward.rarity === 'epic' || reward.rarity === 'legendary') && (
                <LightRing color={`${rarityInfo.color}15`} delay={0.4} />
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Confetti on reveal */}
        <AnimatePresence>
          {phase === 'revealed' && confettiPieces.length > 0 && (
            <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
              {confettiPieces.map((piece, i) => (
                <ConfettiParticle key={i} piece={piece} />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Chest or reward */}
        <AnimatePresence mode="wait">
          {phase !== 'revealed' ? (
            <motion.div
              key="chest"
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChestIcon phase={phase} rarity={reward.rarity} />
            </motion.div>
          ) : (
            <motion.div
              key="reward"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <RewardReveal reward={reward} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action button */}
      {phase === 'idle' && (
        <motion.button
          className={cn(
            'flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wider',
            'px-8 py-3.5 rounded-xl text-sm text-ecs-black'
          )}
          style={{
            background: `linear-gradient(135deg, ${rarityInfo.color}, ${rarityInfo.color}CC)`,
            boxShadow: `0 0 20px ${rarityInfo.color}30, 0 0 40px ${rarityInfo.color}15`,
          }}
          onClick={handleOpen}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          animate={{
            boxShadow: [
              `0 0 20px ${rarityInfo.color}25`,
              `0 0 30px ${rarityInfo.color}40`,
              `0 0 20px ${rarityInfo.color}25`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-4 w-4" />
          Ouvrir
        </motion.button>
      )}

      {phase === 'revealed' && (
        <motion.button
          className="btn-secondary"
          onClick={handleClose}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          Continuer
        </motion.button>
      )}
    </div>
  );
}
