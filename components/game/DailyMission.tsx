'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Zap, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import { cn, formatXP } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';

/* ------------------------------------------------------------------ */
/*  Mission definitions by tier                                        */
/* ------------------------------------------------------------------ */

interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  echoMessage: string;
}

interface MissionTier {
  levelMin: number;
  levelMax: number;
  label: string;
  missions: MissionTemplate[];
}

const MISSION_TIERS: MissionTier[] = [
  {
    levelMin: 1,
    levelMax: 3,
    label: 'Debutant',
    missions: [
      {
        id: 'beginner-1',
        title: 'Passe ton premier appel de prospection',
        description: 'Decroche le telephone et contacte un prospect. Le premier pas est toujours le plus dur.',
        xpReward: 50,
        echoMessage: 'Si tu fais ca chaque jour pendant 30 jours, tu seras inarretable.',
      },
      {
        id: 'beginner-2',
        title: 'Envoie 5 messages de prospection',
        description: 'LinkedIn, email ou DM — peu importe le canal, l\'important c\'est l\'action.',
        xpReward: 40,
        echoMessage: 'Chaque message est une graine plantee. Continue a semer.',
      },
      {
        id: 'beginner-3',
        title: 'Complete une formation aujourd\'hui',
        description: 'Investis dans tes competences. Le savoir est ton arme la plus puissante.',
        xpReward: 30,
        echoMessage: 'Apprendre chaque jour, c\'est la marque des champions.',
      },
    ],
  },
  {
    levelMin: 4,
    levelMax: 6,
    label: 'Intermediaire',
    missions: [
      {
        id: 'inter-1',
        title: 'Close 1 deal aujourd\'hui',
        description: 'Transforme un prospect en client. C\'est la que la magie opere.',
        xpReward: 100,
        echoMessage: 'Un deal par jour, c\'est 30 deals par mois. Imagine le chiffre.',
      },
      {
        id: 'inter-2',
        title: 'Genere 3 leads qualifies',
        description: 'Trouve 3 personnes qui ont un vrai besoin et un vrai budget.',
        xpReward: 80,
        echoMessage: 'Les leads qualifies sont de l\'or. Tu construis ta mine.',
      },
      {
        id: 'inter-3',
        title: 'Fais un follow-up sur tous tes prospects en attente',
        description: 'La fortune est dans le suivi. Ne laisse personne t\'oublier.',
        xpReward: 60,
        echoMessage: 'Le follow-up separe les amateurs des pros. Tu es un pro.',
      },
    ],
  },
  {
    levelMin: 7,
    levelMax: 9,
    label: 'Avance',
    missions: [
      {
        id: 'advanced-1',
        title: 'Genere 5 leads qualifies',
        description: 'Ton pipeline doit deborder. 5 leads qualifies minimum.',
        xpReward: 120,
        echoMessage: 'A ce rythme, tu seras dans le top 10 en quelques semaines.',
      },
      {
        id: 'advanced-2',
        title: 'Close 2 deals et depasse ton record',
        description: 'Pousse tes limites. Deux closes dans la meme journee.',
        xpReward: 150,
        echoMessage: 'Les sommets sont reserves a ceux qui osent. Tu oses.',
      },
      {
        id: 'advanced-3',
        title: 'Aide un membre debutant a progresser',
        description: 'Le mentorat multiplie ta valeur. Partage tes connaissances.',
        xpReward: 80,
        echoMessage: 'Les leaders creent d\'autres leaders. C\'est ton moment.',
      },
    ],
  },
  {
    levelMin: 10,
    levelMax: 12,
    label: 'Expert',
    missions: [
      {
        id: 'expert-1',
        title: 'Genere 10 leads et close 3 deals',
        description: 'Une journee de machine. Montre pourquoi tu es au sommet.',
        xpReward: 200,
        echoMessage: 'Tu joues dans la cour des grands. Continue.',
      },
      {
        id: 'expert-2',
        title: 'Cree un systeme de referral automatise',
        description: 'Fais travailler ton reseau pour toi. L\'empire se construit avec des systemes.',
        xpReward: 180,
        echoMessage: 'Les systemes generent de la richesse pendant que tu dors.',
      },
    ],
  },
  {
    levelMin: 13,
    levelMax: 15,
    label: 'Legende',
    missions: [
      {
        id: 'legend-1',
        title: 'Bats le record de la communaute aujourd\'hui',
        description: 'Tu es une legende. Prouve-le avec des chiffres historiques.',
        xpReward: 300,
        echoMessage: 'L\'histoire se souviendra de ce jour. Fais-le compter.',
      },
      {
        id: 'legend-2',
        title: 'Mentorise 3 joueurs et aide-les a level up',
        description: 'Ton heritage, c\'est les leaders que tu crees.',
        xpReward: 250,
        echoMessage: 'Les vraies legendes elevent les autres. Tu es cette legende.',
      },
    ],
  },
];

