'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';

/* ------------------------------------------------------------------ */
/*  Quote definitions                                                  */
/* ------------------------------------------------------------------ */

interface QuoteDefinition {
  text: string;
  dynamic: boolean;
}

const STATIC_QUOTES: QuoteDefinition[] = [
  { text: 'Le succes est la somme de petites actions repetees jour apres jour.', dynamic: false },
  { text: 'Chaque appel passe te rapproche de ton premier deal.', dynamic: false },
  { text: 'Les meilleurs closers ont commence exactement ou tu es.', dynamic: false },
  { text: 'Le meilleur moment pour commencer, c\'etait hier. Le deuxieme meilleur moment, c\'est maintenant.', dynamic: false },
  { text: 'Un pas de plus que les autres, chaque jour. C\'est ca le secret.', dynamic: false },
  { text: 'La discipline bat le talent quand le talent n\'est pas discipline.', dynamic: false },
  { text: 'Chaque "non" te rapproche d\'un "oui".', dynamic: false },
  { text: 'Tu n\'as pas besoin d\'etre parfait. Tu as besoin d\'etre constant.', dynamic: false },
  { text: 'Les gens qui reussissent ont simplement fait ce que les autres n\'ont pas voulu faire.', dynamic: false },
  { text: 'Le business est un marathon, pas un sprint. Mais chaque jour compte.', dynamic: false },
  { text: 'La confiance se construit action apres action.', dynamic: false },
  { text: 'Ton futur toi te remerciera d\'avoir agi aujourd\'hui.', dynamic: false },
  { text: 'Le secret du succes ? Ne jamais s\'arreter d\'apprendre.', dynamic: false },
  { text: 'Chaque jour ou tu progresses, tu depasses 90% des gens qui n\'essaient meme pas.', dynamic: false },
  { text: 'Le courage n\'est pas l\'absence de peur, c\'est d\'agir malgre elle.', dynamic: false },
  { text: 'Un entrepreneur qui echoue apprend plus qu\'un salarie qui stagne.', dynamic: false },
  { text: 'Ta valeur augmente avec chaque competence maitrisee.', dynamic: false },
  { text: 'Les deals se ferment quand la confiance est au maximum. Continue de la construire.', dynamic: false },
  { text: 'Ceux qui gagnent ne sont pas ceux qui abandonnent.', dynamic: false },
  { text: 'Plus tu sors de ta zone de confort, plus ta zone de confort s\'agrandit.', dynamic: false },
  { text: 'Ne compare pas ton chapitre 1 au chapitre 20 de quelqu\'un d\'autre.', dynamic: false },
  { text: 'L\'action imparfaite vaut mieux que l\'inaction parfaite.', dynamic: false },
  { text: 'Chaque relation business est une graine. Continue d\'arroser.', dynamic: false },
  { text: 'La regularite est plus puissante que l\'intensite.', dynamic: false },
  { text: 'Tu es a un coup de fil du deal qui change tout.', dynamic: false },
  { text: 'Les obstacles sont des tests. Chaque obstacle franchi te rend plus fort.', dynamic: false },
  { text: 'Investis dans tes competences. C\'est le seul actif qu\'on ne peut pas te prendre.', dynamic: false },
  { text: 'Le networking n\'est pas du hasard. C\'est une strategie.', dynamic: false },
  { text: 'Concentre-toi sur le processus. Les resultats suivront.', dynamic: false },
  { text: 'Les opportunites se multiplient quand on les saisit.', dynamic: false },
];

const DYNAMIC_TEMPLATES: QuoteDefinition[] = [
  { text: 'Ta streak de {streak} jours prouve que tu es serieux.', dynamic: true },
  { text: 'Tu es au niveau {level} — continue comme ca et rien ne t\'arretera.', dynamic: true },
  { text: 'Avec {totalXP} XP accumules, tu as deja accompli plus que la plupart.', dynamic: true },
  { text: '{streak} jours sans lacher. C\'est ca la mentalite d\'un winner.', dynamic: true },
  { text: 'Niveau {level} ! Tu grimpes vite. La prochaine etape t\'attend.', dynamic: true },
];

/* ------------------------------------------------------------------ */
/*  Seeded random for daily consistency                                */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface MotivationalQuoteProps {
  autoCycle?: boolean;
  className?: string;
}

export function MotivationalQuote({ autoCycle = false, className }: MotivationalQuoteProps) {
  const level = usePlayerStore((s) => s.level);
  const totalXP = usePlayerStore((s) => s.totalXP);
  const currentStreak = usePlayerStore((s) => s.currentStreak);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const cycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Build the full quote pool with dynamic interpolation */
  const allQuotes = useCallback((): string[] => {
    const pool: string[] = STATIC_QUOTES.map((q) => q.text);

    /* Only include dynamic quotes when stats are meaningful */
    if (currentStreak >= 2) {
      DYNAMIC_TEMPLATES.filter((q) => q.text.includes('{streak}')).forEach((q) => {
        pool.push(
          q.text
            .replace('{streak}', String(currentStreak))
            .replace('{level}', String(level))
            .replace('{totalXP}', String(totalXP))
        );
      });
    }

    if (level >= 2) {
      DYNAMIC_TEMPLATES.filter((q) => q.text.includes('{level}') && !q.text.includes('{streak}')).forEach((q) => {
        pool.push(q.text.replace('{level}', String(level)).replace('{totalXP}', String(totalXP)));
      });
    }

    if (totalXP >= 50) {
      DYNAMIC_TEMPLATES.filter((q) => q.text.includes('{totalXP}') && !q.text.includes('{streak}') && !q.text.includes('{level}')).forEach((q) => {
        pool.push(q.text.replace('{totalXP}', String(totalXP)));
      });
    }

    return pool;
  }, [currentStreak, level, totalXP]);

  /* Select initial quote seeded by date */
  useEffect(() => {
    const pool = allQuotes();
    const seed = getDailySeed();
    const index = Math.floor(seededRandom(seed) * pool.length);
    setQuoteIndex(index);
  }, [allQuotes]);

  /* Auto-cycle every 30s if enabled */
  useEffect(() => {
    if (!autoCycle) return;

    cycleTimerRef.current = setInterval(() => {
      setQuoteIndex((prev) => {
        const pool = allQuotes();
        return (prev + 1) % pool.length;
      });
    }, 30000);

    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, [autoCycle, allQuotes]);

  const pool = allQuotes();
  const safeIndex = quoteIndex % Math.max(pool.length, 1);
  const currentQuote = pool[safeIndex] ?? STATIC_QUOTES[0].text;

  return (
    <div
      className={cn('rounded-xl p-5 relative overflow-hidden', className)}
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(12,12,12,0.9) 100%)',
        border: '1px solid rgba(255,191,0,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Decorative quotation mark */}
      <div className="absolute top-3 left-4 pointer-events-none">
        <Quote
          className="h-8 w-8 text-ecs-amber/10"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* Quote text */}
      <div className="relative z-10 pl-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={safeIndex}
            className="text-sm text-ecs-gray font-body leading-relaxed italic"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            &laquo; {currentQuote} &raquo;
          </motion.p>
        </AnimatePresence>

        {/* Attribution line */}
        <p className="mt-2 text-[10px] font-display uppercase tracking-[0.2em] text-ecs-amber/50">
          ECHO Coach
        </p>
      </div>

      {/* Subtle amber accent line at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,191,0,0.15), transparent)',
        }}
      />
    </div>
  );
}
