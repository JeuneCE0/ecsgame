'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { LEVEL_TITLES } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Chapter definitions                                                */
/* ------------------------------------------------------------------ */

interface Chapter {
  id: number;
  title: string;
  levelMin: number;
  levelMax: number;
  narrative: string;
  gradient: string;
  bgGradient: string;
  accentColor: string;
  glowColor: string;
  icon: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "L'Eveil",
    levelMin: 1,
    levelMax: 3,
    narrative:
      "Tu decouvres le monde du business. Tout est nouveau, tout est possible. Chaque appel est une aventure, chaque contact une opportunite. Tu apprends les bases, tu construis tes fondations. Le chemin sera long, mais chaque legende a commence par un premier pas. C'est le tien.",
    gradient: 'linear-gradient(135deg, #0D4D4D, #065A5A, #047857)',
    bgGradient: 'linear-gradient(180deg, rgba(13, 77, 77, 0.15) 0%, rgba(12, 12, 12, 0) 100%)',
    accentColor: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.2)',
    icon: '\u{1F331}',
  },
  {
    id: 2,
    title: 'La Quete',
    levelMin: 4,
    levelMax: 6,
    narrative:
      "Tes premiers deals, tes premieres victoires. Tu sens la confiance grandir en toi. Les techniques de closing deviennent naturelles. Tu commences a generer du revenu reel. Les doutes s'effacent face aux resultats. Tu es un Closer maintenant.",
    gradient: 'linear-gradient(135deg, #78350F, #92400E, #B45309)',
    bgGradient: 'linear-gradient(180deg, rgba(255, 191, 0, 0.1) 0%, rgba(12, 12, 12, 0) 100%)',
    accentColor: '#FFBF00',
    glowColor: 'rgba(255, 191, 0, 0.2)',
    icon: '\u{2694}\uFE0F',
  },
  {
    id: 3,
    title: "L'Ascension",
    levelMin: 7,
    levelMax: 9,
    narrative:
      "Tu deviens un closer redoutable. Ton pipeline deborde, tes conversions explosent. Les autres commencent a te remarquer. Tu n'es plus un debutant — tu es une force. Chaque journee est une nouvelle conquete vers le sommet.",
    gradient: 'linear-gradient(135deg, #1E3A5F, #1E40AF, #3B82F6)',
    bgGradient: 'linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, rgba(12, 12, 12, 0) 100%)',
    accentColor: '#60A5FA',
    glowColor: 'rgba(96, 165, 250, 0.2)',
    icon: '\u{26A1}',
  },
  {
    id: 4,
    title: 'La Maitrise',
    levelMin: 10,
    levelMax: 12,
    narrative:
      "Les autres te regardent avec respect. Tu es devenu un leader, un mentor. Ton empire commercial prend forme. Tu ne suis plus le chemin — tu le traces. Chaque decision est strategique, chaque action est calculee. Tu es un maitre du jeu.",
    gradient: 'linear-gradient(135deg, #4C1D95, #6D28D9, #A78BFA)',
    bgGradient: 'linear-gradient(180deg, rgba(167, 139, 250, 0.1) 0%, rgba(12, 12, 12, 0) 100%)',
    accentColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.2)',
    icon: '\u{1F451}',
  },
  {
    id: 5,
    title: 'La Legende',
    levelMin: 13,
    levelMax: 15,
    narrative:
      "Ton nom resonne dans tout l'ecosysteme. Tu es une legende vivante. Les nouveaux joueurs s'inspirent de ton parcours. Tu as transforme ta vie par l'action quotidienne. Ce qui etait un reve est devenu ta realite. Tu es inarretable.",
    gradient: 'linear-gradient(135deg, #78350F, #B45309, #FFBF00, #FFD700)',
    bgGradient: 'linear-gradient(180deg, rgba(255, 215, 0, 0.12) 0%, rgba(12, 12, 12, 0) 100%)',
    accentColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.25)',
    icon: '\u{1F31F}',
  },
];

/* ------------------------------------------------------------------ */
/*  Cinematic text reveal                                              */
/* ------------------------------------------------------------------ */

function CinematicText({ text, isActive }: { text: string; isActive: boolean }) {
  const words = useMemo(() => text.split(' '), [text]);
  const [visibleCount, setVisibleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setVisibleCount(words.length);
      return;
    }

    setVisibleCount(0);

    const timer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setVisibleCount((prev) => {
          if (prev >= words.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 60);
    }, 400);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, words.length]);

  return (
    <p className="text-sm text-white/80 leading-relaxed font-body">
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-1"
          initial={{ opacity: 0, y: 4 }}
          animate={
            i < visibleCount ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }
          }
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Chapter card                                                       */
/* ------------------------------------------------------------------ */

