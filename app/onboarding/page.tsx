'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const AVATAR_OPTIONS = [
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.png',
  '/avatars/avatar-5.png',
  '/avatars/avatar-6.png',
  '/avatars/avatar-7.png',
  '/avatars/avatar-8.png',
];

const TOTAL_STEPS = 4;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.96,
  }),
};

// Confetti particle component for the final step
function ConfettiParticles() {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      delay: number;
      duration: number;
      color: string;
      size: number;
      rotation: number;
    }>
  >([]);

  useEffect(() => {
    const colors = ['#FFBF00', '#FF9D00', '#FFD700', '#FFA500', '#FFFFFF'];
    const generated = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 720,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -10,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: 600,
            opacity: 0,
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

// Staggered text reveal component
function TextReveal({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.12,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = useCallback(() => {
    if (step === 0 && !displayName.trim()) {
      setError('Veuillez entrer votre nom.');
      return;
    }
    setError(null);
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }, [step, displayName]);

  const handleBack = useCallback(() => {
    setError(null);
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  async function handleComplete() {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const updatePayload: Record<string, unknown> = {
        full_name: displayName.trim(),
        onboarding_completed: true,
      };

      if (selectedAvatar) {
        updatePayload.avatar_url = selectedAvatar;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.push('/dashboard');
    } catch {
      setError('Erreur lors de la sauvegarde. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  const glassCardStyle = {
    background:
      'linear-gradient(135deg, rgba(26,26,26,0.8) 0%, rgba(20,20,20,0.9) 100%)',
    boxShadow:
      '0 0 0 1px rgba(255,191,0,0.03), 0 20px 60px -10px rgba(0,0,0,0.5), 0 0 40px rgba(255,191,0,0.02)',
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" custom={direction}>
        {/* Step 0: Welcome — "Bienvenue, Guerrier" */}
        {step === 0 && (
          <motion.div
            key="step-0"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative rounded-2xl border border-white/[0.06] p-8 backdrop-blur-xl overflow-hidden text-center"
            style={glassCardStyle}
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-ecs-amber/[0.03] rounded-full blur-3xl pointer-events-none" />

            {/* Warrior icon with pulse glow */}
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,191,0,0.15) 0%, rgba(255,157,0,0.08) 100%)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(255,191,0,0.2)',
                    '0 0 30px rgba(255,191,0,0.4)',
                    '0 0 10px rgba(255,191,0,0.2)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full h-full rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-10 h-10 text-ecs-amber"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Dramatic text reveal */}
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              <TextReveal text="Bienvenue, Guerrier" delay={0.3} />
            </h2>
            <motion.p
              className="text-ecs-gray text-sm mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Gamifiez votre activit&eacute; commerciale, gagnez de l&apos;XP et
              dominez le classement.
            </motion.p>

            <motion.div
              className="text-left mb-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <label className="block text-sm font-medium text-ecs-gray mb-1.5">
                Comment souhaitez-vous &ecirc;tre appel&eacute; ?
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Votre nom ou pseudo"
                className="w-full px-4 py-3 rounded-lg bg-ecs-black/60 border border-white/[0.06]
                           text-white placeholder:text-ecs-gray/40 outline-none
                           focus:border-ecs-amber/50 focus:shadow-[0_0_0_3px_rgba(255,191,0,0.1),0_0_20px_rgba(255,191,0,0.05)]
                           transition-all duration-300"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm mb-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleNext}
              className="w-full px-6 py-3.5 rounded-lg font-display font-bold uppercase tracking-wider text-ecs-black
                         bg-gradient-to-r from-ecs-amber to-ecs-orange transition-all duration-300"
              whileHover={{
                scale: 1.02,
                boxShadow: '0 0 30px rgba(255,191,0,0.3)',
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Continuer
            </motion.button>
          </motion.div>
        )}

        {/* Step 1: Avatar selection */}
        {step === 1 && (
          <motion.div
            key="step-1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative rounded-2xl border border-white/[0.06] p-8 backdrop-blur-xl overflow-hidden text-center"
            style={glassCardStyle}
          >
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ecs-orange/[0.03] rounded-full blur-3xl pointer-events-none" />

            <motion.h2
              className="font-display text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Choisissez votre avatar
            </motion.h2>
            <motion.p
              className="text-ecs-gray text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              S&eacute;lectionnez un avatar pour repr&eacute;senter votre
              profil.
            </motion.p>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATAR_OPTIONS.map((avatar, i) => (
                <motion.button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.1 + i * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: '0 0 20px rgba(255,191,0,0.25)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative w-full aspect-square rounded-xl border-2 overflow-hidden bg-ecs-black/40 flex items-center justify-center transition-all duration-300',
                    selectedAvatar === avatar
                      ? 'border-ecs-amber shadow-[0_0_20px_rgba(255,191,0,0.2)]'
                      : 'border-white/[0.06] hover:border-ecs-amber/30'
                  )}
                >
                  {/* Selected glow ring */}
                  {selectedAvatar === avatar && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      layoutId="avatar-glow"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,191,0,0.1) 0%, transparent 70%)',
                      }}
                    />
                  )}
                  <div className="w-full h-full bg-ecs-gray-dark/30 flex items-center justify-center">
                    <span
                      className={cn(
                        'text-2xl font-display font-bold transition-colors duration-300',
                        selectedAvatar === avatar
                          ? 'text-ecs-amber'
                          : 'text-ecs-gray/60'
                      )}
                    >
                      {avatar.split('-').pop()?.replace('.png', '')}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="text-xs text-ecs-gray/50 mb-6">
              Vous pourrez modifier votre avatar plus tard.
            </p>

            <div className="flex gap-3">
              <motion.button
                onClick={handleBack}
                className="flex-1 px-6 py-3.5 rounded-lg font-display uppercase tracking-wider text-white/70
                           border border-white/[0.08] transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.03]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Retour
              </motion.button>
              <motion.button
                onClick={handleNext}
                className="flex-1 px-6 py-3.5 rounded-lg font-display font-bold uppercase tracking-wider text-ecs-black
                           bg-gradient-to-r from-ecs-amber to-ecs-orange transition-all duration-300"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 30px rgba(255,191,0,0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Continuer
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: First quest preview */}
        {step === 2 && (
          <motion.div
            key="step-2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative rounded-2xl border border-white/[0.06] p-8 backdrop-blur-xl overflow-hidden text-center"
            style={glassCardStyle}
          >
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-ecs-amber/[0.03] rounded-full blur-3xl pointer-events-none" />

            <motion.h2
              className="font-display text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Votre premi&egrave;re qu&ecirc;te
            </motion.h2>
            <motion.p
              className="text-ecs-gray text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Voici un aper&ccedil;u de ce qui vous attend.
            </motion.p>

            {/* Quest card with entrance animation */}
            <motion.div
              className="rounded-xl border border-ecs-amber/20 p-5 mb-6 text-left overflow-hidden relative"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,191,0,0.06) 0%, rgba(255,157,0,0.02) 100%)',
              }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              {/* Shimmer effect across card */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,191,0,0.06) 50%, transparent 60%)',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ delay: 0.8, duration: 1.5, ease: 'easeInOut' }}
              />

              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                  Quotidienne
                </span>
                <span className="font-display font-bold text-ecs-amber text-sm">
                  +50 XP
                </span>
              </div>
              <h3 className="font-display font-bold text-white mb-1 text-lg">
                Premier pas
              </h3>
              <p className="text-sm text-ecs-gray mb-3">
                Compl&eacute;tez votre premier objectif quotidien pour commencer
                votre aventure.
              </p>
              <div className="h-2.5 rounded-full bg-ecs-gray-dark/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-ecs-amber to-ecs-orange"
                  initial={{ width: '0%' }}
                  animate={{ width: '0%' }}
                />
              </div>
              <p className="text-xs text-ecs-gray/60 mt-1.5">
                0/1 &mdash; Pr&ecirc;t &agrave; commencer
              </p>
            </motion.div>

            {/* Feature list with staggered animation */}
            <div className="space-y-3 text-left mb-6">
              {[
                "Gagnez de l'XP en complétant des quêtes",
                'Montez en niveau et débloquez des badges',
                'Dominez le classement de votre organisation',
              ].map((text, i) => (
                <motion.div
                  key={text}
                  className="flex items-center gap-3 text-sm text-ecs-gray"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,191,0,0.12) 0%, rgba(255,157,0,0.06) 100%)',
                    }}
                  >
                    <span className="text-ecs-amber font-display font-bold text-xs">
                      {i + 1}
                    </span>
                  </div>
                  {text}
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={handleBack}
                className="flex-1 px-6 py-3.5 rounded-lg font-display uppercase tracking-wider text-white/70
                           border border-white/[0.08] transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.03]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Retour
              </motion.button>
              <motion.button
                onClick={handleNext}
                className="flex-1 px-6 py-3.5 rounded-lg font-display font-bold uppercase tracking-wider text-ecs-black
                           bg-gradient-to-r from-ecs-amber to-ecs-orange transition-all duration-300"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 30px rgba(255,191,0,0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Continuer
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Ready — "C'est parti!" */}
        {step === 3 && (
          <motion.div
            key="step-3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative rounded-2xl border border-white/[0.06] p-8 backdrop-blur-xl overflow-hidden text-center"
            style={glassCardStyle}
          >
            <ConfettiParticles />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-ecs-amber/[0.04] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ecs-orange/[0.03] rounded-full blur-3xl pointer-events-none" />

            {/* Explosion ring effect */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full border border-ecs-amber/30"
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute w-24 h-24 rounded-full border border-ecs-orange/20"
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 5, opacity: 0 }}
                transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
              />
            </motion.div>

            <div className="relative mb-6">
              {/* Rocket icon with glow */}
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,191,0,0.2) 0%, rgba(255,157,0,0.1) 100%)',
                }}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 12,
                  delay: 0.2,
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(255,191,0,0.3)',
                      '0 0 40px rgba(255,191,0,0.5)',
                      '0 0 15px rgba(255,191,0,0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-full h-full rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-12 h-12 text-ecs-amber"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    />
                  </svg>
                </motion.div>
              </motion.div>

              <h2 className="font-display text-3xl font-bold mb-3">
                <TextReveal
                  text="C'est parti !"
                  className="bg-gradient-to-r from-ecs-amber via-ecs-orange to-ecs-amber bg-clip-text text-transparent"
                  delay={0.3}
                />
              </h2>
              <motion.p
                className="text-ecs-gray text-sm mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Tout est pr&ecirc;t,{' '}
                <span className="text-ecs-amber font-medium animate-text-glow">
                  {displayName}
                </span>
                .
              </motion.p>
              <motion.p
                className="text-ecs-gray text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Votre aventure commence maintenant. Bonne chance !
              </motion.p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm mb-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              className="relative flex gap-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <motion.button
                onClick={handleBack}
                className="flex-1 px-6 py-3.5 rounded-lg font-display uppercase tracking-wider text-white/70
                           border border-white/[0.08] transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.03]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Retour
              </motion.button>
              <motion.button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 px-6 py-3.5 rounded-lg font-display font-bold uppercase tracking-wider text-ecs-black
                           bg-gradient-to-r from-ecs-amber to-ecs-orange
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 30px rgba(255,191,0,0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Chargement...' : 'Entrer dans le jeu'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step indicators — glowing dots with animated progress line */}
      <div className="relative flex items-center justify-center mt-10">
        {/* Background line */}
        <div className="absolute h-[2px] bg-white/[0.04] rounded-full" style={{ width: `${(TOTAL_STEPS - 1) * 40}px` }} />

        {/* Animated progress line */}
        <motion.div
          className="absolute left-1/2 h-[2px] rounded-full bg-gradient-to-r from-ecs-amber to-ecs-orange origin-left"
          style={{
            width: `${(TOTAL_STEPS - 1) * 40}px`,
            x: `-${((TOTAL_STEPS - 1) * 40) / 2}px`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: step / (TOTAL_STEPS - 1) }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        />

        {/* Dot indicators */}
        <div className="relative flex items-center" style={{ gap: `${40 - 12}px` }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'relative w-3 h-3 rounded-full transition-colors duration-300',
                i <= step ? 'bg-ecs-amber' : 'bg-white/[0.08]'
              )}
              animate={
                i === step
                  ? {
                      boxShadow: [
                        '0 0 6px rgba(255,191,0,0.3)',
                        '0 0 14px rgba(255,191,0,0.5)',
                        '0 0 6px rgba(255,191,0,0.3)',
                      ],
                    }
                  : { boxShadow: '0 0 0px rgba(255,191,0,0)' }
              }
              transition={
                i === step
                  ? { duration: 2, repeat: Infinity }
                  : { duration: 0.3 }
              }
            >
              {i === step && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-ecs-amber/30"
                  initial={{ scale: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
