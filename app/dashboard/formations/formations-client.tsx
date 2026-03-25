'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ModuleData {
  id: string;
  title: string;
  description: string;
  lessons: string[];
  xpReward: number;
  unlockLevel: number;
  estimatedMinutes: number;
  actionItem: string;
}

interface ClassModuleData {
  id: string;
  title: string;
  description: string;
  lessons: string[];
  xpReward: number;
  estimatedMinutes: number;
  actionItem: string;
}

interface ProgressEntry {
  id: string;
  progressPercent: number;
  completedAt: string | null;
}

interface FormationsClientProps {
  playerLevel: number;
  businessType: string | null;
  currentPhaseName: string;
  currentPhaseRange: [number, number];
  unlockedModules: ModuleData[];
  lockedModules: ModuleData[];
  classModules: ClassModuleData[];
  progressMap: Record<string, ProgressEntry>;
}

type FilterKey = 'all' | 'unlocked' | 'class';

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'unlocked', label: 'Disponibles' },
  { key: 'class', label: 'Ma Classe' },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h${remaining}` : `${hours}h`;
}

function getModuleStatus(
  moduleId: string,
  progressMap: Record<string, ProgressEntry>
): 'new' | 'in_progress' | 'completed' {
  const entry = progressMap[moduleId];
  if (!entry) return 'new';
  if (entry.completedAt) return 'completed';
  return 'in_progress';
}

function getStatusLabel(status: 'new' | 'in_progress' | 'completed'): string {
  if (status === 'completed') return 'Termin\u00e9';
  if (status === 'in_progress') return 'Continuer';
  return 'Commencer';
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#FFBF00] to-[#FF9D00]"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

function LessonCheckbox({
  lesson,
  checked,
  onToggle,
}: {
  lesson: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-start gap-3 w-full text-left group/lesson py-1.5"
    >
      <div
        className={cn(
          'mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200',
          checked
            ? 'bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] border-[#FFBF00]'
            : 'border-white/20 group-hover/lesson:border-white/40'
        )}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-[#0C0C0C]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        )}
      </div>
      <span
        className={cn(
          'text-sm leading-relaxed transition-colors',
          checked ? 'text-white/40 line-through' : 'text-white/70'
        )}
      >
        {lesson}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Module Card (unlocked)                                            */
/* ------------------------------------------------------------------ */

function UnlockedModuleCard({
  module: mod,
  progressMap,
  isExpanded,
  onToggleExpand,
  onMarkComplete,
  lessonStates,
  onToggleLesson,
}: {
  module: ModuleData;
  progressMap: Record<string, ProgressEntry>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMarkComplete: () => void;
  lessonStates: boolean[];
  onToggleLesson: (idx: number) => void;
}) {
  const status = getModuleStatus(mod.id, progressMap);
  const progress = progressMap[mod.id]?.progressPercent ?? 0;

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="group relative rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden hover:border-white/10 transition-all duration-300"
    >
      {/* Hover gradient accent */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-[#FFBF00]/20 via-transparent to-[#FF9D00]/20" />
      </div>

      <div className="relative z-10 p-5">
        {/* Top meta row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Lesson count */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <svg
                className="w-3.5 h-3.5 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <span className="text-[11px] font-display font-medium text-white/40">
                {mod.lessons.length} le&ccedil;ons
              </span>
            </div>
            {/* Duration */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <svg
                className="w-3.5 h-3.5 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[11px] font-display font-medium text-white/40">
                {formatDuration(mod.estimatedMinutes)}
              </span>
            </div>
          </div>

          {/* XP reward */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20">
            <svg
              className="w-3.5 h-3.5 text-[#FFBF00]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-[11px] font-display font-bold text-[#FFBF00]">
              +{formatXP(mod.xpReward)} XP
            </span>
          </div>
        </div>

        {/* Title + Description */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-full text-left"
        >
          <h3 className="font-display font-bold text-white text-base mb-1 group-hover:text-[#FFBF00] transition-colors">
            {mod.title}
          </h3>
          <p className="text-xs text-white/30 leading-relaxed mb-3">
            {mod.description}
          </p>
        </button>

        {/* Progress bar */}
        {status !== 'new' && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-display text-white/30">
                Progression
              </span>
              <span className="text-[11px] font-display font-bold text-[#FFBF00] tabular-nums">
                {progress}%
              </span>
            </div>
            <ProgressBar percent={progress} />
          </div>
        )}

        {/* Status badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {status === 'completed' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/20 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-[11px] font-display font-semibold text-green-400">
                  Termin&eacute;
                </span>
              </div>
            ) : status === 'in_progress' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFBF00]/20 border border-[#FFBF00]/30">
                <div className="w-2 h-2 rounded-full bg-[#FFBF00] animate-pulse" />
                <span className="text-[11px] font-display font-semibold text-[#FFBF00]">
                  En cours
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <span className="text-[11px] font-display font-semibold text-white/40">
                  Nouveau
                </span>
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <motion.svg
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </motion.svg>
          </button>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* Lessons list */}
              <div className="pt-3 border-t border-white/5 space-y-0.5">
                {mod.lessons.map((lesson, idx) => (
                  <LessonCheckbox
                    key={`${mod.id}-lesson-${idx}`}
                    lesson={lesson}
                    checked={lessonStates[idx] ?? false}
                    onToggle={() => onToggleLesson(idx)}
                  />
                ))}
              </div>

              {/* Action item */}
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0" role="img" aria-label="action">
                    {'\uD83D\uDCCB'}
                  </span>
                  <div>
                    <p className="text-xs font-display font-bold text-amber-400 mb-0.5">
                      Action concr&egrave;te
                    </p>
                    <p className="text-sm text-amber-200/80 leading-relaxed">
                      {mod.actionItem}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mark complete button */}
              {status !== 'completed' && (
                <button
                  type="button"
                  onClick={onMarkComplete}
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.02] transition-all duration-300"
                >
                  {status === 'in_progress'
                    ? 'Marquer comme termin\u00e9'
                    : 'Commencer'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed CTA */}
        {!isExpanded && (
          <button
            type="button"
            onClick={onToggleExpand}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider transition-all duration-300',
              status === 'completed'
                ? 'bg-green-400/5 border border-green-400/20 text-green-400'
                : status === 'in_progress'
                  ? 'bg-white/5 border border-[#FFBF00]/30 text-[#FFBF00] hover:bg-[#FFBF00]/10'
                  : 'bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.02]'
            )}
          >
            {getStatusLabel(status)}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Locked Module Card                                                */
/* ------------------------------------------------------------------ */

function LockedModuleCard({ module: mod }: { module: ModuleData }) {
  return (
    <motion.div
      variants={cardVariants}
      className="relative rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden opacity-50"
    >
      <div className="relative z-10 p-5">
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/10">
            <svg
              className="w-6 h-6 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[11px] font-display font-medium text-white/20">
                {mod.lessons.length} le&ccedil;ons
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[11px] font-display font-medium text-white/20">
                {formatDuration(mod.estimatedMinutes)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[11px] font-display font-bold text-white/20">
              +{formatXP(mod.xpReward)} XP
            </span>
          </div>
        </div>

        {/* Title + Description */}
        <h3 className="font-display font-bold text-white/30 text-base mb-1">
          {mod.title}
        </h3>
        <p className="text-xs text-white/15 leading-relaxed mb-4">
          {mod.description}
        </p>

        {/* Locked indicator */}
        <div className="w-full py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider text-center text-white/20 bg-white/5 border border-white/5">
          D&eacute;bloqu&eacute; au niveau {mod.unlockLevel}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Class Module Card                                                 */
/* ------------------------------------------------------------------ */

function ClassModuleCard({
  module: mod,
  progressMap,
  isExpanded,
  onToggleExpand,
  onMarkComplete,
  lessonStates,
  onToggleLesson,
}: {
  module: ClassModuleData;
  progressMap: Record<string, ProgressEntry>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMarkComplete: () => void;
  lessonStates: boolean[];
  onToggleLesson: (idx: number) => void;
}) {
  const status = getModuleStatus(mod.id, progressMap);
  const progress = progressMap[mod.id]?.progressPercent ?? 0;

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="group relative rounded-2xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm overflow-hidden hover:border-purple-500/30 transition-all duration-300"
    >
      <div className="relative z-10 p-5">
        {/* Class badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <svg
                className="w-3.5 h-3.5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
              <span className="text-[11px] font-display font-semibold text-purple-400">
                Bonus Classe
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[11px] font-display font-medium text-white/40">
                {mod.lessons.length} le&ccedil;ons
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20">
            <svg
              className="w-3.5 h-3.5 text-[#FFBF00]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-[11px] font-display font-bold text-[#FFBF00]">
              +{formatXP(mod.xpReward)} XP
            </span>
          </div>
        </div>

        {/* Title + Description */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-full text-left"
        >
          <h3 className="font-display font-bold text-white text-base mb-1 group-hover:text-purple-300 transition-colors">
            {mod.title}
          </h3>
          <p className="text-xs text-white/30 leading-relaxed mb-3">
            {mod.description}
          </p>
        </button>

        {/* Progress bar */}
        {status !== 'new' && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-display text-white/30">
                Progression
              </span>
              <span className="text-[11px] font-display font-bold text-purple-400 tabular-nums">
                {progress}%
              </span>
            </div>
            <ProgressBar percent={progress} />
          </div>
        )}

        {/* Expand toggle + status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {status === 'completed' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/20 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-[11px] font-display font-semibold text-green-400">
                  Termin&eacute;
                </span>
              </div>
            ) : status === 'in_progress' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-[11px] font-display font-semibold text-purple-400">
                  En cours
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <span className="text-[11px] font-display font-semibold text-white/40">
                  Nouveau
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <motion.svg
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </motion.svg>
          </button>
        </div>

        {/* Expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-white/5 space-y-0.5">
                {mod.lessons.map((lesson, idx) => (
                  <LessonCheckbox
                    key={`${mod.id}-lesson-${idx}`}
                    lesson={lesson}
                    checked={lessonStates[idx] ?? false}
                    onToggle={() => onToggleLesson(idx)}
                  />
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0" role="img" aria-label="action">
                    {'\uD83D\uDCCB'}
                  </span>
                  <div>
                    <p className="text-xs font-display font-bold text-amber-400 mb-0.5">
                      Action concr&egrave;te
                    </p>
                    <p className="text-sm text-amber-200/80 leading-relaxed">
                      {mod.actionItem}
                    </p>
                  </div>
                </div>
              </div>

              {status !== 'completed' && (
                <button
                  type="button"
                  onClick={onMarkComplete}
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] transition-all duration-300"
                >
                  {status === 'in_progress'
                    ? 'Marquer comme termin\u00e9'
                    : 'Commencer'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed CTA */}
        {!isExpanded && (
          <button
            type="button"
            onClick={onToggleExpand}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider transition-all duration-300',
              status === 'completed'
                ? 'bg-green-400/5 border border-green-400/20 text-green-400'
                : status === 'in_progress'
                  ? 'bg-white/5 border border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02]'
            )}
          >
            {getStatusLabel(status)}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function FormationsClient({
  playerLevel,
  businessType,
  currentPhaseName,
  currentPhaseRange,
  unlockedModules,
  lockedModules,
  classModules,
  progressMap,
}: FormationsClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const addXP = usePlayerStore((s) => s.addXP);

  /* Local lesson checkbox states (module id -> boolean[]) */
  const [lessonChecks, setLessonChecks] = useState<Record<string, boolean[]>>(
    {}
  );

  const toggleLesson = useCallback(
    (moduleId: string, lessonCount: number, idx: number) => {
      setLessonChecks((prev) => {
        const current = prev[moduleId] ?? Array.from<boolean>({ length: lessonCount }).fill(false);
        const next = [...current];
        next[idx] = !next[idx];
        return { ...prev, [moduleId]: next };
      });
    },
    []
  );

  const handleToggleExpand = useCallback(
    (moduleId: string) => {
      setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
    },
    []
  );

  const handleMarkComplete = useCallback(
    async (moduleId: string, xpReward: number) => {
      try {
        const response = await fetch('/api/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'formation_completed',
            amount: xpReward,
            description: `Formation termin\u00e9e: ${moduleId}`,
            metadata: { formation_id: moduleId },
          }),
        });

        if (response.ok) {
          addXP(xpReward, 'formation_completed');
        }
      } catch {
        // Silently fail — user can retry
      }
    },
    [addXP]
  );

  /* Determine which modules to show based on filter */
  const showUnlocked = activeFilter === 'all' || activeFilter === 'unlocked';
  const showLocked = activeFilter === 'all';
  const showClass = activeFilter === 'all' || activeFilter === 'class';

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={childVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center shadow-[0_0_20px_rgba(255,191,0,0.3)]">
            <svg
              className="w-5 h-5 text-[#0C0C0C]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Formations
            </h1>
            <p className="text-white/40 text-sm">
              Apprends, applique, et gagne de l&apos;XP en ma&icirc;trisant le
              business.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current Phase Banner */}
      <motion.div variants={childVariants} className="mb-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#FFBF00]/20 bg-gradient-to-r from-[#FFBF00]/10 via-[#FF9D00]/5 to-transparent p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBF00]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#FFBF00] animate-pulse" />
                <span className="text-xs font-display font-semibold text-[#FFBF00] uppercase tracking-wider">
                  Phase actuelle
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                {currentPhaseName}
              </h2>
              <p className="text-sm text-white/40 mt-0.5">
                Niveau {currentPhaseRange[0]} &mdash; {currentPhaseRange[1]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-white/40 font-display">
                  Ton niveau
                </p>
                <p className="font-display text-2xl font-bold text-[#FFBF00] tabular-nums">
                  {playerLevel}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FFBF00]/20 border border-[#FFBF00]/30 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#FFBF00]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={childVariants}>
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 mb-8 w-fit">
          {FILTERS.map((filter) => {
            // Hide "Ma Classe" if no business type
            if (filter.key === 'class' && !businessType) return null;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  'relative px-5 py-2.5 rounded-lg text-sm font-display font-medium transition-colors',
                  activeFilter === filter.key
                    ? 'text-[#0C0C0C]'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {activeFilter === filter.key && (
                  <motion.div
                    layoutId="active-formation-filter"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFBF00] to-[#FF9D00]"
                    transition={{
                      type: 'spring',
                      bounce: 0.2,
                      duration: 0.5,
                    }}
                  />
                )}
                <span className="relative z-10">{filter.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Unlocked modules */}
      {showUnlocked && unlockedModules.length > 0 && (
        <motion.div variants={childVariants} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-[#FFBF00]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <h2 className="font-display text-lg font-bold text-white">
              Modules disponibles
            </h2>
            <span className="text-xs font-display text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
              {unlockedModules.length}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key="unlocked"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06 },
                },
              }}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {unlockedModules.map((mod) => (
                <UnlockedModuleCard
                  key={mod.id}
                  module={mod}
                  progressMap={progressMap}
                  isExpanded={expandedModuleId === mod.id}
                  onToggleExpand={() => handleToggleExpand(mod.id)}
                  onMarkComplete={() =>
                    handleMarkComplete(mod.id, mod.xpReward)
                  }
                  lessonStates={
                    lessonChecks[mod.id] ??
                    Array.from<boolean>({ length: mod.lessons.length }).fill(false)
                  }
                  onToggleLesson={(idx) =>
                    toggleLesson(mod.id, mod.lessons.length, idx)
                  }
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Class-specific modules */}
      {showClass && classModules.length > 0 && (
        <motion.div variants={childVariants} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <h2 className="font-display text-lg font-bold text-white">
              Modules de ta classe
            </h2>
            {businessType && (
              <span className="text-xs font-display text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                {businessType}
              </span>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key="class"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06 },
                },
              }}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {classModules.map((mod) => (
                <ClassModuleCard
                  key={mod.id}
                  module={mod}
                  progressMap={progressMap}
                  isExpanded={expandedModuleId === mod.id}
                  onToggleExpand={() => handleToggleExpand(mod.id)}
                  onMarkComplete={() =>
                    handleMarkComplete(mod.id, mod.xpReward)
                  }
                  lessonStates={
                    lessonChecks[mod.id] ??
                    Array.from<boolean>({ length: mod.lessons.length }).fill(false)
                  }
                  onToggleLesson={(idx) =>
                    toggleLesson(mod.id, mod.lessons.length, idx)
                  }
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Locked modules */}
      {showLocked && lockedModules.length > 0 && (
        <motion.div variants={childVariants}>
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <h2 className="font-display text-lg font-bold text-white/40">
              Prochaines formations
            </h2>
            <span className="text-xs font-display text-white/20 bg-white/5 px-2 py-0.5 rounded-md">
              {lockedModules.length}
            </span>
          </div>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.06 },
              },
            }}
            initial="hidden"
            animate="visible"
            className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {lockedModules.map((mod) => (
              <LockedModuleCard key={mod.id} module={mod} />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Empty state — only if nothing at all */}
      {unlockedModules.length === 0 &&
        lockedModules.length === 0 &&
        classModules.length === 0 && (
          <motion.div
            variants={childVariants}
            className="rounded-2xl bg-black/40 backdrop-blur-sm border border-white/5 text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white/10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">
              Aucune formation disponible
            </h2>
            <p className="text-white/30 text-sm max-w-md mx-auto">
              De nouvelles formations seront bient&ocirc;t disponibles.
            </p>
          </motion.div>
        )}
    </motion.div>
  );
}
