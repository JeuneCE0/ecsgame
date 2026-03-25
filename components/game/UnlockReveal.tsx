'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, BookOpen, Trophy, Swords } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { LEVEL_TITLES } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Zone / Chapter definitions for unlock mapping                      */
/* ------------------------------------------------------------------ */

interface UnlockZone {
  levelTrigger: number;
  name: string;
  gradient: string;
  accentColor: string;
  glowColor: string;
  icon: string;
  features: string[];
}

const UNLOCK_ZONES: UnlockZone[] = [
  {
    levelTrigger: 1,
    name: 'Les Terres du Debutant',
    gradient: 'linear-gradient(135deg, #0D4D4D, #065A5A, #047857)',
    accentColor: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.3)',
    icon: '\u{1F332}',
    features: [
      'Quetes de base debloquees',
      'Formation d\'introduction disponible',
      'Acces au tableau de bord',
    ],
  },
  {
    levelTrigger: 4,
    name: 'La Vallee des Closers',
    gradient: 'linear-gradient(135deg, #78350F, #92400E, #B45309)',
    accentColor: '#FFBF00',
    glowColor: 'rgba(255, 191, 0, 0.3)',
    icon: '\u{1F3DC}\uFE0F',
    features: [
      'Nouvelles quetes de closing disponibles',
      'Techniques de negociation debloquees',
      'Badge "Closer" accessible',
    ],
  },
  {
    levelTrigger: 7,
    name: 'Les Sommets du Business',
    gradient: 'linear-gradient(135deg, #1E3A5F, #1E40AF, #3B82F6)',
    accentColor: '#60A5FA',
    glowColor: 'rgba(96, 165, 250, 0.3)',
    icon: '\u{1F3D4}\uFE0F',
    features: [
      'Quetes d\'elite debloquees',
      'Formation strategie avancee',
      'Acces mentorat',
    ],
  },
  {
    levelTrigger: 10,
    name: "L'Empire",
    gradient: 'linear-gradient(135deg, #4C1D95, #6D28D9, #A78BFA)',
    accentColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.3)',
    icon: '\u{1F3F0}',
    features: [
      'Quetes de maitre debloquees',
      'Programme de mentorat premium',
      'Badge "CEO" accessible',
    ],
  },
  {
    levelTrigger: 13,
    name: 'Le Pantheon des Legendes',
    gradient: 'linear-gradient(135deg, #78350F, #B45309, #FFBF00, #FFD700)',
    accentColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    icon: '\u{2728}',
    features: [
      'Quetes legendaires debloquees',
      'Statut VIP permanent',
      'Acces au Pantheon',
    ],
  },
];

const STORAGE_KEY = 'ecs-unlock-seen';

/* ------------------------------------------------------------------ */
/*  Expanding light ring                                                */
/* ------------------------------------------------------------------ */

