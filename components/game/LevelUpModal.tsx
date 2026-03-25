'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { LEVEL_TITLES } from '@/lib/constants';

const PARTICLE_COUNT = 24;

function Particle({ index }: { index: number }) {
  const angle = (index / PARTICLE_COUNT) * 360;
  const distance = 80 + Math.random() * 120;
  const size = 4 + Math.random() * 6;
  const duration = 1.2 + Math.random() * 0.8;
  const delay = Math.random() * 0.4;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: index % 2 === 0 ? '#FFBF00' : '#FF9D00',
        top: '50%',
        left: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        opacity: 0,
        scale: 0,
      }}
      transition={{ duration, delay, ease: 'easeOut' as const }}
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

  return (
    <AnimatePresence>
      {showLevelUpModal && newLevel && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
        >
          <motion.div
            className="relative flex flex-col items-center gap-6 rounded-lg border border-ecs-amber/20 bg-ecs-black-card p-10 text-center shadow-amber-glow-lg"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Particles */}
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <Particle key={i} index={i} />
              ))}
            </div>

            <p className="text-sm font-display uppercase tracking-widest text-ecs-gray">
              Niveau supérieur !
            </p>

            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-ecs-amber bg-gradient-amber text-ecs-black"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            >
              <span className="font-display text-4xl font-bold">{newLevel}</span>
            </motion.div>

            <motion.p
              className="text-2xl font-display font-bold text-gradient-amber"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {title}
            </motion.p>

            <motion.button
              className="btn-primary mt-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={handleDismiss}
            >
              Continuer
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
