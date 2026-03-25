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

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type TimerMode = 'focus' | 'short_break' | 'long_break';

const MODE_CONFIG: Record<TimerMode, { label: string; duration: number; color: string }> = {
  focus: { label: 'Focus', duration: POMODORO_DURATION, color: 'text-ecs-amber' },
  short_break: { label: 'Pause courte', duration: SHORT_BREAK, color: 'text-green-400' },
  long_break: { label: 'Pause longue', duration: LONG_BREAK, color: 'text-blue-400' },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

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
    if (durationSeconds < 60) return; // Don't save sessions shorter than 1 minute

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

  const modeConfig = MODE_CONFIG[mode];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Timer
        </h1>
        <p className="text-ecs-gray text-sm mb-6">
          Pomodoro timer pour rester focus et productif.
        </p>
      </motion.div>

      {/* Mode selector */}
      <div className="flex gap-1 p-1 rounded-lg bg-ecs-black-light border border-ecs-gray-border mb-8">
        {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={cn(
              'relative flex-1 py-2.5 px-4 rounded-md text-sm font-display font-medium transition-colors',
              mode === m
                ? 'text-ecs-black'
                : 'text-ecs-gray hover:text-white'
            )}
          >
            {mode === m && (
              <motion.div
                layoutId="timer-mode"
                className="absolute inset-0 rounded-md bg-gradient-amber"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{MODE_CONFIG[m].label}</span>
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <div className="relative w-72 h-72 md:w-80 md:h-80">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            {/* Background circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="currentColor"
              className="text-ecs-gray-dark"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFBF00" />
                <stop offset="100%" stopColor="#FF9D00" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-display text-5xl md:text-6xl font-bold tabular-nums', modeConfig.color)}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-ecs-gray text-sm mt-2 font-display uppercase tracking-wider">
              {modeConfig.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {status === 'running' ? (
          <button
            onClick={handlePause}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            Pause
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {status === 'paused' ? 'Reprendre' : 'D\u00e9marrer'}
          </button>
        )}
        <button
          onClick={handleReset}
          disabled={status === 'idle'}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Reset
        </button>
      </div>

      {/* Notes */}
      <div className="card-ecs mb-8">
        <label className="block text-sm font-display font-medium text-ecs-gray mb-2">
          Notes de session
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Sur quoi travaillez-vous ?"
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white placeholder:text-ecs-gray/50 outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors resize-none"
        />
      </div>

      {/* Recent sessions */}
      <div className="card-ecs">
        <h2 className="font-display text-lg font-bold text-white mb-4">
          Sessions r&eacute;centes
        </h2>
        {sessionsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-full bg-ecs-gray-dark" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-ecs-gray-dark" />
                  <div className="h-3 w-40 rounded bg-ecs-gray-dark" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-ecs-gray text-sm text-center py-6">
            Aucune session enregistr&eacute;e.
          </p>
        ) : (
          <div className="space-y-0">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className={cn(
                  'flex items-center gap-4 py-3',
                  index < sessions.length - 1 && 'border-b border-ecs-gray-border'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-ecs-amber/10 border border-ecs-amber/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-ecs-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-sm">
                    {formatTime(session.duration_seconds)}
                  </p>
                  {session.notes && (
                    <p className="text-xs text-ecs-gray truncate">{session.notes}</p>
                  )}
                </div>
                <span className="text-xs text-ecs-gray flex-shrink-0">
                  {new Date(session.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
