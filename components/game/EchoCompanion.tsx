'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEchoStore, type EchoMessageType } from '@/stores/useEchoStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useGameStore } from '@/stores/useGameStore';
import { LEVEL_TITLES } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  ECHO Avatar SVG                                                    */
/* ------------------------------------------------------------------ */

function EchoAvatar({ isExpanded, blinking }: { isExpanded: boolean; blinking: boolean }) {
  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 44 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="echo-c-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2A2A" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        <linearGradient id="echo-c-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFBF00" />
          <stop offset="100%" stopColor="#FF9D00" />
        </linearGradient>
        <filter id="echo-c-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Head */}
      <path
        d="M6,8 L12,2 L32,2 L38,8 L40,18 L38,32 L32,38 L12,38 L6,32 L4,18 Z"
        fill="url(#echo-c-body)"
        stroke="#333333"
        strokeWidth="0.8"
      />

      {/* Top accent */}
      <path
        d="M12,2 L32,2"
        stroke="url(#echo-c-accent)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Visor */}
      <path
        d="M10,12 L34,12 L36,17 L34,22 L10,22 L8,17 Z"
        fill="#0C0C0C"
        stroke="#333333"
        strokeWidth="0.5"
      />

      {/* Eyes */}
      <g filter="url(#echo-c-glow)">
        {blinking ? (
          <>
            <line x1="12" y1="17" x2="18" y2="17" stroke="#FFBF00" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="26" y1="17" x2="32" y2="17" stroke="#FFBF00" strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path
              d={isExpanded ? 'M11,14 L19,14 L19,20 L11,20 Z' : 'M12,17 Q15,14 18,17'}
              stroke="#FFBF00"
              strokeWidth="1.8"
              fill={isExpanded ? '#FFBF00' : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={isExpanded ? 'M25,14 L33,14 L33,20 L25,20 Z' : 'M26,17 Q29,14 32,17'}
              stroke="#FFBF00"
              strokeWidth="1.8"
              fill={isExpanded ? '#FFBF00' : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </g>

      {/* Mouth */}
      <path
        d={isExpanded ? 'M14,27 Q22,36 30,27 Z' : 'M16,28 Q22,33 28,28'}
        stroke="#FFBF00"
        strokeWidth="0.8"
        fill={isExpanded ? 'rgba(255,191,0,0.15)' : 'none'}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />

      {/* Antenna */}
      <line x1="22" y1="2" x2="22" y2="-2" stroke="#555555" strokeWidth="1" />
      <circle cx="22" cy="-3" r="1.8" fill="url(#echo-c-accent)" filter="url(#echo-c-glow)" />

      {/* Neck + shoulders */}
      <rect x="18" y="38" width="8" height="4" rx="1" fill="#1A1A1A" stroke="#333333" strokeWidth="0.5" />
      <path d="M14,42 L30,42 L33,46 L11,46 Z" fill="url(#echo-c-body)" stroke="#333333" strokeWidth="0.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                    */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-ecs-amber"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Message badge color map                                            */
/* ------------------------------------------------------------------ */

const TYPE_STYLES: Record<EchoMessageType, string> = {
  tip: 'border-l-ecs-amber/60',
  achievement: 'border-l-green-500/60',
  warning: 'border-l-red-500/60',
  greeting: 'border-l-blue-400/60',
};

/* ------------------------------------------------------------------ */
/*  Auto-dismiss timer (ms)                                            */
/* ------------------------------------------------------------------ */

const AUTO_DISMISS_MS = 8000;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function EchoCompanion() {
  const messages = useEchoStore((s) => s.messages);
  const isExpanded = useEchoStore((s) => s.isExpanded);
  const isMinimized = useEchoStore((s) => s.isMinimized);
  const addMessage = useEchoStore((s) => s.addMessage);
  const dismissMessage = useEchoStore((s) => s.dismissMessage);
  const toggleExpand = useEchoStore((s) => s.toggleExpand);
  const minimize = useEchoStore((s) => s.minimize);

  const totalXP = usePlayerStore((s) => s.totalXP);
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const level = usePlayerStore((s) => s.level);
  const xpNotification = usePlayerStore((s) => s.xpNotification);
  const showLevelUpModal = usePlayerStore((s) => s.showLevelUpModal);
  const newLevel = usePlayerStore((s) => s.newLevel);
  const activeTab = useGameStore((s) => s.activeTab);

  const [blinking, setBlinking] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const hasGreeted = useRef(false);
  const prevLevel = useRef(level);

  /* Blink loop */
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  /* Auto-dismiss messages */
  useEffect(() => {
    if (messages.length === 0) return;
    const oldest = messages[0];
    const elapsed = Date.now() - oldest.createdAt;
    const remaining = Math.max(AUTO_DISMISS_MS - elapsed, 0);

    const timer = setTimeout(() => {
      dismissMessage(oldest.id);
    }, remaining);

    return () => clearTimeout(timer);
  }, [messages, dismissMessage]);

  /* Queue message with a typing delay */
  const queueMessage = useCallback(
    (text: string, type: EchoMessageType) => {
      setShowTyping(true);
      const timer = setTimeout(() => {
        setShowTyping(false);
        addMessage(text, type);
      }, 1200);
      return () => clearTimeout(timer);
    },
    [addMessage],
  );

  /* Greeting on first mount */
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const visited = typeof window !== 'undefined' && localStorage.getItem('echo-visited');
    if (!visited) {
      queueMessage('Bienvenue dans ECS GAME ! Je suis ECHO, ton assistant IA. \u{1F916}', 'greeting');
      if (typeof window !== 'undefined') {
        localStorage.setItem('echo-visited', '1');
      }
    }
  }, [queueMessage]);

  /* Contextual: XP gain */
  useEffect(() => {
    if (!xpNotification) return;
    const { amount } = xpNotification;
    const comboMsg = currentStreak >= 3 ? ` Combo x${currentStreak} !` : '';
    queueMessage(`Bien jou\u00e9 ! +${amount} XP !${comboMsg}`, 'achievement');
  }, [xpNotification, currentStreak, queueMessage]);

  /* Contextual: Level up */
  useEffect(() => {
    if (!showLevelUpModal || !newLevel) return;
    const title = LEVEL_TITLES[newLevel] ?? `Niveau ${newLevel}`;
    queueMessage(`LEVEL UP ! Tu es maintenant ${title} ! \u{1F389}`, 'achievement');
  }, [showLevelUpModal, newLevel, queueMessage]);

  /* Contextual: tab-based tips */
  useEffect(() => {
    if (activeTab === 'dashboard' && totalXP === 0) {
      queueMessage(
        'H\u00e9 ! Tu n\u2019as pas encore gagn\u00e9 d\u2019XP aujourd\u2019hui. Lance une qu\u00eate ! \u{1F3AF}',
        'tip',
      );
    }
    if (activeTab === 'leaderboard') {
      queueMessage('Tu es \u00e0 quelques places du top 3. Continue comme \u00e7a ! \u{1F525}', 'tip');
    }
  }, [activeTab, totalXP, queueMessage]);

  /* Contextual: streak warning */
  useEffect(() => {
    if (currentStreak > 0 && totalXP === 0) {
      queueMessage(
        `Attention ! Ton streak de ${currentStreak} jours est en danger \u26A0\uFE0F`,
        'warning',
      );
    }
  }, [currentStreak, totalXP, queueMessage]);

  /* Track level changes */
  useEffect(() => {
    prevLevel.current = level;
  }, [level]);

  if (isMinimized) {
    return (
      <motion.button
        className="fixed bottom-20 right-4 z-50 md:bottom-6 h-10 w-10 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(12,12,12,0.98))',
          border: '1px solid rgba(255,191,0,0.25)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 12px rgba(255,191,0,0.1)',
        }}
        onClick={() => {
          useEchoStore.setState({ isMinimized: false });
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        aria-label="Ouvrir ECHO"
      >
        <span className="text-ecs-amber text-sm font-display font-bold">E</span>
      </motion.button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 flex flex-col items-end gap-2">
      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="w-72 max-h-80 overflow-y-auto rounded-xl"
            style={{
              background: 'linear-gradient(180deg, rgba(26,26,26,0.97) 0%, rgba(12,12,12,0.99) 100%)',
              border: '1px solid rgba(255,191,0,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(255,191,0,0.08)',
              backdropFilter: 'blur(16px)',
            }}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-ecs-gray-border">
              <span className="text-xs font-display font-bold text-gradient-amber tracking-wider uppercase">
                Echo
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={minimize}
                  className="p-1 rounded hover:bg-ecs-gray-dark/40 transition-colors"
                  aria-label="R\u00e9duire ECHO"
                >
                  <Minimize2 className="h-3 w-3 text-ecs-gray" />
                </button>
                <button
                  onClick={toggleExpand}
                  className="p-1 rounded hover:bg-ecs-gray-dark/40 transition-colors"
                  aria-label="Fermer le panneau ECHO"
                >
                  <X className="h-3 w-3 text-ecs-gray" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-3 space-y-2">
              {messages.length === 0 && !showTyping && (
                <p className="text-xs text-ecs-gray text-center py-4">
                  Pas de message pour le moment.
                </p>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={cn(
                      'rounded-lg px-3 py-2 text-xs text-ecs-gray font-body leading-relaxed border-l-2',
                      TYPE_STYLES[msg.type],
                    )}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                    }}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    layout
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span>{msg.text}</span>
                      <button
                        onClick={() => dismissMessage(msg.id)}
                        className="mt-0.5 shrink-0 p-0.5 rounded hover:bg-ecs-gray-dark/40 transition-colors"
                        aria-label="Fermer le message"
                      >
                        <X className="h-3 w-3 text-ecs-gray/60" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {showTyping && <TypingIndicator />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating avatar button */}
      <motion.button
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          background: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(12,12,12,0.98))',
          border: '1px solid rgba(255,191,0,0.25)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 16px rgba(255,191,0,0.12)',
        }}
        onClick={toggleExpand}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
        aria-label={isExpanded ? 'Fermer ECHO' : 'Ouvrir ECHO'}
      >
        {/* Pulsing glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(255,191,0,0)',
              '0 0 0 6px rgba(255,191,0,0.12)',
              '0 0 0 0 rgba(255,191,0,0)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <EchoAvatar isExpanded={isExpanded} blinking={blinking} />

        {/* Unread badge */}
        {messages.length > 0 && !isExpanded && (
          <motion.div
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-ecs-black"
            style={{
              background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
              boxShadow: '0 0 8px rgba(255,191,0,0.5)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {messages.length}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}
