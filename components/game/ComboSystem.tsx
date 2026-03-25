'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComboStore, getComboMultiplier } from '@/stores/useComboStore';

interface FireParticle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  hue: number;
}

function ComboFireParticles({ count }: { count: number }) {
  const particles: FireParticle[] = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: -30 + Math.random() * 60,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.5,
        duration: 0.6 + Math.random() * 0.5,
        hue: 20 + Math.random() * 30,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `calc(50% + ${p.x}px)`,
            bottom: -10,
            background: `hsl(${p.hue}, 100%, 55%)`,
            boxShadow: `0 0 8px hsl(${p.hue}, 100%, 55%)`,
          }}
          animate={{
            y: [-10, -80 - Math.random() * 40],
            opacity: [0.9, 0],
            scale: [1, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 0.3,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function ComboSystem() {
  const currentCombo = useComboStore((s) => s.currentCombo);
  const lastActionTime = useComboStore((s) => s.lastActionTime);
  const resetCombo = useComboStore((s) => s.resetCombo);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const multiplier = getComboMultiplier(currentCombo);
  const showCombo = currentCombo >= 2;
  const isHighCombo = currentCombo >= 5;
  const isUltraCombo = currentCombo >= 8;

  useEffect(() => {
    if (!showCombo) return;

    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }

    fadeTimerRef.current = setTimeout(() => {
      resetCombo();
    }, 5000);

    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, [lastActionTime, showCombo, resetCombo]);

  const glowIntensity = Math.min(currentCombo * 4, 30);
  const shakeIntensity = isHighCombo ? 2 : 0;

  return (
    <AnimatePresence>
      {showCombo && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative flex flex-col items-center"
            animate={
              shakeIntensity > 0
                ? {
                    x: [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0],
                    y: [0, shakeIntensity, -shakeIntensity, shakeIntensity, 0],
                  }
                : {}
            }
            transition={
              shakeIntensity > 0
                ? { duration: 0.4, repeat: Infinity, repeatDelay: 0.8 }
                : {}
            }
          >
            {/* Fire particles at high combos */}
            {isHighCombo && (
              <ComboFireParticles count={isUltraCombo ? 20 : 10} />
            )}

            {/* COMBO text */}
            <motion.div
              key={`combo-${currentCombo}`}
              className="font-display font-bold uppercase tracking-[0.3em] select-none"
              style={{
                fontSize: Math.min(24 + currentCombo * 3, 48),
                color: isUltraCombo ? '#FF6600' : isHighCombo ? '#FF9D00' : '#FFBF00',
                textShadow: `0 0 ${glowIntensity}px ${
                  isUltraCombo ? '#FF6600' : '#FFBF00'
                }, 0 0 ${glowIntensity * 2}px ${
                  isUltraCombo ? 'rgba(255, 102, 0, 0.4)' : 'rgba(255, 191, 0, 0.3)'
                }`,
              }}
              initial={{ scale: 2.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 15,
              }}
            >
              Combo x{currentCombo}!
            </motion.div>

            {/* Multiplier */}
            <motion.div
              className="mt-1 font-display text-sm tracking-wider"
              style={{
                color: 'rgba(255, 191, 0, 0.7)',
                textShadow: '0 0 8px rgba(255, 191, 0, 0.3)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {multiplier.toFixed(1)}x multiplicateur
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
