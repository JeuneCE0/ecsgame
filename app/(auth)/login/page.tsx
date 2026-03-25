'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push('/dashboard');
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push('/dashboard');
  }

  async function handleGoogleLogin() {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center mb-8">
        <Image
          src="/logo.png"
          alt="ECS GAME"
          width={160}
          height={48}
          priority
        />
      </div>

      <div className="card-ecs">
        <h1 className="font-display text-2xl font-bold text-white text-center mb-2">
          Connexion
        </h1>
        <p className="text-ecs-gray text-sm text-center mb-8">
          Connectez-vous pour acc&eacute;der &agrave; votre espace de jeu.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4 mb-6">
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
              className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border
                         text-white placeholder:text-ecs-gray/50 outline-none
                         focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20
                         transition-colors disabled:opacity-50"
            />
          </div>
          {mode === 'password' && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ecs-gray mb-1.5"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border
                           text-white placeholder:text-ecs-gray/50 outline-none
                           focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20
                           transition-colors disabled:opacity-50"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                Connexion...
              </>
            ) : mode === 'password' ? (
              'Se connecter'
            ) : (
              'Envoyer le lien magique'
            )}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
            className="w-full text-center text-ecs-gray hover:text-ecs-amber text-sm transition-colors"
          >
            {mode === 'password' ? 'Utiliser un lien magique' : 'Utiliser un mot de passe'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ecs-gray-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-ecs-black-card px-3 text-ecs-gray">ou</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn-secondary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-ecs-amber"
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
        </button>
      </div>

      <p className="text-center text-ecs-gray text-sm mt-6">
        Pas encore de compte ?{' '}
        <Link
          href="/signup"
          className="text-ecs-amber hover:text-ecs-orange transition-colors font-medium"
        >
          Cr&eacute;er un compte
        </Link>
      </p>
    </motion.div>
  );
}
