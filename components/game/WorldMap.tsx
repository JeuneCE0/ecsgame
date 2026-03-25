'use client';

import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, type MotionValue } from 'framer-motion';
import { Lock, Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { LEVEL_TITLES } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Zone definitions                                                    */
/* ------------------------------------------------------------------ */

interface Zone {
  id: string;
  name: string;
  levelMin: number;
  levelMax: number;
  description: string;
  rewards: string[];
  gradient: string;
  accentColor: string;
  glowColor: string;
  fogColor: string;
  pathX: number;
  pathY: number;
  icon: string;
}

const ZONES: Zone[] = [
  {
    id: 'beginner',
    name: 'Les Terres du Debutant',
    levelMin: 1,
    levelMax: 3,
    description: 'Tes premiers pas dans le monde du business',
    rewards: ['Quetes de base', 'Formation d\'intro', 'Titre "Recrue"'],
    gradient: 'linear-gradient(135deg, #0D4D4D 0%, #065A5A 40%, #047857 100%)',
    accentColor: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.3)',
    fogColor: 'rgba(13, 77, 77, 0.7)',
    pathX: 100,
    pathY: 200,
    icon: '\u{1F332}',
  },
  {
    id: 'closers',
    name: 'La Vallee des Closers',
    levelMin: 4,
    levelMax: 6,
    description: 'L\'art du closing et de la negociation',
    rewards: ['Quetes avancees', 'Techniques de closing', 'Badge "Closer"'],
    gradient: 'linear-gradient(135deg, #78350F 0%, #92400E 40%, #B45309 100%)',
    accentColor: '#FFBF00',
    glowColor: 'rgba(255, 191, 0, 0.3)',
    fogColor: 'rgba(120, 53, 15, 0.7)',
    pathX: 350,
    pathY: 140,
    icon: '\u{1F3DC}\uFE0F',
  },
  {
    id: 'summits',
    name: 'Les Sommets du Business',
    levelMin: 7,
    levelMax: 9,
    description: 'Tu domines le jeu et les chiffres',
    rewards: ['Quetes d\'elite', 'Strategie avancee', 'Badge "Rainmaker"'],
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 40%, #3B82F6 100%)',
    accentColor: '#60A5FA',
    glowColor: 'rgba(96, 165, 250, 0.3)',
    fogColor: 'rgba(30, 58, 95, 0.7)',
    pathX: 600,
    pathY: 200,
    icon: '\u{1F3D4}\uFE0F',
  },
  {
    id: 'empire',
    name: "L'Empire",
    levelMin: 10,
    levelMax: 12,
    description: 'Tu batis ton empire commercial',
    rewards: ['Quetes de maitre', 'Mentorat', 'Badge "CEO"'],
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 40%, #A78BFA 100%)',
    accentColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.3)',
    fogColor: 'rgba(76, 29, 149, 0.7)',
    pathX: 850,
    pathY: 140,
    icon: '\u{1F3F0}',
  },
  {
    id: 'pantheon',
    name: 'Le Pantheon des Legendes',
    levelMin: 13,
    levelMax: 15,
    description: 'Ton nom resonne dans tout l\'ecosysteme',
    rewards: ['Quetes legendaires', 'Statut VIP', 'Badge "Legende"'],
    gradient: 'linear-gradient(135deg, #78350F 0%, #B45309 30%, #FFBF00 70%, #FFD700 100%)',
    accentColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    fogColor: 'rgba(120, 53, 15, 0.7)',
    pathX: 1100,
    pathY: 200,
    icon: '\u{2728}',
  },
];

const ZONE_WIDTH = 240;
const MAP_WIDTH = 1340;
const MAP_HEIGHT = 360;

/* ------------------------------------------------------------------ */
/*  Parallax stars background layer                                    */
/* ------------------------------------------------------------------ */

interface ParticleStar {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
}

