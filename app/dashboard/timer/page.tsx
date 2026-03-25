'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerSession {
  id: string;
  duration_seconds: number;
  notes: string;
  created_at: string;
}

const POMODORO_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type TimerMode = 'focus' | 'short_break' | 'long_break';

const MODE_CONFIG: Record<TimerMode, { label: string; duration: number; color: string; gradient: string; glowColor: string }> = {
  focus: { label: 'Focus', duration: POMODORO_DURATION, color: 'text-[#FFBF00]', gradient: 'from-[#FFBF00] to-[#FF9D00]', glowColor: 'rgba(255,191,0,' },
  short_break: { label: 'Pause courte', duration: SHORT_BREAK, color: 'text-green-400', gradient: 'from-green-400 to-emerald-500', glowColor: 'rgba(74,222,128,' },
  long_break: { label: 'Pause longue', duration: LONG_BREAK, color: 'text-blue-400', gradient: 'from-blue-400 to-blue-500', glowColor: 'rgba(96,165,250,' },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

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

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [notes, setNotes] = useState('');
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  const totalDuration = MODE_CONFIG[mode].duration;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const modeConfig = MODE_CONFIG[mode];

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/timer/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions ?? []);
      }
    } catch {
      // Error handled silently
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const saveSession = useCallback(async (durationSeconds: number) => {
    if (durationSeconds < 60) return;

    try {
      await fetch('/api/timer/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_seconds: durationSeconds,
          notes: notes.trim(),
        }),
      });
      fetchSessions();
    } catch {
      // Error handled silently
    }
  }, [notes, fetchSessions]);

  useEffect(() => {
    if (status === 'running') {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            setStatus('idle');
            const totalElapsed = elapsedBeforePauseRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
            if (mode === 'focus') {
              saveSession(totalElapsed);
            }
            elapsedBeforePauseRef.current = 0;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => stopTimer();
  }, [status, mode, stopTimer, saveSession]);

  function handleStart() {
    if (status === 'idle') {
      setTimeLeft(totalDuration);
      elapsedBeforePauseRef.current = 0;
    }
    setStatus('running');
  }

  function handlePause() {
    stopTimer();
    elapsedBeforePauseRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
    setStatus('paused');
  }

  function handleReset() {
    stopTimer();
    setTimeLeft(totalDuration);
    elapsedBeforePauseRef.current = 0;
    setStatus('idle');
  }

  function handleModeChange(newMode: TimerMode) {
    stopTimer();
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].duration);
    elapsedBeforePauseRef.current = 0;
    setStatus('idle');
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={childVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center shadow-[0_0_20px_rgba(255,191,0,0.3)]">
            <svg className="w-5 h-5 text-[#0C0C0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Timer
            </h1>
            <p className="text-white/40 text-sm">
              Pomodoro timer pour rester focus et productif.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mode selector */}
      <motion.div variants={childVariants}>
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 mb-10">
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                'relative flex-1 py-3 px-4 rounded-lg text-sm font-display font-medium transition-colors',
                mode === m
                  ? 'text-[#0C0C0C]'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {mode === m && (
                <motion.div
                  layoutId="timer-mode"
                  className={cn('absolute inset-0 rounded-lg bg-gradient-to-r', modeConfig.gradient)}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{MODE_CONFIG[m].label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Timer circle */}
      <motion.div
        variants={childVariants}
        className="flex justify-center mb-10"
      >
        <div className="relative w-72 h-72 md:w-80 md:h-80">
          {/* Outer glow */}
          <div
            className={cn(
              'absolute inset-0 rounded-full blur-2xl transition-opacity duration-500',
              status === 'running' ? 'opacity-40' : 'opacity-10'
            )}
            style={{ backgroundColor: `${modeConfig.glowColor}0.2)` }}
          />

          {/* Glassmorphism container */}
          <div className="absolute inset-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/5" />

          <svg className="relative w-full h-full -rotate-90" viewBox="0 0 300 300">
            {/* Track circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="currentColor"
              className="text-white/5"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke={`url(#timerGradient-${mode})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
            {/* Glow circle (behind progress) */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke={`url(#timerGradient-${mode})`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear opacity-20 blur-sm"
            />
            <defs>
              <linearGradient id="timerGradient-focus" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFBF00" />
                <stop offset="100%" stopColor="#FF9D00" />
              </linearGradient>
              <linearGradient id="timerGradient-short_break" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="timerGradient-long_break" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Pulsing dot when active */}
            {status === 'running' && (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-2 h-2 rounded-full mb-3"
                style={{ backgroundColor: `${modeConfig.glowColor}1)` }}
              />
            )}
            {status === 'paused' && (
              <div className="flex gap-1 mb-3">
                <div className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: `${modeConfig.glowColor}0.6)` }} />
                <div className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: `${modeConfig.glowColor}0.6)` }} />
              </div>
            )}
            {status === 'idle' && <div className="h-5 mb-3" />}

            <span className={cn(
              'font-display text-5xl md:text-6xl font-bold tabular-nums tracking-tight',
              modeConfig.color
            )}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-white/20 text-xs mt-2 font-display uppercase tracking-[0.2em]">
              {modeConfig.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div variants={childVariants} className="flex items-center justify-center gap-4 mb-10">
        <AnimatePresence mode="wait">
          {status === 'running' ? (
            <motion.button
              key="pause"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handlePause}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </motion.button>
          ) : (
            <motion.button
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleStart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all',
                `bg-gradient-to-r ${modeConfig.gradient} text-[#0C0C0C]`,
                `hover:shadow-[0_0_25px_${modeConfig.glowColor}0.3)]`
              )}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {status === 'paused' ? 'Reprendre' : 'D\u00e9marrer'}
            </motion.button>
          )}
        </AnimatePresence>

        <button
          onClick={handleReset}
          disabled={status === 'idle'}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/40 font-display font-bold text-sm uppercase tracking-wider transition-all hover:text-white/70 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-white/40 disabled:hover:bg-white/5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Reset
        </button>
      </motion.div>

      {/* Notes */}
      <motion.div
        variants={childVariants}
        className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm p-5 mb-8"
      >
        <label className="flex items-center gap-2 text-sm font-display font-medium text-white/40 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          Notes de session
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Sur quoi travaillez-vous ?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white placeholder:text-white/15 outline-none focus:border-[#FFBF00]/30 focus:ring-1 focus:ring-[#FFBF00]/10 transition-colors resize-none text-sm"
        />
      </motion.div>

      {/* Recent sessions */}
      <motion.div
        variants={childVariants}
        className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-base font-bold text-white">
            Sessions r&eacute;centes
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {sessionsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white/[0.02] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 rounded bg-white/5" />
                  <div className="h-3 w-32 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/20 text-sm font-display">
              Aucune session enregistr&eacute;e.
            </p>
          </div>
        ) : (
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="group rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#FFBF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-display font-bold text-white text-sm tabular-nums">
                        {formatTime(session.duration_seconds)}
                      </p>
                      <span className="text-[11px] text-white/20 flex-shrink-0">
                        {new Date(session.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {session.notes && (
                      <p className="text-xs text-white/30 truncate">{session.notes}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
