'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const Spinner = ({ className = '' }: { className?: string }) => (
  <svg
    className={`animate-spin h-5 w-5 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default function SignupPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Veuillez entrer votre nom complet.');
      return;
    }

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess(true);
  }

  async function handleGoogleSignup() {
    setError(null);
    setGoogleLoading(true);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (authError) {
      setGoogleLoading(false);
      setError(authError.message);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {/* Logo with glow */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-30 bg-ecs-amber rounded-full scale-150" />
            <Image
              src="/logo.png"
              alt="ECS GAME"
              width={160}
              height={48}
              priority
              className="relative"
            />
          </div>
        </div>

        <p className="text-center font-display text-sm uppercase tracking-[0.3em] mb-8 bg-gradient-to-r from-ecs-amber via-ecs-orange to-ecs-amber bg-clip-text text-transparent">
          The Business Game
        </p>

        {/* Success card */}
        <div
          className="relative rounded-2xl border border-white/[0.06] p-8 backdrop-blur-xl overflow-hidden text-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(26,26,26,0.8) 0%, rgba(20,20,20,0.9) 100%)',
            boxShadow:
              '0 0 0 1px rgba(255,191,0,0.03), 0 20px 60px -10px rgba(0,0,0,0.5), 0 0 40px rgba(255,191,0,0.02)',
          }}
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-ecs-amber/[0.03] rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,191,0,0.15) 0%, rgba(255,157,0,0.08) 100%)',
              boxShadow: '0 0 30px rgba(255,191,0,0.1)',
            }}
          >
            <svg
              className="w-8 h-8 text-ecs-amber"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <h2 className="font-display text-xl font-bold text-white mb-3">
            Inscription r&eacute;ussie !
          </h2>
          <p className="text-ecs-gray text-sm mb-6 leading-relaxed">
            Un lien de confirmation a &eacute;t&eacute; envoy&eacute;
            &agrave;{' '}
            <span className="text-ecs-amber font-medium">{email}</span>.
            <br />
            Cliquez dessus pour activer votre compte.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-ecs-gray hover:text-white text-sm transition-colors duration-300"
          >
            Utiliser une autre adresse
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Logo with glow */}
      <motion.div
        className="flex justify-center mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-30 bg-ecs-amber rounded-full scale-150" />
          <Image
            src="/logo.png"
            alt="ECS GAME"
            width={160}
            height={48}
            priority
            className="relative"
          />
        </div>
      </motion.div>

      {/* Tagline with gradient */}
      <motion.p
        className="text-center font-display text-sm uppercase tracking-[0.3em] mb-8 bg-gradient-to-r from-ecs-amber via-ecs-orange to-ecs-amber bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        The Business Game
      </motion.p>

      {/* Glass morphism card */}
      <motion.div
        className="relative rounded-2xl border border-white/[0.06] p-6 backdrop-blur-xl overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(26,26,26,0.8) 0%, rgba(20,20,20,0.9) 100%)',
          boxShadow:
            '0 0 0 1px rgba(255,191,0,0.03), 0 20px 60px -10px rgba(0,0,0,0.5), 0 0 40px rgba(255,191,0,0.02)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Card inner glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-ecs-amber/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ecs-orange/[0.02] rounded-full blur-3xl pointer-events-none" />

        <h1 className="relative font-display text-2xl font-bold text-white text-center mb-2">
          Cr&eacute;er un compte
        </h1>
        <p className="relative text-ecs-gray text-sm text-center mb-8">
          Rejoignez ECS GAME et commencez votre aventure entrepreneuriale.
        </p>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSignup} className="relative space-y-4 mb-6">
          {/* Full name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-ecs-gray mb-1.5"
            >
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jean Dupont"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-ecs-black/60 border border-white/[0.06]
                         text-white placeholder:text-ecs-gray/40 outline-none
                         focus:border-ecs-amber/50 focus:shadow-[0_0_0_3px_rgba(255,191,0,0.1),0_0_20px_rgba(255,191,0,0.05)]
                         transition-all duration-300 disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-ecs-gray mb-1.5"
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-ecs-black/60 border border-white/[0.06]
                         text-white placeholder:text-ecs-gray/40 outline-none
                         focus:border-ecs-amber/50 focus:shadow-[0_0_0_3px_rgba(255,191,0,0.1),0_0_20px_rgba(255,191,0,0.05)]
                         transition-all duration-300 disabled:opacity-50"
            />
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg
                       font-display font-bold uppercase tracking-wider text-ecs-black
                       bg-gradient-to-r from-ecs-amber to-ecs-orange
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300"
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,191,0,0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Spinner />
                Inscription en cours...
              </>
            ) : (
              "S'inscrire avec un lien magique"
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 text-ecs-gray/60" style={{ background: 'rgba(20,20,20,0.9)' }}>
              ou
            </span>
          </div>
        </div>

        {/* Google button — glass style */}
        <motion.button
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg
                     font-display uppercase tracking-wider text-white/80
                     border border-white/[0.08] backdrop-blur-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.03]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {googleLoading ? (
            <Spinner className="text-ecs-amber" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#FFBF00"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#FF9D00"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FFBF00"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#FF9D00"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continuer avec Google
        </motion.button>
      </motion.div>

      {/* Login link */}
      <motion.p
        className="text-center text-ecs-gray text-sm mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        D&eacute;j&agrave; un compte ?{' '}
        <Link
          href="/login"
          className="text-ecs-amber hover:text-ecs-orange transition-colors duration-300 font-medium"
        >
          Se connecter
        </Link>
      </motion.p>
    </motion.div>
  );
}
