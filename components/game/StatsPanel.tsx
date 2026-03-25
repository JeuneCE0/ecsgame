'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, ChevronRight } from 'lucide-react';
import {
  type PlayerStats,
  type StatKey,
  STAT_INFO,
  ALL_FEATURES,
  getXPMultiplier,
  getUnlockedFeatures,
  getStatProgress,
} from '@/lib/game/stats-engine';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StatsPanelProps {
  stats: PlayerStats;
  actionCounts: Record<string, number>;
  classStats: PlayerStats;
}

/* ------------------------------------------------------------------ */
/*  Radar / Pentagon Chart (SVG)                                       */
/* ------------------------------------------------------------------ */

const STAT_KEYS: StatKey[] = ['closing', 'prospection', 'management', 'creation', 'networking'];

function getPolygonPoint(index: number, value: number, maxValue: number, cx: number, cy: number, radius: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
  const r = (value / maxValue) * radius;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function pointsToPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
}

function RadarChart({ stats }: { stats: PlayerStats }) {
  const cx = 120;
  const cy = 120;
  const radius = 90;
  const maxValue = 10;
  const gridLevels = [2, 4, 6, 8, 10];

  const dataPoints = useMemo(
    () => STAT_KEYS.map((key, i) => getPolygonPoint(i, Math.min(stats[key], maxValue), maxValue, cx, cy, radius)),
    [stats]
  );

  const dataPath = useMemo(() => pointsToPath(dataPoints), [dataPoints]);

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 240 240" className="w-full max-w-[280px]">
        {/* Grid levels */}
        {gridLevels.map((level) => {
          const gridPoints = STAT_KEYS.map((_, i) =>
            getPolygonPoint(i, level, maxValue, cx, cy, radius)
          );
          return (
            <polygon
              key={level}
              points={gridPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#2A2A2A"
              strokeWidth={level === 10 ? 1.5 : 0.5}
            />
          );
        })}

        {/* Axis lines */}
        {STAT_KEYS.map((_, i) => {
          const end = getPolygonPoint(i, maxValue, maxValue, cx, cy, radius);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="#2A2A2A"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon (animated) */}
        <motion.path
          d={dataPath}
          fill="rgba(255, 191, 0, 0.15)"
          stroke="#FFBF00"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 60,
            damping: 14,
            mass: 1,
          }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <motion.circle
            key={STAT_KEYS[i]}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={STAT_INFO[STAT_KEYS[i]].color}
            stroke="#0C0C0C"
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1 + i * 0.08,
            }}
          />
        ))}

        {/* Stat labels */}
        {STAT_KEYS.map((key, i) => {
          const labelPoint = getPolygonPoint(i, maxValue + 2.2, maxValue, cx, cy, radius);
          const info = STAT_INFO[key];
          return (
            <text
              key={key}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-ecs-gray text-[9px] font-display uppercase tracking-wider"
            >
              {info.emoji} {info.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual Stat Bar                                                */
/* ------------------------------------------------------------------ */

interface StatBarProps {
  statKey: StatKey;
  value: number;
  classBase: number;
  multiplier: number;
  progress: { current: number; required: number; actionLabel: string } | undefined;
  nextMilestone: { level: number; reward: string } | undefined;
  index: number;
}

function StatBar({ statKey, value, classBase, multiplier, progress, nextMilestone, index }: StatBarProps) {
  const info = STAT_INFO[statKey];
  const cappedValue = Math.min(value, 10);
  const fillPercent = (cappedValue / 10) * 100;
  const bonusPoints = value - classBase;
  const multiplierPercent = Math.round((multiplier - 1) * 100);

  return (
    <motion.div
      className="rounded-md p-3 space-y-2"
      style={{
        background: 'linear-gradient(180deg, #1A1A1A 0%, #141414 100%)',
        border: '1px solid #2A2A2A',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.07, type: 'spring', stiffness: 120, damping: 18 }}
    >
      {/* Header: emoji + name + value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{info.emoji}</span>
          <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
            {info.name}
          </span>
          {bonusPoints > 0 && (
            <span className="text-[10px] font-display text-ecs-amber">
              (+{bonusPoints})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {multiplierPercent > 0 && (
            <span
              className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${info.color}20`, color: info.color }}
            >
              +{multiplierPercent}% XP
            </span>
          )}
          <span className="font-display font-bold text-sm" style={{ color: info.color }}>
            {cappedValue}/10
          </span>
        </div>
      </div>

      {/* Fill bar */}
      <div className="relative">
        <div
          className="h-[8px] rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1A1A1A 0%, #0F0F0F 100%)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${info.color}, ${info.color}CC)`,
              boxShadow: `0 0 8px ${info.color}40`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{
              type: 'spring',
              stiffness: 70,
              damping: 16,
              delay: 0.3 + index * 0.07,
            }}
          />
        </div>

        {/* Segment marks */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-black/30"
              style={{ borderRightWidth: 1 }}
            />
          ))}
        </div>
      </div>

      {/* Bottom info: progress + next milestone */}
      <div className="flex items-center justify-between gap-2">
        {progress && cappedValue < 10 && (
          <span className="text-[10px] text-ecs-gray font-body">
            {progress.current}/{progress.required} {progress.actionLabel} pour +1
          </span>
        )}
        {cappedValue >= 10 && (
          <span className="text-[10px] font-display font-bold" style={{ color: info.color }}>
            MAX
          </span>
        )}
        {nextMilestone && (
          <span className="text-[10px] text-ecs-gray font-body flex items-center gap-1 ml-auto">
            <ChevronRight className="w-3 h-3" />
            {info.name} {nextMilestone.level} : {nextMilestone.reward}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Lists                                                      */
/* ------------------------------------------------------------------ */

function FeatureLists({ stats }: { stats: PlayerStats }) {
  const unlockedIds = useMemo(() => new Set(getUnlockedFeatures(stats)), [stats]);

  const unlocked = ALL_FEATURES.filter((f) => unlockedIds.has(f.id));
  const locked = ALL_FEATURES.filter((f) => !unlockedIds.has(f.id));

  return (
    <div className="space-y-4">
      {/* Unlocked features */}
      {unlocked.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-display text-xs uppercase tracking-[0.15em] text-ecs-gray">
            Fonctionnalites debloquees
          </h4>
          <div className="flex flex-wrap gap-2">
            {unlocked.map((feature, i) => (
              <motion.div
                key={feature.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-display"
                style={{
                  background: `${STAT_INFO[feature.stat].color}15`,
                  border: `1px solid ${STAT_INFO[feature.stat].color}30`,
                  color: STAT_INFO[feature.stat].color,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4 + i * 0.05,
                }}
              >
                <Unlock className="w-3 h-3" />
                {feature.label}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked features (next ones to unlock) */}
      {locked.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-display text-xs uppercase tracking-[0.15em] text-ecs-gray">
            Prochains deblocages
          </h4>
          <div className="flex flex-wrap gap-2">
            {locked.slice(0, 6).map((feature) => (
              <div
                key={feature.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-display text-ecs-gray/50"
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                }}
              >
                <Lock className="w-3 h-3" />
                <span>{feature.label}</span>
                <span className="text-[9px] opacity-60">
                  ({STAT_INFO[feature.stat].name} {feature.level})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main StatsPanel Component                                          */
/* ------------------------------------------------------------------ */

export function StatsPanel({ stats, actionCounts, classStats }: StatsPanelProps) {
  const statProgress = useMemo(() => getStatProgress(actionCounts), [actionCounts]);

  const statEntries = useMemo(
    () =>
      STAT_KEYS.map((key) => {
        const progress = statProgress.find((p) => p.stat === key);
        const info = STAT_INFO[key];
        const currentValue = Math.min(stats[key], 10);
        const nextMilestone = info.milestones.find((m) => m.level > currentValue);

        // Build a fake single-stat PlayerStats to get the right multiplier
        const multiplier = getXPMultiplier(stats, getSourceForStat(key));

        return {
          key,
          value: stats[key],
          classBase: classStats[key],
          multiplier,
          progress,
          nextMilestone,
        };
      }),
    [stats, classStats, statProgress]
  );

  return (
    <div className="space-y-6">
      {/* Section title */}
      <div className="text-center space-y-1">
        <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
          Tes Stats Business
        </h3>
        <p className="text-xs text-ecs-gray font-body">
          Chaque stat booste tes XP et debloque des fonctionnalites
        </p>
      </div>

      {/* Radar chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 16 }}
      >
        <RadarChart stats={stats} />
      </motion.div>

      {/* Individual stat bars */}
      <div className="space-y-2">
        {statEntries.map((entry, index) => (
          <StatBar
            key={entry.key}
            statKey={entry.key}
            value={entry.value}
            classBase={entry.classBase}
            multiplier={entry.multiplier}
            progress={entry.progress}
            nextMilestone={entry.nextMilestone}
            index={index}
          />
        ))}
      </div>

      {/* Features unlocked / locked */}
      <FeatureLists stats={stats} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSourceForStat(stat: StatKey): string {
  switch (stat) {
    case 'closing':
      return 'deal_closed';
    case 'prospection':
      return 'lead_generated';
    case 'management':
      return 'formation_completed';
    case 'creation':
      return 'manual_log';
    case 'networking':
      return 'referral';
  }
}
