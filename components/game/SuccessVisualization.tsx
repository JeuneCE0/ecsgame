'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame, Star, ChevronRight, Zap } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { LEVEL_TITLES } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Animated counting number                                           */
/* ------------------------------------------------------------------ */

function AnimatedNumber({
  value,
  duration = 1.5,
  delay = 0,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / (duration * 1000), 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * value));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(delayTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay]);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Projection stat card                                               */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  color: string;
  glowColor: string;
  delay: number;
}

function StatCard({ icon, label, value, suffix, color, glowColor, delay }: StatCardProps) {
  return (
    <motion.div
      className="relative rounded-xl p-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.7) 0%, rgba(12, 12, 12, 0.9) 100%)',
        border: `1px solid ${color}20`,
      }}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -2, boxShadow: `0 0 20px ${glowColor}` }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: `${color}15`, border: `1px solid ${color}25` }}
          >
            {icon}
          </div>
          <span className="text-[10px] font-display uppercase tracking-wider text-ecs-gray">
            {label}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <AnimatedNumber
            value={value}
            delay={delay + 0.3}
            duration={1.2}
            className="text-2xl font-display font-bold"
            suffix=""
          />
          <span className="text-sm font-display font-bold" style={{ color }}>{suffix}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline checkpoint                                                */
/* ------------------------------------------------------------------ */

interface CheckpointProps {
  day: number;
  level: number;
  isStart: boolean;
  isEnd: boolean;
  color: string;
  totalDays: number;
}

function TimelineCheckpoint({ day, level, isStart, isEnd, color, totalDays }: CheckpointProps) {
  const position = (day / totalDays) * 100;

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + day * 0.02, duration: 0.4 }}
    >
      {/* Day label above */}
      <span className="text-[9px] font-display text-ecs-gray/60 mb-1 whitespace-nowrap">
        {isStart ? "Aujourd'hui" : isEnd ? 'J+30' : `J+${day}`}
      </span>

      {/* Dot */}
      <div
        className={cn('w-3 h-3 rounded-full border-2', isEnd && 'w-4 h-4')}
        style={{
          background: isStart || isEnd ? color : 'transparent',
          borderColor: color,
          boxShadow: isStart || isEnd ? `0 0 8px ${color}60` : 'none',
        }}
      />

      {/* Level label below */}
      <span
        className="text-[9px] font-display font-bold mt-1"
        style={{ color: isEnd ? color : 'rgba(255,255,255,0.4)' }}
      >
        Nv.{level}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main SuccessVisualization component                                */
/* ------------------------------------------------------------------ */

interface ProjectionData {
  estimatedLevel: number;
  estimatedXP: number;
  estimatedRank: number;
  estimatedStreak: number;
  levelTitle: string;
  checkpoints: Array<{ day: number; level: number }>;
}

