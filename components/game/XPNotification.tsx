'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';

interface TrailParticle {
  id: number;
  y: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
}

function ParticleTrail({ particles }: { particles: TrailParticle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.id % 2 === 0 ? '#FFBF00' : '#FF9D00',
            top: p.y,
            left: p.x,
            boxShadow: `0 0 4px ${p.id % 2 === 0 ? '#FFBF00' : '#FF9D00'}80`,
          }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 0,
            y: -20 + Math.random() * 10,
            x: (Math.random() - 0.5) * 20,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: 'easeOut' as const,
          }}
        />
      ))}
    </div>
  );
}

export function XPNotification() {
  const xpNotification = usePlayerStore((s) => s.xpNotification);
  const clearXPNotification = usePlayerStore((s) => s.clearXPNotification);

  const handleClear = useCallback(() => {
    clearXPNotification();
  }, [clearXPNotification]);

  useEffect(() => {
    if (!xpNotification) return;

    const timer = setTimeout(handleClear, 3000);
    return () => clearTimeout(timer);
  }, [xpNotification, handleClear]);

  const trailParticles: TrailParticle[] = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        y: 10 + Math.random() * 30,
        x: 10 + Math.random() * 40,
        size: 2 + Math.random() * 3,
        delay: i * 0.12,
        duration: 0.8 + Math.random() * 0.4,
      })),
    [xpNotification] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <AnimatePresence>
      {xpNotification && (
        <motion.div
          className="fixed right-4 top-4 z-50 overflow-hidden rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%)',
            border: '1px solid rgba(255, 191, 0, 0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(255, 191, 0, 0.12)',
          }}
          initial={{ opacity: 0, x: 80, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 22,
          }}
        >
          {/* Particle trail */}
          <ParticleTrail particles={trailParticles} />

          {/* Top gradient accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, #FFBF00, #FF9D00, transparent)',
            }}
          />

          <div className="relative z-10 flex items-center gap-3 p-4 pr-5">
            {/* Icon */}
            <motion.div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.15), rgba(255, 157, 0, 0.08))',
                border: '1px solid rgba(255, 191, 0, 0.2)',
              }}
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 12,
                delay: 0.1,
              }}
            >
              <Sparkles className="h-5 w-5 text-ecs-amber" />
            </motion.div>

            <div>
              {/* XP amount with scale pop */}
              <motion.p
                className="font-display text-xl font-bold text-gradient-amber leading-none"
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 14,
                  delay: 0.15,
                }}
                style={{
                  textShadow: '0 0 16px rgba(255, 191, 0, 0.4)',
                }}
              >
                +{xpNotification.amount} XP
              </motion.p>

              {/* Source label */}
              <motion.p
                className="mt-1 text-xs text-ecs-gray"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {xpNotification.source}
              </motion.p>
            </div>
          </div>

          {/* Auto-dismiss progress bar */}
          <div className="h-[2px] bg-ecs-gray-dark/20">
            <div
              className="h-full animate-drain"
              style={{
                background: 'linear-gradient(90deg, #FFBF00, #FF9D00)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
