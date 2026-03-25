'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Mascot } from '@/components/game/Mascot';

/* ------------------------------------------------------------------ */
/*  Tutorial step definitions                                          */
/* ------------------------------------------------------------------ */

interface TutorialStep {
  targetSelector: string;
  title: string;
  description: string;
  echoMessage: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetSelector: '[data-tutorial="dashboard"]',
    title: 'Ton QG Business',
    description: 'Voici ton Dashboard — ton QG de guerrier business. Tout commence ici.',
    echoMessage: 'Bienvenue ! Je vais te guider pas a pas.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tutorial="xp-bar"]',
    title: 'Barre d\'XP',
    description: 'Ta barre d\'XP — chaque action te rapproche du level up !',
    echoMessage: 'Plus tu agis, plus tu montes en niveau !',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tutorial="quests"]',
    title: 'Quetes du Jour',
    description: 'Les quetes du jour — tes missions quotidiennes pour gagner de l\'XP bonus.',
    echoMessage: 'Complete-les chaque jour pour des bonus massifs !',
    position: 'top',
  },
  {
    targetSelector: '[data-tutorial="leaderboard"]',
    title: 'Classement',
    description: 'Le classement — bats tes concurrents et grimpe au sommet !',
    echoMessage: 'La competition rend plus fort !',
    position: 'right',
  },
  {
    targetSelector: '[data-tutorial="quick-action"]',
    title: 'Logger du XP',
    description: 'Enregistre chaque action business — appels, rendez-vous, deals. Tout compte !',
    echoMessage: 'C\'est la cle de ta progression quotidienne !',
    position: 'bottom',
  },
];

const STORAGE_KEY = 'ecs-tutorial-completed';

/* ------------------------------------------------------------------ */
/*  Spotlight overlay with cutout                                      */
/* ------------------------------------------------------------------ */

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function SpotlightOverlay({ rect }: { rect: SpotlightRect }) {
  const padding = 8;
  const borderRadius = 12;
  const x = rect.left - padding;
  const y = rect.top - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;

  return (
    <motion.svg
      className="fixed inset-0 z-[998] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <defs>
        <mask id="tutorial-spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <motion.rect
            fill="black"
            rx={borderRadius}
            ry={borderRadius}
            initial={{ x, y, width: w, height: h, opacity: 0 }}
            animate={{ x, y, width: w, height: h, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.75)"
        mask="url(#tutorial-spotlight-mask)"
      />
      {/* Amber glow ring around cutout */}
      <motion.rect
        x={x - 2}
        y={y - 2}
        width={w + 4}
        height={h + 4}
        rx={borderRadius + 2}
        ry={borderRadius + 2}
        fill="none"
        stroke="rgba(255, 191, 0, 0.4)"
        strokeWidth="2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tooltip positioned near the spotlight target                       */
/* ------------------------------------------------------------------ */

interface TooltipProps {
  step: TutorialStep;
  rect: SpotlightRect;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

function TutorialTooltip({ step, rect, currentStep, totalSteps, onNext, onSkip }: TooltipProps) {
  const getTooltipPosition = (): { top: number; left: number } => {
    const gap = 16;

    switch (step.position) {
      case 'bottom':
        return {
          top: rect.top + rect.height + gap,
          left: Math.max(16, rect.left + rect.width / 2 - 160),
        };
      case 'top':
        return {
          top: rect.top - gap - 220,
          left: Math.max(16, rect.left + rect.width / 2 - 160),
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2 - 80,
          left: Math.max(16, rect.left - 340),
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2 - 80,
          left: rect.left + rect.width + gap,
        };
    }
  };

  const pos = getTooltipPosition();
  const isLast = currentStep === totalSteps - 1;

  return (
    <motion.div
      className="fixed z-[999] w-[320px]"
      style={{ top: pos.top, left: pos.left }}
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div
        className="rounded-xl p-5 space-y-4"
        style={{
          background: 'linear-gradient(180deg, rgba(26,26,26,0.97) 0%, rgba(12,12,12,0.99) 100%)',
          border: '1px solid rgba(255,191,0,0.25)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 24px rgba(255,191,0,0.1)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* ECHO mascot + speech */}
        <div className="flex items-start gap-3">
          <Mascot mood="excited" size="sm" />
          <div
            className="flex-1 rounded-lg px-3 py-2 text-xs text-ecs-gray font-body leading-relaxed"
            style={{
              background: 'rgba(255,191,0,0.05)',
              border: '1px solid rgba(255,191,0,0.1)',
            }}
          >
            {step.echoMessage}
          </div>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="font-display font-bold text-white text-base">
            {step.title}
          </h3>
          <p className="text-sm text-ecs-gray mt-1 font-body leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <motion.div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === currentStep
                  ? 'w-6 bg-ecs-amber'
                  : i < currentStep
                    ? 'w-1.5 bg-ecs-amber/50'
                    : 'w-1.5 bg-ecs-gray-dark'
              )}
              layout
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-xs text-ecs-gray hover:text-white transition-colors font-display uppercase tracking-wider"
          >
            Passer
          </button>
          <motion.button
            onClick={onNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider text-ecs-black"
            style={{
              background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
              boxShadow: '0 0 12px rgba(255,191,0,0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLast ? 'Terminer' : 'Suivant'}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main GuidedTutorial component                                      */
/* ------------------------------------------------------------------ */

export function GuidedTutorial() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<SpotlightRect | null>(null);
  const resizeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Check if tutorial should show */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed) return;

    const timer = setTimeout(() => {
      setIsActive(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  /* Measure target element */
  const measureTarget = useCallback(() => {
    if (!isActive) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      /* If element not found, use a centered fallback */
      setTargetRect({
        top: window.innerHeight / 2 - 40,
        left: window.innerWidth / 2 - 120,
        width: 240,
        height: 80,
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    /* Scroll element into view if needed */
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [isActive, currentStep]);

  useEffect(() => {
    measureTarget();
  }, [measureTarget]);

  /* Re-measure on resize */
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      if (resizeRef.current) clearTimeout(resizeRef.current);
      resizeRef.current = setTimeout(measureTarget, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeRef.current) clearTimeout(resizeRef.current);
    };
  }, [isActive, measureTarget]);

  /* Handle next step */
  const handleNext = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsActive(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, '1');
      }
    }
  }, [currentStep]);

  /* Handle skip */
  const handleSkip = useCallback(() => {
    setIsActive(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1');
    }
  }, []);

  /* Block clicks on the overlay */
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isActive || !targetRect) return null;

  const step = TUTORIAL_STEPS[currentStep];
  if (!step) return null;

  return (
    <AnimatePresence mode="wait">
      <div
        key={`tutorial-step-${currentStep}`}
        className="fixed inset-0 z-[997]"
        onClick={handleOverlayClick}
      >
        {/* Dark overlay with spotlight cutout */}
        <SpotlightOverlay rect={targetRect} />

        {/* Tooltip */}
        <TutorialTooltip
          step={step}
          rect={targetRect}
          currentStep={currentStep}
          totalSteps={TUTORIAL_STEPS.length}
          onNext={handleNext}
          onSkip={handleSkip}
        />

        {/* Skip button in corner */}
        <motion.button
          className="fixed top-4 right-4 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display text-ecs-gray hover:text-white transition-colors"
          style={{
            background: 'rgba(26,26,26,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onClick={handleSkip}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <X className="h-3 w-3" />
          Quitter le tutoriel
        </motion.button>
      </div>
    </AnimatePresence>
  );
}
