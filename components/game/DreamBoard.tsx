'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Check, X, Bell, BellOff, Plus, Trash2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DreamGoal {
  id: string;
  emoji: string;
  text: string;
  targetLevel: number;
}

interface DreamBoardState {
  goals: DreamGoal[];
  dailyReminder: boolean;
}

const DEFAULT_GOALS: DreamGoal[] = [
  { id: 'goal-1', emoji: '\u{1F4B0}', text: 'Liberte financiere', targetLevel: 10 },
  { id: 'goal-2', emoji: '\u{1F697}', text: 'Ma premiere voiture', targetLevel: 6 },
  { id: 'goal-3', emoji: '\u{1F680}', text: 'Quitter mon job', targetLevel: 12 },
];

const EMOJI_OPTIONS = [
  '\u{1F4B0}', '\u{1F697}', '\u{1F680}', '\u{1F3E0}', '\u{2708}\uFE0F', '\u{1F4BB}',
  '\u{1F451}', '\u{1F48E}', '\u{1F3C6}', '\u{1F525}', '\u{2B50}', '\u{1F31F}',
  '\u{1F4AA}', '\u{1F3AF}', '\u{1F30D}', '\u{26A1}',
];

const STORAGE_KEY = 'ecs-dream-board';

/* ------------------------------------------------------------------ */
/*  Constellation line between goals                                    */
/* ------------------------------------------------------------------ */