export function SuccessVisualization() {
  const level = usePlayerStore((s) => s.level);
  const totalXP = usePlayerStore((s) => s.totalXP);
  const currentStreak = usePlayerStore((s) => s.currentStreak);

  const projection = useMemo((): ProjectionData => {
    // Calculate daily XP average (estimate based on current totalXP and a reasonable activity period)
    const daysActive = Math.max(1, Math.ceil(totalXP / 80)); // rough estimate
    const dailyXPAvg = Math.max(30, Math.round(totalXP / daysActive));

    // XP per level roughly: level * 100 (simplified)
    const xpPerLevel = (lvl: number) => lvl * 100;

    let projectedXP = totalXP;
    let projectedLevel = level;
    const checkpoints: Array<{ day: number; level: number }> = [
      { day: 0, level },
    ];

    for (let day = 1; day <= 30; day++) {
      projectedXP += dailyXPAvg;

      // Calculate level from accumulated XP
      let cumulativeXP = 0;
      for (let lvl = 1; lvl <= 15; lvl++) {
        cumulativeXP += xpPerLevel(lvl);
        if (projectedXP < cumulativeXP) {
          projectedLevel = lvl;
          break;
        }
        if (lvl === 15) {
          projectedLevel = 15;
        }
      }

      // Add checkpoints at intervals
      if (day === 7 || day === 14 || day === 21 || day === 30) {
        checkpoints.push({ day, level: projectedLevel });
      }
    }

    const estimatedLevel = Math.min(15, projectedLevel);
    const estimatedStreak = currentStreak + 30;
    const estimatedRank = Math.max(1, Math.round(50 - estimatedLevel * 3)); // rough position

    return {
      estimatedLevel,
      estimatedXP: projectedXP,
      estimatedRank,
      estimatedStreak,
      levelTitle: LEVEL_TITLES[estimatedLevel] ?? `Niveau ${estimatedLevel}`,
      checkpoints,
    };
  }, [level, totalXP, currentStreak]);

  const levelColor = useMemo(() => {
    if (projection.estimatedLevel >= 13) return '#FFD700';
    if (projection.estimatedLevel >= 10) return '#C084FC';
    if (projection.estimatedLevel >= 7) return '#60A5FA';
    if (projection.estimatedLevel >= 4) return '#FFBF00';
    return '#34D399';
  }, [projection.estimatedLevel]);

  const levelGlow = useMemo(() => {
    if (projection.estimatedLevel >= 13) return 'rgba(255, 215, 0, 0.2)';
    if (projection.estimatedLevel >= 10) return 'rgba(192, 132, 252, 0.2)';
    if (projection.estimatedLevel >= 7) return 'rgba(96, 165, 250, 0.2)';
    if (projection.estimatedLevel >= 4) return 'rgba(255, 191, 0, 0.2)';
    return 'rgba(52, 211, 153, 0.2)';
  }, [projection.estimatedLevel]);

  return (
    <div className="relative w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255,191,0,0.15), rgba(255,157,0,0.08))',
              border: '1px solid rgba(255,191,0,0.25)',
            }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TrendingUp className="h-5 w-5 text-ecs-amber" />
          </motion.div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">
              Dans 30 jours a ce rythme...
            </h2>
            <p className="text-xs text-ecs-gray font-display">
              Projection basee sur ta performance actuelle
            </p>
          </div>
        </div>
      </div>

      {/* Main projection card */}
      <motion.div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.9) 0%, rgba(12, 12, 12, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: `0 0 40px ${levelGlow}, 0 8px 32px rgba(0,0,0,0.4)`,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Gradient accent top */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${levelColor}, #FF9D00)` }} />

        <div className="p-6 space-y-6">
          {/* Stat grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Star className="h-3.5 w-3.5" style={{ color: levelColor }} />}
              label="Niveau estime"
              value={projection.estimatedLevel}
              suffix=""
              color={levelColor}
              glowColor={levelGlow}
              delay={0.1}
            />
            <StatCard
              icon={<Zap className="h-3.5 w-3.5 text-ecs-amber" />}
              label="XP accumules"
              value={projection.estimatedXP}
              suffix=" XP"
              color="#FFBF00"
              glowColor="rgba(255, 191, 0, 0.15)"
              delay={0.2}
            />
            <StatCard
              icon={<Target className="h-3.5 w-3.5 text-ecs-orange" />}
              label="Classement"
              value={projection.estimatedRank}
              suffix="e"
              color="#FF9D00"
              glowColor="rgba(255, 157, 0, 0.15)"
              delay={0.3}
            />
            <StatCard
              icon={<Flame className="h-3.5 w-3.5 text-red-400" />}
              label="Streak"
              value={projection.estimatedStreak}
              suffix=" jours"
              color="#F87171"
              glowColor="rgba(248, 113, 113, 0.15)"
              delay={0.4}
            />
          </div>

          {/* Timeline visualization */}
          <div className="space-y-3">
            <p className="text-[10px] font-display uppercase tracking-wider text-ecs-gray">
              Ton parcours sur 30 jours
            </p>

            <div className="relative h-16 mx-2">
              {/* Timeline line */}
              <div className="absolute top-[26px] left-0 right-0 h-px bg-ecs-gray-border" />

              {/* Animated progress line */}
              <motion.div
                className="absolute top-[26px] left-0 h-px"
                style={{ background: `linear-gradient(90deg, ${levelColor}, ${levelColor}80)` }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: 0.8, ease: 'easeOut' }}
              />

              {/* Glowing head of the progress */}
              <motion.div
                className="absolute top-[24px] w-1 h-1 rounded-full"
                style={{
                  background: levelColor,
                  boxShadow: `0 0 6px ${levelColor}, 0 0 12px ${levelColor}80`,
                }}
                initial={{ left: '0%' }}
                animate={{ left: '100%' }}
                transition={{ duration: 2, delay: 0.8, ease: 'easeOut' }}
              />

              {/* Checkpoints */}
              {projection.checkpoints.map((cp, i) => (
                <TimelineCheckpoint
                  key={cp.day}
                  day={cp.day}
                  level={cp.level}
                  isStart={i === 0}
                  isEnd={i === projection.checkpoints.length - 1}
                  color={levelColor}
                  totalDays={30}
                />
              ))}
            </div>
          </div>

          {/* Motivational message */}
          <motion.div
            className="rounded-xl p-4"
            style={{
              background: `linear-gradient(135deg, ${levelColor}08, ${levelColor}04)`,
              border: `1px solid ${levelColor}15`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-sm font-body leading-relaxed text-white/80">
              Continue exactement comme ca et dans 1 mois tu seras{' '}
              <span className="font-display font-bold" style={{ color: levelColor }}>
                Level {projection.estimatedLevel} — {projection.levelTitle}
              </span>
            </p>

            <motion.p
              className="mt-2 text-xs font-display uppercase tracking-wider"
              style={{ color: `${levelColor}90` }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              Ton futur commence maintenant
            </motion.p>
          </motion.div>

          {/* Level-up preview */}
          {projection.estimatedLevel > level && (
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {/* Current */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold text-white"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {level}
                </div>
                <span className="text-xs text-ecs-gray font-display">
                  {LEVEL_TITLES[level] ?? `Niv ${level}`}
                </span>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-1 flex-1">
                <div className="flex-1 h-px" style={{ background: `${levelColor}30` }} />
                <ChevronRight className="h-4 w-4" style={{ color: levelColor }} />
              </div>

              {/* Projected */}
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold text-ecs-black"
                  style={{
                    background: `linear-gradient(135deg, ${levelColor}, ${levelColor}CC)`,
                    boxShadow: `0 0 12px ${levelGlow}`,
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {projection.estimatedLevel}
                </motion.div>
                <span className="text-xs font-display font-bold" style={{ color: levelColor }}>
                  {projection.levelTitle}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