interface ChapterCardProps {
  chapter: Chapter;
  playerLevel: number;
  isSelected: boolean;
  onClick: () => void;
}

function ChapterCard({ chapter, playerLevel, isSelected, onClick }: ChapterCardProps) {
  const isUnlocked = playerLevel >= chapter.levelMin;
  const isCompleted = playerLevel > chapter.levelMax;
  const isCurrent = playerLevel >= chapter.levelMin && playerLevel <= chapter.levelMax;

  const progressInChapter = useMemo(() => {
    if (isCompleted) return 100;
    if (!isCurrent) return 0;
    const range = chapter.levelMax - chapter.levelMin + 1;
    const current = playerLevel - chapter.levelMin;
    return Math.round((current / range) * 100);
  }, [isCompleted, isCurrent, playerLevel, chapter]);

  return (
    <motion.button
      className={cn(
        'relative flex items-center gap-3 w-full text-left rounded-lg p-3 transition-all duration-300',
        isSelected && 'ring-1',
      )}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${chapter.accentColor}15, ${chapter.accentColor}08)`
          : isUnlocked
            ? 'rgba(26, 26, 26, 0.6)'
            : 'rgba(12, 12, 12, 0.8)',
        border: isSelected
          ? `1px solid ${chapter.accentColor}40`
          : '1px solid rgba(255,255,255,0.04)',
        ...( isSelected ? { '--tw-ring-color': `${chapter.accentColor}40` } as React.CSSProperties : {}),
      }}
      onClick={onClick}
      whileHover={isUnlocked ? { x: 4 } : undefined}
      whileTap={isUnlocked ? { scale: 0.98 } : undefined}
      disabled={!isUnlocked}
      type="button"
    >
      {/* Chapter number / icon */}
      <div
        className="flex items-center justify-center shrink-0 w-10 h-10 rounded-lg"
        style={{
          background: isCompleted
            ? chapter.gradient
            : isUnlocked
              ? `${chapter.accentColor}15`
              : 'rgba(255,255,255,0.03)',
          border: isCompleted
            ? 'none'
            : `1px solid ${isUnlocked ? `${chapter.accentColor}30` : 'rgba(255,255,255,0.06)'}`,
          boxShadow: isCompleted ? `0 0 12px ${chapter.glowColor}` : 'none',
        }}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-white" />
        ) : isUnlocked ? (
          <span className="text-lg">{chapter.icon}</span>
        ) : (
          <Lock className="h-4 w-4 text-ecs-gray/40" />
        )}
      </div>

      {/* Chapter info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-display uppercase tracking-wider"
            style={{ color: isUnlocked ? chapter.accentColor : 'rgba(255,255,255,0.2)' }}
          >
            Chapitre {chapter.id}
          </span>
          {isCurrent && (
            <span
              className="text-[9px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ background: `${chapter.accentColor}20`, color: chapter.accentColor }}
            >
              En cours
            </span>
          )}
        </div>
        <h4
          className={cn(
            'font-display font-bold text-sm leading-tight',
            isUnlocked ? 'text-white' : 'text-white/20',
          )}
        >
          {chapter.title}
        </h4>

        {/* Progress bar for current chapter */}
        {isCurrent && (
          <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: chapter.gradient, boxShadow: `0 0 6px ${chapter.glowColor}` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressInChapter}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            />
          </div>
        )}
      </div>

      {/* Arrow */}
      {isUnlocked && (
        <ChevronRight
          className="h-4 w-4 shrink-0 transition-colors"
          style={{ color: isSelected ? chapter.accentColor : 'rgba(255,255,255,0.2)' }}
        />
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main HeroJourney component                                         */
/* ------------------------------------------------------------------ */

export function HeroJourney() {
  const level = usePlayerStore((s) => s.level);

  const currentChapter = useMemo(
    () => CHAPTERS.find((c) => level >= c.levelMin && level <= c.levelMax) ?? CHAPTERS[0],
    [level],
  );

  const [selectedChapter, setSelectedChapter] = useState<Chapter>(currentChapter);
  const [showNarrative, setShowNarrative] = useState(true);

  const handleSelectChapter = useCallback(
    (chapter: Chapter) => {
      if (level < chapter.levelMin) return;
      setSelectedChapter(chapter);
      setShowNarrative(false);
      // Trigger re-animation
      requestAnimationFrame(() => setShowNarrative(true));
    },
    [level],
  );

  const isSelectedCurrent = selectedChapter.id === currentChapter.id;
  const selectedTitle = LEVEL_TITLES[selectedChapter.levelMin] ?? `Niveau ${selectedChapter.levelMin}`;

  // Progress to next chapter
  const nextChapter = useMemo(() => {
    const idx = CHAPTERS.findIndex((c) => c.id === currentChapter.id);
    return idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;
  }, [currentChapter]);

  const chapterProgress = useMemo(() => {
    const range = currentChapter.levelMax - currentChapter.levelMin + 1;
    const current = level - currentChapter.levelMin;
    return Math.round((current / range) * 100);
  }, [level, currentChapter]);

  return (
    <div className="relative w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{
              background: currentChapter.gradient,
              boxShadow: `0 0 16px ${currentChapter.glowColor}`,
            }}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">Ton Histoire</h2>
            <p className="text-xs text-ecs-gray font-display">
              Chapitre {currentChapter.id} : {currentChapter.title}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Chapter list — sidebar */}
        <div className="lg:col-span-2 space-y-2">
          {CHAPTERS.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              playerLevel={level}
              isSelected={selectedChapter.id === chapter.id}
              onClick={() => handleSelectChapter(chapter)}
            />
          ))}
        </div>

        {/* Selected chapter — main content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedChapter.id}
              className="relative rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${selectedChapter.accentColor}25`,
                boxShadow: `0 0 40px ${selectedChapter.glowColor}, 0 8px 32px rgba(0,0,0,0.4)`,
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              {/* Background gradient */}
              <div
                className="absolute inset-0"
                style={{ background: selectedChapter.bgGradient }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(12,12,12,0.3) 0%, rgba(12,12,12,0.95) 100%)',
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-6 space-y-5">
                {/* Chapter header */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedChapter.icon}</span>
                  <div>
                    <p
                      className="text-[10px] font-display uppercase tracking-[0.3em]"
                      style={{ color: selectedChapter.accentColor }}
                    >
                      Chapitre {selectedChapter.id} — Niveau {selectedChapter.levelMin}-{selectedChapter.levelMax}
                    </p>
                    <h3 className="font-display font-bold text-white text-2xl">
                      {selectedChapter.title}
                    </h3>
                  </div>
                </div>

                {/* Decorative line */}
                <div className="h-px" style={{ background: `${selectedChapter.accentColor}25` }} />

                {/* Narrative text */}
                <div className="min-h-[80px]">
                  {showNarrative && (
                    <CinematicText
                      text={selectedChapter.narrative}
                      isActive={isSelectedCurrent}
                    />
                  )}
                </div>

                {/* Current rank */}
                <div
                  className="flex items-center gap-3 rounded-lg p-3"
                  style={{
                    background: `${selectedChapter.accentColor}08`,
                    border: `1px solid ${selectedChapter.accentColor}15`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold"
                    style={{
                      background: selectedChapter.gradient,
                      color: 'white',
                    }}
                  >
                    {selectedChapter.levelMin}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-ecs-gray font-display">
                      Rang debut de chapitre
                    </p>
                    <p className="text-sm font-display font-bold text-white">
                      {selectedTitle}
                    </p>
                  </div>
                </div>

                {/* Progress to next chapter */}
                {isSelectedCurrent && nextChapter && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-display uppercase tracking-wider text-ecs-gray">
                        Progression vers Chapitre {nextChapter.id}
                      </span>
                      <span
                        className="text-[10px] font-display font-bold"
                        style={{ color: selectedChapter.accentColor }}
                      >
                        {chapterProgress}%
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: selectedChapter.gradient,
                          boxShadow: `0 0 10px ${selectedChapter.glowColor}`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${chapterProgress}%` }}
                        transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                      />
                    </div>
                    <p className="text-[11px] text-ecs-gray/60 font-display">
                      Prochain chapitre : &quot;{nextChapter.title}&quot; — Niveau {nextChapter.levelMin}
                    </p>
                  </div>
                )}

                {/* Completed badge for completed chapters */}
                {level > selectedChapter.levelMax && (
                  <motion.div
                    className="flex items-center gap-2 rounded-lg p-3"
                    style={{
                      background: `${selectedChapter.accentColor}10`,
                      border: `1px solid ${selectedChapter.accentColor}30`,
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <CheckCircle2 className="h-4 w-4" style={{ color: selectedChapter.accentColor }} />
                    <span className="text-xs font-display font-bold" style={{ color: selectedChapter.accentColor }}>
                      Chapitre termine
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