function StarsLayer({ scrollX }: { scrollX: MotionValue<number> }) {
  const starsX = useTransform(scrollX, [0, -MAP_WIDTH], [0, 60]);

  const stars: ParticleStar[] = useMemo(
    () =>
      Array.from({ length: 40 }, () => ({
        x: Math.random() * MAP_WIDTH,
        y: Math.random() * MAP_HEIGHT,
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.5,
        delay: Math.random() * 3,
      })),
    [],
  );

  return (
    <motion.div className="absolute inset-0 pointer-events-none" style={{ x: starsX }}>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [star.opacity, star.opacity * 0.3, star.opacity] }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Nebula depth layer                                                  */
/* ------------------------------------------------------------------ */

function NebulaLayer({ scrollX }: { scrollX: MotionValue<number> }) {
  const nebulaX = useTransform(scrollX, [0, -MAP_WIDTH], [0, 30]);

  return (
    <motion.div className="absolute inset-0 pointer-events-none" style={{ x: nebulaX }}>
      <div
        className="absolute w-[600px] h-[300px] rounded-full opacity-10"
        style={{
          left: 200,
          top: 30,
          background: 'radial-gradient(ellipse, rgba(255,191,0,0.3), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute w-[400px] h-[200px] rounded-full opacity-10"
        style={{
          left: 700,
          top: 100,
          background: 'radial-gradient(ellipse, rgba(96,165,250,0.3), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG path connecting zones                                          */
/* ------------------------------------------------------------------ */

function ZonePath({ zones, playerLevel }: { zones: Zone[]; playerLevel: number }) {
  const pathD = useMemo(() => {
    if (zones.length < 2) return '';
    const points = zones.map((z) => ({ x: z.pathX + ZONE_WIDTH / 2, y: z.pathY + 60 }));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
      const cpy1 = prev.y;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.5;
      const cpy2 = curr.y;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [zones]);

  const activeSegments = zones.filter((z) => playerLevel >= z.levelMin).length;
  const totalSegments = zones.length;
  const progressRatio = Math.min(1, activeSegments / totalSegments);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
    >
      <defs>
        <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="25%" stopColor="#FFBF00" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="75%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
        <filter id="path-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background path (dark) */}
      <path d={pathD} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeDasharray="8 6" />

      {/* Active path (glowing) */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#path-gradient)"
        strokeWidth="2.5"
        filter="url(#path-glow)"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: progressRatio }}
        transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Zone card                                                          */
/* ------------------------------------------------------------------ */

interface ZoneCardProps {
  zone: Zone;
  playerLevel: number;
  isCurrentZone: boolean;
  isCompleted: boolean;
  isLocked: boolean;
}

function ZoneCard({ zone, playerLevel, isCurrentZone, isCompleted, isLocked }: ZoneCardProps) {
  const levelTitle = LEVEL_TITLES[zone.levelMin] ?? `Niveau ${zone.levelMin}`;

  return (
    <motion.div
      className="absolute"
      style={{ left: zone.pathX, top: zone.pathY, width: ZONE_WIDTH }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay: zone.levelMin * 0.1 }}
    >
      <motion.div
        className={cn(
          'relative rounded-xl p-5 overflow-hidden cursor-pointer transition-all duration-300',
          isCurrentZone && 'ring-2',
        )}
        style={{
          background: isLocked ? 'rgba(20, 20, 20, 0.9)' : zone.gradient,
          border: isCurrentZone
            ? `2px solid ${zone.accentColor}`
            : isLocked
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(255,255,255,0.12)',
          boxShadow: isCurrentZone
            ? `0 0 30px ${zone.glowColor}, 0 0 60px ${zone.glowColor}`
            : isCompleted
              ? `0 0 15px ${zone.glowColor}`
              : 'none',
        }}
        whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Fog overlay for locked zones */}
        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 backdrop-blur-sm rounded-xl">
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(180deg, rgba(12,12,12,0.85) 0%, rgba(12,12,12,0.95) 100%)',
              }}
            />
            <div className="relative z-20 flex flex-col items-center gap-2">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Lock className="h-6 w-6 text-ecs-gray" />
              </motion.div>
              <span className="text-xs font-display text-ecs-gray uppercase tracking-wider">
                Niveau {zone.levelMin} requis
              </span>
            </div>
          </div>
        )}

        {/* Completed stars overlay */}
        {isCompleted && (
          <div className="absolute top-2 right-2 z-20">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Star className="h-5 w-5 fill-current" style={{ color: zone.accentColor }} />
            </motion.div>
          </div>
        )}

        {/* Current zone marker */}
        {isCurrentZone && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="flex items-center gap-1 rounded-full px-3 py-1"
              style={{
                background: zone.gradient,
                boxShadow: `0 0 16px ${zone.glowColor}`,
              }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MapPin className="h-3 w-3 text-white" />
              <span className="text-[10px] font-display font-bold text-white uppercase tracking-wider whitespace-nowrap">
                Vous etes ici
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Zone content */}
        <div className={cn('relative z-10', isLocked && 'opacity-30')}>
          {/* Icon */}
          <div className="text-2xl mb-2">{zone.icon}</div>

          {/* Zone name */}
          <h3
            className="font-display font-bold text-white text-sm leading-tight mb-1"
            style={isCompleted ? { color: zone.accentColor } : undefined}
          >
            {zone.name}
          </h3>

          {/* Level range */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: `${zone.accentColor}20`,
                color: zone.accentColor,
                border: `1px solid ${zone.accentColor}40`,
              }}
            >
              Niv. {zone.levelMin}-{zone.levelMax}
            </span>
            <span className="text-[10px] text-white/60 font-display">{levelTitle}</span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-white/70 mb-3 leading-relaxed">{zone.description}</p>

          {/* Rewards */}
          <div className="space-y-1">
            {zone.rewards.map((reward) => (
              <div key={reward} className="flex items-center gap-1.5">
                <div
                  className="h-1 w-1 rounded-full shrink-0"
                  style={{ background: zone.accentColor }}
                />
                <span className="text-[10px] text-white/50 font-display">{reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated shimmer for current zone */}
        {isCurrentZone && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            <div
              className="absolute inset-0 animate-shimmer-sweep"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${zone.accentColor}15 50%, transparent 100%)`,
                width: '50%',
              }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Player avatar on the path                                          */
/* ------------------------------------------------------------------ */

function PlayerAvatar({ zone }: { zone: Zone }) {
  return (
    <motion.div
      className="absolute z-40 pointer-events-none"
      style={{
        left: zone.pathX + ZONE_WIDTH / 2 - 16,
        top: zone.pathY - 20,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 1 }}
    >
      <motion.div
        className="relative flex items-center justify-center w-8 h-8 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
          boxShadow: '0 0 20px rgba(255, 191, 0, 0.5), 0 0 40px rgba(255, 191, 0, 0.2)',
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-sm font-display font-bold text-ecs-black">{'\u{1F3AE}'}</span>

        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(255,191,0,0)',
              '0 0 0 8px rgba(255,191,0,0.2)',
              '0 0 0 0 rgba(255,191,0,0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main WorldMap component                                            */
/* ------------------------------------------------------------------ */

export function WorldMap() {
  const level = usePlayerStore((s) => s.level);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const currentZone = useMemo(
    () => ZONES.find((z) => level >= z.levelMin && level <= z.levelMax) ?? ZONES[0],
    [level],
  );

  const getZoneStatus = useCallback(
    (zone: Zone) => {
      const isCompleted = level > zone.levelMax;
      const isCurrent = level >= zone.levelMin && level <= zone.levelMax;
      const isLocked = level < zone.levelMin;
      return { isCompleted, isCurrent, isLocked };
    },
    [level],
  );

  // Snap to current zone on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const targetScroll = Math.max(0, currentZone.pathX - container.clientWidth / 2 + ZONE_WIDTH / 2);
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }, [currentZone]);

  // Track scroll position for parallax
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      scrollX.set(-container.scrollLeft);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollX]);

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="font-display font-bold text-white text-lg">Carte du Monde</h2>
          <p className="text-xs text-ecs-gray font-display">
            Ton voyage vers le sommet
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: `${currentZone.accentColor}15`,
            border: `1px solid ${currentZone.accentColor}30`,
          }}
        >
          <span className="text-sm">{currentZone.icon}</span>
          <span className="text-xs font-display font-bold" style={{ color: currentZone.accentColor }}>
            {currentZone.name}
          </span>
        </div>
      </div>

      {/* Scrollable map container */}
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-x-auto overflow-y-hidden rounded-xl scrollbar-hide',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        style={{
          background: 'linear-gradient(180deg, #080810 0%, #0C0C0C 40%, #0A0A14 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          height: MAP_HEIGHT + 40,
          scrollSnapType: 'x mandatory',
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Inner map */}
        <div className="relative" style={{ width: MAP_WIDTH, height: MAP_HEIGHT + 40, minWidth: MAP_WIDTH }}>
          {/* Parallax background layers */}
          <NebulaLayer scrollX={scrollX} />
          <StarsLayer scrollX={scrollX} />

          {/* SVG Path */}
          <ZonePath zones={ZONES} playerLevel={level} />

          {/* Zone cards */}
          <AnimatePresence>
            {ZONES.map((zone) => {
              const { isCompleted, isCurrent, isLocked } = getZoneStatus(zone);
              return (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  playerLevel={level}
                  isCurrentZone={isCurrent}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                />
              );
            })}
          </AnimatePresence>

          {/* Player avatar */}
          <PlayerAvatar zone={currentZone} />
        </div>
      </div>

      {/* Zone navigation dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {ZONES.map((zone) => {
          const { isCompleted, isCurrent, isLocked } = getZoneStatus(zone);
          return (
            <button
              key={zone.id}
              className="relative"
              onClick={() => {
                if (!containerRef.current) return;
                const targetScroll = Math.max(
                  0,
                  zone.pathX - containerRef.current.clientWidth / 2 + ZONE_WIDTH / 2,
                );
                containerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
              }}
              aria-label={`Naviguer vers ${zone.name}`}
            >
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all duration-300',
                  isCurrent && 'scale-125',
                )}
                style={{
                  background: isLocked ? 'rgba(255,255,255,0.15)' : zone.accentColor,
                  boxShadow: isCurrent ? `0 0 8px ${zone.glowColor}` : 'none',
                  opacity: isLocked ? 0.3 : isCompleted ? 0.7 : 1,
                }}
              />
              {isCurrent && (
                <motion.div
                  className="absolute -inset-1 rounded-full"
                  animate={{
                    boxShadow: [
                      `0 0 0 0 ${zone.accentColor}00`,
                      `0 0 0 4px ${zone.accentColor}40`,
                      `0 0 0 0 ${zone.accentColor}00`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
