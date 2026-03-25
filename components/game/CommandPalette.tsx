'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Timer,
  Sword,
  Trophy,
  User,
  Gift,
  Command,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PaletteAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

/* ------------------------------------------------------------------ */
/*  Fuzzy search helper                                                */
/* ------------------------------------------------------------------ */

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  if (t.includes(q)) return true;

  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
    }
  }
  return qi === q.length;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /* Build actions list */
  const actions: PaletteAction[] = useMemo(
    () => [
      {
        id: 'log-xp',
        label: 'Logger du XP',
        icon: Sparkles,
        shortcut: 'L',
        action: () => {
          close();
          /* Dispatch a custom event that the LogXPForm modal can listen for */
          window.dispatchEvent(new CustomEvent('echo:open-log-xp'));
        },
      },
      {
        id: 'timer',
        label: 'Lancer un timer',
        icon: Timer,
        shortcut: 'T',
        action: () => {
          close();
          router.push('/dashboard/timer');
        },
      },
      {
        id: 'quests',
        label: 'Voir mes qu\u00eates',
        icon: Sword,
        shortcut: 'Q',
        action: () => {
          close();
          router.push('/dashboard/quests');
        },
      },
      {
        id: 'leaderboard',
        label: 'Classement',
        icon: Trophy,
        shortcut: 'C',
        action: () => {
          close();
          router.push('/dashboard/leaderboard');
        },
      },
      {
        id: 'profile',
        label: 'Mon profil',
        icon: User,
        shortcut: 'P',
        action: () => {
          close();
          router.push('/dashboard/profile');
        },
      },
      {
        id: 'rewards',
        label: 'R\u00e9compenses',
        icon: Gift,
        shortcut: 'R',
        action: () => {
          close();
          router.push('/dashboard/rewards');
        },
      },
    ],
    [close, router],
  );

  /* Filtered results */
  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    return actions.filter((a) => fuzzyMatch(query, a.label));
  }, [query, actions]);

  /* Reset selection when filtered list changes */
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  /* Global Ctrl+K / Cmd+K */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, open]);

  /* Auto-focus input */
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  /* Keyboard navigation inside the palette */
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          selected.action();
        }
      }
    },
    [filtered, selectedIndex],
  );

  return (
    <>
      {/* Trigger button (visible inline or in nav) */}
      <button
        onClick={open}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ecs-gray font-body transition-colors hover:bg-ecs-gray-dark/30"
        style={{
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-label="Ouvrir la palette de commandes"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Actions rapides</span>
        <kbd
          className="ml-2 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
              }}
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-md rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(26,26,26,0.98) 0%, rgba(12,12,12,0.99) 100%)',
                border: '1px solid rgba(255,191,0,0.15)',
                boxShadow: '0 16px 64px rgba(0,0,0,0.6), 0 0 32px rgba(255,191,0,0.08)',
              }}
              initial={{ opacity: 0, scale: 0.92, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-label="Palette de commandes"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-ecs-gray-border">
                <Search className="h-4 w-4 text-ecs-gray shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Rechercher une action..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-ecs-gray/50 font-body outline-none"
                />
                <kbd
                  className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono text-ecs-gray/60"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Actions list */}
              <div className="py-2 max-h-72 overflow-y-auto" role="listbox">
                {filtered.length === 0 && (
                  <p className="px-4 py-6 text-center text-xs text-ecs-gray/60 font-body">
                    Aucune action trouv\u00e9e
                  </p>
                )}
                {filtered.map((action, index) => {
                  const Icon = action.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        background: isSelected
                          ? 'rgba(255,191,0,0.08)'
                          : 'transparent',
                      }}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div
                        className="flex shrink-0 items-center justify-center h-8 w-8 rounded-lg transition-colors"
                        style={{
                          background: isSelected
                            ? 'rgba(255,191,0,0.15)'
                            : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isSelected ? 'rgba(255,191,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        <Icon
                          className={`h-4 w-4 transition-colors ${isSelected ? 'text-ecs-amber' : 'text-ecs-gray'}`}
                        />
                      </div>

                      <span
                        className={`flex-1 text-sm font-body transition-colors ${isSelected ? 'text-white' : 'text-ecs-gray'}`}
                      >
                        {action.label}
                      </span>

                      {action.shortcut && (
                        <kbd
                          className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors"
                          style={{
                            background: isSelected
                              ? 'rgba(255,191,0,0.1)'
                              : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isSelected ? 'rgba(255,191,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            color: isSelected
                              ? '#FFBF00'
                              : 'rgba(136,136,136,0.6)',
                          }}
                        >
                          {action.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div
                className="flex items-center justify-between px-4 py-2 border-t border-ecs-gray-border"
              >
                <span className="text-[10px] text-ecs-gray/40 font-body">
                  \u2191\u2193 naviguer &middot; \u23CE s\u00e9lectionner &middot; ESC fermer
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
