'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PowerUpType = 'streak_fire' | 'level_up' | 'badge_earned' | 'xp_boost';

interface ActiveEffect {
  id: number;
  type: PowerUpType;
}

let effectIdCounter = 0;

function StreakFireEffect() {
  const flames = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: (i / 24) * 100,
        width: 20 + Math.random() * 40,
        height: 80 + Math.random() * 120,
        delay: Math.random() * 0.3,
        duration: 0.8 + Math.random() * 0.6,
        hue: 20 + Math.random() * 25,
      })),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {flames.map((f) => (
        <motion.div
          key={f.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${f.x}%`,
            width: f.width,
            height: f.height,
            background: `radial-gradient(ellipse at bottom, hsl(${f.hue}, 100%, 55%) 0%, hsl(${f.hue + 15}, 100%, 40%) 40%, transparent 80%)`,
            filter: 'blur(4px)',
          }}
          initial={{ y: 60, opacity: 0, scaleY: 0.3 }}
          animate={{
            y: [60, -20, 0, -30],
            opacity: [0, 0.8, 0.6, 0],
            scaleY: [0.3, 1.2, 0.9, 0.4],
          }}
          transition={{
            duration: f.duration + 1.2,
            delay: f.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.div>
  );
}

function LevelUpEffect() {
  const rings = useMemo(() => [0, 0.15, 0.3, 0.45], []);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Central flash */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 40,
          height: 40,
          background: 'radial-gradient(circle, #FFBF00 0%, #FF9D00 40%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 30, opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Expanding rings */}
      {rings.map((delay, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            border: `${3 - i * 0.5}px solid rgba(255, 191, 0, ${0.6 - i * 0.1})`,
            boxShadow: `0 0 20px rgba(255, 191, 0, ${0.3 - i * 0.05}), inset 0 0 20px rgba(255, 191, 0, ${0.1})`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 12, opacity: 0 }}
          transition={{ duration: 2, delay, ease: 'easeOut' }}
        />
      ))}

      {/* Radial light rays */}
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute"
          style={{
            width: 2,
            height: 200,
            background: 'linear-gradient(to top, rgba(255, 191, 0, 0.6), transparent)',
            transformOrigin: 'bottom center',
            rotate: i * 30,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.5, delay: 0.1 + i * 0.03, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  );
}

function BadgeEarnedEffect() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 0.8,
        duration: 1 + Math.random() * 1.5,
        drift: (Math.random() - 0.5) * 60,
        hue: Math.random() > 0.5 ? 45 : 280,
      })),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: -10,
            width: s.size,
            height: s.size,
            background: `hsl(${s.hue}, 80%, 70%)`,
            boxShadow: `0 0 ${s.size * 2}px hsl(${s.hue}, 80%, 70%)`,
          }}
          initial={{ y: 0, opacity: 1, x: 0 }}
          animate={{
            y: [0, window?.innerHeight ? window.innerHeight + 20 : 900],
            opacity: [1, 0.8, 0],
            x: [0, s.drift],
            rotate: [0, 360],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </motion.div>
  );
}

function XPBoostEffect() {
  const lines = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * 360;
        const rad = (angle * Math.PI) / 180;
        return {
          id: i,
          angle,
          startX: Math.cos(rad) * 800,
          startY: Math.sin(rad) * 800,
          width: 2 + Math.random() * 2,
          length: 60 + Math.random() * 100,
          delay: Math.random() * 0.3,
        };
      }),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {lines.map((l) => (
        <motion.div
          key={l.id}
          className="absolute"
          style={{
            width: l.width,
            height: l.length,
            background: 'linear-gradient(to bottom, rgba(255, 191, 0, 0.8), transparent)',
            transformOrigin: 'center center',
            rotate: l.angle + 90,
          }}
          initial={{
            x: l.startX,
            y: l.startY,
            opacity: 0,
          }}
          animate={{
            x: [l.startX, l.startX * 0.1, 0],
            y: [l.startY, l.startY * 0.1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: l.delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Center impact flash */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 20,
          height: 20,
          background: 'radial-gradient(circle, #fff 0%, #FFBF00 40%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 6, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

const EFFECT_COMPONENTS: Record<PowerUpType, React.ComponentType> = {
  streak_fire: StreakFireEffect,
  level_up: LevelUpEffect,
  badge_earned: BadgeEarnedEffect,
  xp_boost: XPBoostEffect,
};

const EFFECT_DURATION: Record<PowerUpType, number> = {
  streak_fire: 2500,
  level_up: 2500,
  badge_earned: 3000,
  xp_boost: 2000,
};

export function usePowerUpEffect() {
  const [effects, setEffects] = useState<ActiveEffect[]>([]);

  const triggerEffect = useCallback((type: PowerUpType) => {
    const id = ++effectIdCounter;
    setEffects((prev) => [...prev, { id, type }]);

    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, EFFECT_DURATION[type]);
  }, []);

  const PowerUpOverlay = useCallback(
    () => (
      <div className="fixed inset-0 z-[60] pointer-events-none">
        <AnimatePresence>
          {effects.map((effect) => {
            const Component = EFFECT_COMPONENTS[effect.type];
            return <Component key={effect.id} />;
          })}
        </AnimatePresence>
      </div>
    ),
    [effects]
  );

  return { triggerEffect, PowerUpOverlay };
}
