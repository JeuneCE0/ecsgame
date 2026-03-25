'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { LEVEL_TITLES } from '@/lib/constants';

const PARTICLE_COUNT = 36;

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

function ConfettiParticle({ piece }: { piece: ConfettiPiece }) {
  const endX = Math.cos((piece.angle * Math.PI) / 180) * piece.distance;
  const endY = Math.sin((piece.angle * Math.PI) / 180) * piece.distance + 80;

  return (
    <motion.div
      className="absolute rounded-sm"
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
        scale: 0.3,
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

function LightRing({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full border pointer-events-none"
      style={{
        width: 120,
        height: 120,
        top: '50%',
        left: '50%',
        marginTop: -60,
        marginLeft: -60,
        borderColor: 'rgba(255, 191, 0, 0.3)',
        borderWidth: 2,
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{
        duration: 1.8,
        delay,
        ease: 'easeOut' as const,
      }}
    />
  );
}

export function LevelUpModal() {
  const showLevelUpModal = usePlayerStore((s) => s.showLevelUpModal);
  const newLevel = usePlayerStore((s) => s.newLevel);
  const dismissLevelUp = usePlayerStore((s) => s.dismissLevelUp);

  const handleDismiss = useCallback(() => {
    dismissLevelUp();
  }, [dismissLevelUp]);

  useEffect(() => {
    if (!showLevelUpModal) return;

    const timer = setTimeout(handleDismiss, 5000);
    return () => clearTimeout(timer);
  }, [showLevelUpModal, handleDismiss]);

  const title = newLevel ? (LEVEL_TITLES[newLevel] ?? `Niveau ${newLevel}`) : '';

  const confettiColors = ['#FFBF00', '#FF9D00', '#FFD700', '#FFA500', '#FFFFFF'];

  const confettiPieces: ConfettiPiece[] = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * 360 + (Math.random() - 0.5) * 30,
      distance: 100 + Math.random() * 160,
      size: 4 + Math.random() * 8,
      duration: 1.5 + Math.random() * 1,
      delay: 0.1 + Math.random() * 0.5,
      color: confettiColors[i % confettiColors.length],
      rotateEnd: (Math.random() - 0.5) * 1080,
      drift: (Math.random() - 0.5) * 40,
    })), [newLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {showLevelUpModal && newLevel && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleDismiss}
        >
          {/* Dark overlay with radial glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 191, 0, 0.05) 0%, rgba(0,0,0,0.9) 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Backdrop blur */}
          <div className="absolute inset-0 backdrop-blur-md" />

          {/* Expanding light rings */}
          <div className="absolute pointer-events-none" style={{ top: '50%', left: '50%' }}>
            <LightRing delay={0.2} />
            <LightRing delay={0.5} />
            <LightRing delay={0.8} />
          </div>

          {/* Main card */}
          <motion.div
            className="relative flex flex-col items-center gap-6 rounded-2xl p-12 text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%)',
              border: '1px solid rgba(255, 191, 0, 0.2)',
              boxShadow: '0 0 60px rgba(255, 191, 0, 0.15), 0 0 120px rgba(255, 157, 0, 0.08)',
            }}
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti burst */}
            <div className="pointer-events-none absolute inset-0 overflow-visible">
              {confettiPieces.map((piece, i) => (
                <ConfettiParticle key={i} piece={piece} />
              ))}
            </div>

            {/* "LEVEL UP" text */}
            <motion.p
              className="text-xs font-display uppercase tracking-[0.4em] text-gradient-amber"
              initial={{ opacity: 0, y: -10, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.4em' }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                textShadow: '0 0 20px rgba(255, 191, 0, 0.4)',
              }}
            >
              Level Up
            </motion.p>

            {/* Big level number in a circle */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.2 }}
            >
              {/* Outer glowing ring */}
              <div
                className="absolute -inset-3 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #FFBF00, #FF9D00, #FFD700, #FFBF00)',
                  filter: 'blur(8px)',
                  opacity: 0.4,
                }}
              />
              <div
                className="absolute -inset-2 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #FFBF00, #FF9D00, #FFD700, #FFBF00)',
                  opacity: 0.6,
                }}
              />

              {/* Inner circle */}
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #1E1E1E 0%, #0C0C0C 100%)',
                  boxShadow: 'inset 0 0 20px rgba(255, 191, 0, 0.15)',
                }}
              >
                <motion.span
                  className="font-display text-5xl font-bold text-gradient-amber"
                  initial={{ scale: 3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 250,
                    damping: 14,
                    delay: 0.4,
                  }}
                  style={{
                    textShadow: '0 0 30px rgba(255, 191, 0, 0.5)',
                  }}
                >
                  {newLevel}
                </motion.span>
              </div>
            </motion.div>

            {/* Rank title */}
            <motion.p
              className="text-2xl font-display font-bold text-gradient-amber"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {title}
            </motion.p>

            {/* Subtitle */}
            <motion.p
              className="text-sm text-ecs-gray max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Nouveau rang debloque. Continuez votre progression !
            </motion.p>

            {/* Continue button */}
            <motion.button
              className="btn-primary mt-2 relative overflow-hidden"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
            >
              Continuer
            </motion.button>

            {/* Auto-close progress bar */}
            <div className="w-full h-[2px] rounded-full overflow-hidden mt-2 bg-ecs-gray-dark/30">
              <div
                className="h-full rounded-full animate-drain"
                style={{
                  background: 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
