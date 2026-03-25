'use client';

import { useState } from 'react';
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

const pageVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (step === 0 && !displayName.trim()) {
      setError('Veuillez entrer votre nom.');
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }

  function handleBack() {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function handleComplete() {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifi\u00e9');

      const updatePayload: Record<string, unknown> = {
        display_name: displayName.trim(),
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
      setError('Erreur lors de la sauvegarde. R\u00e9essayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <motion.div
            key="step-0"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="card-ecs text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ecs-amber/10 border border-ecs-amber/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-ecs-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Bienvenue dans ECS GAME !
              </h2>
              <p className="text-ecs-gray text-sm mb-6">
                Gamifiez votre activit&eacute; commerciale, gagnez de l&apos;XP et dominez le classement.
              </p>
            </div>

            <div className="text-left mb-6">
              <label className="block text-sm font-medium text-ecs-gray mb-1.5">
                Comment souhaitez-vous &ecirc;tre appel&eacute; ?
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Votre nom ou pseudo"
                className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white placeholder:text-ecs-gray/50 outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <button onClick={handleNext} className="btn-primary w-full">
              Continuer
            </button>
          </motion.div>
        )}

        {/* Step 1: Avatar */}
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="card-ecs text-center"
          >
            <h2 className="font-display text-xl font-bold text-white mb-2">
              Choisissez votre avatar
            </h2>
            <p className="text-ecs-gray text-sm mb-6">
              S&eacute;lectionnez un avatar pour repr&eacute;senter votre profil.
            </p>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={cn(
                    'w-full aspect-square rounded-lg border-2 overflow-hidden bg-ecs-gray-dark/30 flex items-center justify-center transition-all',
                    selectedAvatar === avatar
                      ? 'border-ecs-amber shadow-amber-glow scale-105'
                      : 'border-ecs-gray-border hover:border-ecs-gray'
                  )}
                >
                  <div className="w-full h-full bg-ecs-gray-dark flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-ecs-gray">
                      {avatar.split('-').pop()?.replace('.png', '')}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-ecs-gray mb-6">
              Vous pourrez modifier votre avatar plus tard.
            </p>

            <div className="flex gap-3">
              <button onClick={handleBack} className="btn-secondary flex-1">
                Retour
              </button>
              <button onClick={handleNext} className="btn-primary flex-1">
                Continuer
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: First quest preview */}
        {step === 2 && (
          <motion.div
            key="step-2"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="card-ecs text-center"
          >
            <h2 className="font-display text-xl font-bold text-white mb-2">
              Votre premi&egrave;re qu&ecirc;te
            </h2>
            <p className="text-ecs-gray text-sm mb-6">
              Voici un aper&ccedil;u de ce qui vous attend.
            </p>

            <div className="rounded-lg border border-ecs-amber/20 bg-ecs-amber/5 p-5 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-display font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                  Quotidienne
                </span>
                <span className="font-display font-bold text-ecs-amber text-sm">+50 XP</span>
              </div>
              <h3 className="font-display font-bold text-white mb-1">
                Premier pas
              </h3>
              <p className="text-sm text-ecs-gray mb-3">
                Compl&eacute;tez votre premier objectif quotidien pour commencer votre aventure.
              </p>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: '0%' }} />
              </div>
              <p className="text-xs text-ecs-gray mt-1">0/1 &mdash; Pr&ecirc;t &agrave; commencer</p>
            </div>

            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3 text-sm text-ecs-gray">
                <div className="w-8 h-8 rounded-full bg-ecs-amber/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-ecs-amber font-display font-bold text-xs">1</span>
                </div>
                Gagnez de l&apos;XP en compl&eacute;tant des qu&ecirc;tes
              </div>
              <div className="flex items-center gap-3 text-sm text-ecs-gray">
                <div className="w-8 h-8 rounded-full bg-ecs-amber/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-ecs-amber font-display font-bold text-xs">2</span>
                </div>
                Montez en niveau et d&eacute;bloquez des badges
              </div>
              <div className="flex items-center gap-3 text-sm text-ecs-gray">
                <div className="w-8 h-8 rounded-full bg-ecs-amber/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-ecs-amber font-display font-bold text-xs">3</span>
                </div>
                Dominez le classement de votre organisation
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleBack} className="btn-secondary flex-1">
                Retour
              </button>
              <button onClick={handleNext} className="btn-primary flex-1">
                Continuer
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <motion.div
            key="step-3"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="card-ecs text-center"
          >
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ecs-amber/10 border border-ecs-amber/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-ecs-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                C&apos;est parti !
              </h2>
              <p className="text-ecs-gray text-sm mb-2">
                Tout est pr&ecirc;t, <span className="text-ecs-amber font-medium">{displayName}</span>.
              </p>
              <p className="text-ecs-gray text-sm">
                Votre aventure commence maintenant. Bonne chance !
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={handleBack} className="btn-secondary flex-1">
                Retour
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Chargement...' : 'Entrer dans le jeu'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              i === step
                ? 'bg-ecs-amber w-6'
                : i < step
                  ? 'bg-ecs-amber/50'
                  : 'bg-ecs-gray-dark'
            )}
          />
        ))}
      </div>
    </div>
  );
}