function ConstellationLines({ goalCount }: { goalCount: number }) {
  const points = useMemo(() => {
    if (goalCount < 2) return [];
    const result: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < goalCount; i++) {
      const angle = ((2 * Math.PI) / goalCount) * i - Math.PI / 2;
      result.push({
        x: 50 + 35 * Math.cos(angle),
        y: 50 + 35 * Math.sin(angle),
      });
    }
    return result;
  }, [goalCount]);

  if (points.length < 2) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="constellation-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFBF00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF9D00" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        return (
          <motion.line
            key={`line-${i}`}
            x1={p.x}
            y1={p.y}
            x2={next.x}
            y2={next.y}
            stroke="url(#constellation-grad)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.3, ease: 'easeOut' }}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Goal card                                                          */
/* ------------------------------------------------------------------ */

interface GoalCardProps {
  goal: DreamGoal;
  index: number;
  playerLevel: number;
  isEditing: boolean;
  onUpdate: (goal: DreamGoal) => void;
  onDelete: (id: string) => void;
}

function GoalCard({ goal, index, playerLevel, isEditing, onUpdate, onDelete }: GoalCardProps) {
  const [editEmoji, setEditEmoji] = useState(goal.emoji);
  const [editText, setEditText] = useState(goal.text);
  const [editTarget, setEditTarget] = useState(goal.targetLevel);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const progress = useMemo(() => {
    if (playerLevel >= goal.targetLevel) return 100;
    return Math.round((playerLevel / goal.targetLevel) * 100);
  }, [playerLevel, goal.targetLevel]);

  const isAchieved = playerLevel >= goal.targetLevel;

  const handleSave = useCallback(() => {
    onUpdate({ ...goal, emoji: editEmoji, text: editText, targetLevel: editTarget });
    setShowEmojiPicker(false);
  }, [goal, editEmoji, editText, editTarget, onUpdate]);

  useEffect(() => {
    setEditEmoji(goal.emoji);
    setEditText(goal.text);
    setEditTarget(goal.targetLevel);
  }, [goal]);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      layout
    >
      {/* Floating animation wrapper */}
      <motion.div
        animate={!isEditing ? { y: [0, -4, 0] } : undefined}
        transition={{
          duration: 3 + index * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glass card */}
        <div
          className={cn(
            'relative rounded-xl p-5 overflow-hidden transition-all duration-500',
            isAchieved && 'ring-1 ring-ecs-amber/40',
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(12, 12, 12, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isAchieved
              ? '0 0 30px rgba(255, 191, 0, 0.15), 0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Achievement shimmer */}
          {isAchieved && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              <div
                className="absolute inset-0 animate-shimmer-sweep"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,191,0,0.08) 50%, transparent 100%)',
                  width: '50%',
                }}
              />
            </div>
          )}

          {/* Progress pulse when advancing */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={
              progress > 0 && progress < 100
                ? {
                    boxShadow: [
                      'inset 0 0 0 0 rgba(255,191,0,0)',
                      'inset 0 0 20px 0 rgba(255,191,0,0.05)',
                      'inset 0 0 0 0 rgba(255,191,0,0)',
                    ],
                  }
                : undefined
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10">
            {/* Edit mode */}
            {isEditing ? (
              <div className="space-y-3">
                {/* Emoji picker */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-3xl hover:scale-110 transition-transform"
                    type="button"
                  >
                    {editEmoji}
                  </button>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 bg-ecs-black/60 border border-ecs-gray-border rounded-lg px-3 py-2 text-sm text-white font-display focus:outline-none focus:border-ecs-amber/50"
                    placeholder="Mon objectif..."
                  />
                </div>

                {/* Emoji grid */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      className="grid grid-cols-8 gap-1.5 p-2 rounded-lg bg-ecs-black/80 border border-ecs-gray-border"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          onClick={() => {
                            setEditEmoji(em);
                            setShowEmojiPicker(false);
                          }}
                          className={cn(
                            'text-lg p-1 rounded hover:bg-ecs-gray-dark/40 transition-colors',
                            em === editEmoji && 'bg-ecs-amber/20',
                          )}
                          type="button"
                        >
                          {em}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Target level */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-ecs-gray font-display whitespace-nowrap">
                    Objectif Niveau :
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={editTarget}
                    onChange={(e) => setEditTarget(Number(e.target.value))}
                    className="flex-1 accent-ecs-amber"
                  />
                  <span className="text-sm font-display font-bold text-ecs-amber w-6 text-center">
                    {editTarget}
                  </span>
                </div>

                {/* Save / Delete */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider bg-gradient-amber text-ecs-black hover:opacity-90 transition-opacity"
                    type="button"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => onDelete(goal.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors"
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Display mode */}
                <div className="flex items-start gap-4">
                  {/* Large emoji */}
                  <motion.div
                    className="text-4xl shrink-0"
                    animate={isAchieved ? { scale: [1, 1.1, 1] } : undefined}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {goal.emoji}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    {/* Goal text */}
                    <h3 className="font-display font-bold text-white text-base leading-tight mb-1">
                      {goal.text}
                    </h3>
                    <p className="text-[11px] text-ecs-gray font-display mb-3">
                      Objectif : Niveau {goal.targetLevel}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-ecs-gray font-display">Progression</span>
                        <span
                          className="text-[10px] font-display font-bold"
                          style={{
                            color: isAchieved ? '#FFBF00' : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {progress}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: isAchieved
                              ? 'linear-gradient(90deg, #FFBF00, #FFD700)'
                              : 'linear-gradient(90deg, #FFBF00, #FF9D00)',
                            boxShadow: progress > 0 ? '0 0 8px rgba(255,191,0,0.3)' : 'none',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ type: 'spring', stiffness: 60, damping: 20, delay: 0.3 + index * 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Achievement badge */}
                    {isAchieved && (
                      <motion.div
                        className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold text-ecs-black"
                        style={{ background: 'linear-gradient(135deg, #FFBF00, #FFD700)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                      >
                        <Sparkles className="h-3 w-3" />
                        Accompli
                      </motion.div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reminder banner                                                    */
/* ------------------------------------------------------------------ */

function ReminderBanner({ goal }: { goal: DreamGoal }) {
  return (
    <motion.div
      className="rounded-lg p-3 flex items-center gap-3 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(255,191,0,0.08) 0%, rgba(255,157,0,0.04) 100%)',
        border: '1px solid rgba(255,191,0,0.15)',
      }}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <span className="text-xl">{goal.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-display uppercase tracking-wider text-ecs-amber/70">
          Rappel quotidien
        </p>
        <p className="text-xs font-display font-bold text-white truncate">{goal.text}</p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main DreamBoard component                                          */
/* ------------------------------------------------------------------ */

export function DreamBoard() {
  const level = usePlayerStore((s) => s.level);
  const [goals, setGoals] = useState<DreamGoal[]>(DEFAULT_GOALS);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DreamBoardState;
        if (parsed.goals && Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
        }
        if (typeof parsed.dailyReminder === 'boolean') {
          setDailyReminder(parsed.dailyReminder);
        }
      }
    } catch {
      // Use defaults on error
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const state: DreamBoardState = { goals, dailyReminder };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently fail
    }
  }, [goals, dailyReminder, isLoaded]);

  const handleUpdateGoal = useCallback((updated: DreamGoal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const handleAddGoal = useCallback(() => {
    const newGoal: DreamGoal = {
      id: `goal-${Date.now()}`,
      emoji: '\u{2B50}',
      text: 'Nouvel objectif',
      targetLevel: Math.min(level + 3, 15),
    };
    setGoals((prev) => [...prev, newGoal]);
  }, [level]);

  // Pick a random goal for daily reminder
  const reminderGoal = useMemo(() => {
    if (!dailyReminder || goals.length === 0) return null;
    const unachieved = goals.filter((g) => level < g.targetLevel);
    if (unachieved.length === 0) return goals[0];
    const dayIndex = new Date().getDate() % unachieved.length;
    return unachieved[dayIndex];
  }, [dailyReminder, goals, level]);

  if (!isLoaded) return null;

  return (
    <div className="relative w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-white text-lg">
            Pourquoi tu te bats ?
          </h2>
          <p className="text-xs text-ecs-gray font-display">
            Tes objectifs, ta motivation, ton carburant
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reminder toggle */}
          <button
            onClick={() => setDailyReminder(!dailyReminder)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider transition-all',
              dailyReminder
                ? 'bg-ecs-amber/15 text-ecs-amber border border-ecs-amber/30'
                : 'bg-ecs-black-card text-ecs-gray border border-ecs-gray-border',
            )}
            type="button"
          >
            {dailyReminder ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            Rappel
          </button>

          {/* Edit toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider transition-all',
              isEditing
                ? 'bg-ecs-amber/15 text-ecs-amber border border-ecs-amber/30'
                : 'bg-ecs-black-card text-ecs-gray border border-ecs-gray-border',
            )}
            type="button"
          >
            {isEditing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
            {isEditing ? 'Terminer' : 'Modifier'}
          </button>
        </div>
      </div>

      {/* Daily reminder banner */}
      <AnimatePresence>
        {dailyReminder && reminderGoal && !isEditing && <ReminderBanner goal={reminderGoal} />}
      </AnimatePresence>

      {/* Goals grid with constellation */}
      <div className="relative">
        <ConstellationLines goalCount={goals.length} />

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={index}
                playerLevel={level}
                isEditing={isEditing}
                onUpdate={handleUpdateGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </AnimatePresence>

          {/* Add goal button */}
          {isEditing && goals.length < 6 && (
            <motion.button
              className="flex flex-col items-center justify-center gap-2 rounded-xl p-5 min-h-[140px] border border-dashed border-ecs-gray-border/50 hover:border-ecs-amber/40 transition-colors group"
              onClick={handleAddGoal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
            >
              <Plus className="h-6 w-6 text-ecs-gray group-hover:text-ecs-amber transition-colors" />
              <span className="text-xs font-display text-ecs-gray group-hover:text-ecs-amber transition-colors">
                Ajouter un objectif
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