function LightRing({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 100,
        height: 100,
        top: '50%',
        left: '50%',
        marginTop: -50,
        marginLeft: -50,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: color,
        opacity: 0.3,
      }}
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 5, opacity: 0 }}
      transition={{ duration: 2, delay, ease: 'easeOut' }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Feature list item                                                  */
/* ------------------------------------------------------------------ */

function FeatureItem({ text, index, accentColor }: { text: string; index: number; accentColor: string }) {
  const IconComponent = [Swords, BookOpen, Trophy][index % 3];

  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg p-3"
      style={{
        background: `${accentColor}08`,
        border: `1px solid ${accentColor}15`,
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.6 + index * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ background: `${accentColor}15` }}
      >
        <IconComponent className="h-4 w-4" style={{ color: accentColor }} />
      </div>
      <span className="text-sm text-white/80 font-body">{text}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main UnlockReveal component                                        */
/* ------------------------------------------------------------------ */

export function UnlockReveal() {
  const showLevelUpModal = usePlayerStore((s) => s.showLevelUpModal);
  const newLevel = usePlayerStore((s) => s.newLevel);

  const [showReveal, setShowReveal] = useState(false);
  const [activeZone, setActiveZone] = useState<UnlockZone | null>(null);

  // Check if the new level triggers a zone unlock
  useEffect(() => {
    if (!showLevelUpModal || !newLevel) return;

    const zone = UNLOCK_ZONES.find((z) => z.levelTrigger === newLevel);
    if (!zone) return;

    // Check if already seen
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      const seenLevels: number[] = seen ? (JSON.parse(seen) as number[]) : [];
      if (seenLevels.includes(newLevel)) return;

      // Mark as seen
      seenLevels.push(newLevel);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seenLevels));
    } catch {
      // Continue with reveal anyway
    }

    // Delay the reveal to show after LevelUpModal
    const timer = setTimeout(() => {
      setActiveZone(zone);
      setShowReveal(true);
    }, 5500);

    return () => clearTimeout(timer);
  }, [showLevelUpModal, newLevel]);

  const handleDismiss = useCallback(() => {
    setShowReveal(false);
    setTimeout(() => setActiveZone(null), 500);
  }, []);

  const levelTitle = useMemo(
    () => (activeZone ? (LEVEL_TITLES[activeZone.levelTrigger] ?? `Niveau ${activeZone.levelTrigger}`) : ''),
    [activeZone],
  );

  return (
    <AnimatePresence>
      {showReveal && activeZone && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleDismiss}
        >
          {/* Dark overlay with radial glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${activeZone.glowColor} 0%, rgba(0,0,0,0.95) 60%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Backdrop blur */}
          <div className="absolute inset-0 backdrop-blur-lg" />

          {/* Light rings */}
          <div className="absolute pointer-events-none" style={{ top: '45%', left: '50%' }}>
            <LightRing delay={0.3} color={activeZone.accentColor} />
            <LightRing delay={0.6} color={activeZone.accentColor} />
            <LightRing delay={0.9} color={activeZone.accentColor} />
          </div>

          {/* Main card */}
          <motion.div
            className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%)',
              border: `1px solid ${activeZone.accentColor}30`,
              boxShadow: `0 0 80px ${activeZone.glowColor}, 0 0 160px ${activeZone.glowColor}`,
            }}
            initial={{ scale: 0.3, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Zone gradient strip at top */}
            <motion.div
              className="h-2 w-full"
              style={{ background: activeZone.gradient }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            {/* Zone artwork gradient background */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: activeZone.gradient, opacity: 0 }}
              animate={{ opacity: 0.05 }}
              transition={{ duration: 1.5, delay: 1 }}
            />

            <div className="relative z-10 p-8 space-y-6 text-center">
              {/* "NOUVEAU TERRITOIRE" text zoom */}
              <motion.div
                initial={{ scale: 3, opacity: 0, letterSpacing: '0.05em' }}
                animate={{ scale: 1, opacity: 1, letterSpacing: '0.3em' }}
                transition={{ type: 'spring', stiffness: 150, damping: 14, delay: 0.2 }}
              >
                <p
                  className="text-[10px] font-display font-bold uppercase tracking-[0.3em]"
                  style={{
                    color: activeZone.accentColor,
                    textShadow: `0 0 20px ${activeZone.glowColor}`,
                  }}
                >
                  Nouveau Territoire Debloque
                </p>
              </motion.div>

              {/* Zone icon + name */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <motion.span
                  className="text-5xl inline-block"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {activeZone.icon}
                </motion.span>

                <h2
                  className="font-display font-bold text-3xl"
                  style={{
                    color: activeZone.accentColor,
                    textShadow: `0 0 30px ${activeZone.glowColor}`,
                  }}
                >
                  {activeZone.name}
                </h2>

                <p className="text-sm text-ecs-gray font-display">
                  Niveau {activeZone.levelTrigger} — {levelTitle}
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="h-px mx-auto w-32"
                style={{ background: `${activeZone.accentColor}30` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              />

              {/* Features list */}
              <div className="space-y-2 text-left">
                {activeZone.features.map((feature, i) => (
                  <FeatureItem
                    key={feature}
                    text={feature}
                    index={i}
                    accentColor={activeZone.accentColor}
                  />
                ))}
              </div>

              {/* CTA button */}
              <motion.button
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-display font-bold text-sm uppercase tracking-wider text-ecs-black relative overflow-hidden group"
                style={{
                  background: activeZone.gradient,
                  boxShadow: `0 0 24px ${activeZone.glowColor}, 0 4px 16px rgba(0,0,0,0.3)`,
                }}
                onClick={handleDismiss}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
              >
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <Compass className="h-4 w-4" />
                Explorer
                <Sparkles className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0 animate-shimmer-sweep"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${activeZone.accentColor}08 50%, transparent 100%)`,
                  width: '40%',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