const STORAGE_KEY = 'ecs-daily-mission';

/* ------------------------------------------------------------------ */
/*  Confetti burst for completion                                      */
/* ------------------------------------------------------------------ */

interface ConfettiDot {
  angle: number;
  distance: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function Fireworks() {
  const particles: ConfettiDot[] = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        angle: (i / 24) * 360 + (Math.random() - 0.5) * 20,
        distance: 60 + Math.random() * 80,
        size: 3 + Math.random() * 4,
        color: ['#FFBF00', '#FF9D00', '#FFD700', '#FFA500', '#FFFFFF'][i % 5],
        duration: 1 + Math.random() * 0.5,
        delay: Math.random() * 0.3,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((p, i) => {
        const endX = Math.cos((p.angle * Math.PI) / 180) * p.distance;
        const endY = Math.sin((p.angle * Math.PI) / 180) * p.distance;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              top: '50%',
              left: '50%',
              boxShadow: `0 0 4px ${p.color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: endX, y: endY, opacity: 0, scale: 0.2 }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Countdown timer                                                    */
/* ------------------------------------------------------------------ */

function DayTimer() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5 text-ecs-gray" />
      <span className="text-xs font-display font-bold text-ecs-gray tabular-nums">{timeLeft}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ECHO mascot pep talk                                               */
/* ------------------------------------------------------------------ */

function EchoPepTalk({ message }: { message: string }) {
  return (
    <motion.div
      className="flex items-start gap-3 rounded-lg p-3"
      style={{
        background: 'rgba(255, 191, 0, 0.05)',
        border: '1px solid rgba(255, 191, 0, 0.12)',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* ECHO mini avatar */}
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(12,12,12,0.98))',
          border: '1px solid rgba(255,191,0,0.25)',
        }}
      >
        <span className="text-[10px] font-display font-bold text-ecs-amber">E</span>
      </div>
      <div>
        <p className="text-[10px] font-display uppercase tracking-wider text-ecs-amber/60 mb-0.5">
          ECHO
        </p>
        <p className="text-xs text-white/70 font-body leading-relaxed italic">
          &quot;{message}&quot;
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main DailyMission component                                        */
/* ------------------------------------------------------------------ */

interface StoredMission {
  missionId: string;
  date: string;
  accepted: boolean;
  completed: boolean;
}

export function DailyMission() {
  const level = usePlayerStore((s) => s.level);
  const [missionState, setMissionState] = useState<StoredMission | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Pick today's mission
  const todaysMission = useMemo(() => {
    const tier = MISSION_TIERS.find((t) => level >= t.levelMin && level <= t.levelMax)
      ?? MISSION_TIERS[0];
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    );
    const index = dayOfYear % tier.missions.length;
    return tier.missions[index];
  }, [level]);

  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredMission;
        if (parsed.date === todayKey) {
          setMissionState(parsed);
        }
      }
    } catch {
      // Use fresh state
    }
    setIsLoaded(true);
  }, [todayKey]);

  // Save to localStorage
  const saveMission = useCallback(
    (state: StoredMission) => {
      setMissionState(state);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Silently fail
      }
    },
    [],
  );

  const handleAccept = useCallback(() => {
    saveMission({
      missionId: todaysMission.id,
      date: todayKey,
      accepted: true,
      completed: false,
    });
  }, [todaysMission, todayKey, saveMission]);

  const handleComplete = useCallback(() => {
    saveMission({
      missionId: todaysMission.id,
      date: todayKey,
      accepted: true,
      completed: true,
    });
  }, [todaysMission, todayKey, saveMission]);

  const isAccepted = missionState?.accepted === true;
  const isCompleted = missionState?.completed === true;

  if (!isLoaded) return null;

  return (
    <div className="relative w-full">
      {/* Completed state */}
      <AnimatePresence mode="wait">
        {isCompleted ? (
          <motion.div
            key="completed"
            className="relative rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(12, 12, 12, 0.95) 100%)',
              border: '1px solid rgba(255, 191, 0, 0.3)',
              boxShadow: '0 0 40px rgba(255, 191, 0, 0.1), 0 8px 32px rgba(0,0,0,0.4)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Fireworks />

            <div className="relative z-10 p-6 text-center space-y-4">
              {/* Celebration icon */}
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                  boxShadow: '0 0 30px rgba(255, 191, 0, 0.4)',
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              >
                <CheckCircle className="h-8 w-8 text-ecs-black" />
              </motion.div>

              <motion.h3
                className="font-display font-bold text-2xl text-gradient-amber uppercase tracking-wider"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ textShadow: '0 0 20px rgba(255, 191, 0, 0.3)' }}
              >
                Mission Accomplie
              </motion.h3>

              <motion.p
                className="text-sm text-ecs-gray font-display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                +{formatXP(todaysMission.xpReward)} XP gagnes
              </motion.p>

              <motion.p
                className="text-xs text-ecs-gray/60 font-body"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Reviens demain pour une nouvelle mission
              </motion.p>
            </div>

            {/* Shimmer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              <div
                className="absolute inset-0 animate-shimmer-sweep"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,191,0,0.06) 50%, transparent 100%)',
                  width: '50%',
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mission"
            className="relative rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.9) 0%, rgba(12, 12, 12, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Amber accent top */}
            <div
              className="h-1 w-full"
              style={{ background: 'linear-gradient(90deg, #FFBF00, #FF9D00, #FFBF00)' }}
            />

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,191,0,0.15), rgba(255,157,0,0.08))',
                      border: '1px solid rgba(255,191,0,0.25)',
                    }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Target className="h-5 w-5 text-ecs-amber" />
                  </motion.div>
                  <div>
                    <h2 className="font-display font-bold text-gradient-amber text-sm uppercase tracking-[0.15em]">
                      Mission du Jour
                    </h2>
                    <DayTimer />
                  </div>
                </div>

                {/* XP reward badge */}
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,191,0,0.15), rgba(255,157,0,0.08))',
                    border: '1px solid rgba(255,191,0,0.25)',
                    boxShadow: '0 0 12px rgba(255,191,0,0.1)',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Zap className="h-3.5 w-3.5 text-ecs-amber" />
                  <span className="text-xs font-display font-bold text-ecs-amber">
                    +{formatXP(todaysMission.xpReward)} XP
                  </span>
                </motion.div>
              </div>

              {/* Mission briefing */}
              <div className="space-y-3">
                <motion.h3
                  className="font-display font-bold text-white text-xl leading-tight"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {todaysMission.title}
                </motion.h3>
                <motion.p
                  className="text-sm text-ecs-gray leading-relaxed font-body"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {todaysMission.description}
                </motion.p>
              </div>

              {/* ECHO pep talk */}
              <EchoPepTalk message={todaysMission.echoMessage} />

              {/* Action buttons */}
              {!isAccepted ? (
                <motion.button
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg',
                    'font-display font-bold text-sm uppercase tracking-wider',
                    'text-ecs-black relative overflow-hidden group',
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                    boxShadow: '0 0 20px rgba(255, 191, 0, 0.2), 0 4px 16px rgba(0,0,0,0.3)',
                  }}
                  onClick={handleAccept}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255, 191, 0, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  type="button"
                >
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <Sparkles className="h-4 w-4" />
                  Accepter la mission
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              ) : (
                <div className="space-y-3">
                  {/* Accepted state */}
                  <div
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider"
                    style={{
                      background: 'rgba(255, 191, 0, 0.08)',
                      border: '1px solid rgba(255, 191, 0, 0.2)',
                      color: '#FFBF00',
                    }}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Mission acceptee — En cours
                  </div>

                  {/* Complete button */}
                  <motion.button
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg',
                      'font-display font-bold text-sm uppercase tracking-wider',
                      'text-ecs-black relative overflow-hidden group',
                    )}
                    style={{
                      background: 'linear-gradient(135deg, #FFBF00, #FF9D00)',
                      boxShadow: '0 0 20px rgba(255, 191, 0, 0.2)',
                    }}
                    onClick={handleComplete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                  >
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <CheckCircle className="h-4 w-4" />
                    Mission accomplie
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
