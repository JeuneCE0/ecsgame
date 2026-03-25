'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';

type FilterKey = 'all' | 'in_progress' | 'completed';

interface FormationWithProgress {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  duration_minutes: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  user_formation: {
    id: string;
    progress_percent: number;
    status: string;
    started_at: string | null;
    completed_at: string | null;
  } | null;
}

interface FormationsClientProps {
  formations: FormationWithProgress[];
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Termin\u00e9es' },
];

function getStatusInfo(formation: FormationWithProgress): {
  label: string;
  variant: 'start' | 'continue' | 'done';
} {
  if (!formation.user_formation) {
    return { label: 'Commencer', variant: 'start' };
  }
  if (formation.user_formation.status === 'completed') {
    return { label: 'Termin\u00e9', variant: 'done' };
  }
  return { label: 'Continuer', variant: 'continue' };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h${remaining}` : `${hours}h`;
}

export default function FormationsClient({ formations }: FormationsClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filteredFormations = formations.filter((f) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in_progress') {
      return f.user_formation && f.user_formation.status !== 'completed';
    }
    if (activeFilter === 'completed') {
      return f.user_formation?.status === 'completed';
    }
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Formations
        </h1>
        <p className="text-ecs-gray text-sm mb-6">
          Formez-vous et gagnez de l&apos;XP en compl&eacute;tant des formations.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-display font-medium transition-all',
              activeFilter === filter.key
                ? 'bg-gradient-amber text-ecs-black'
                : 'bg-ecs-black-card border border-ecs-gray-border text-ecs-gray hover:text-white hover:border-ecs-gray'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredFormations.length === 0 ? (
        <div className="card-ecs text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ecs-gray-dark/30 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-ecs-gray"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Aucune formation disponible
          </h2>
          <p className="text-ecs-gray text-sm max-w-md mx-auto">
            {activeFilter === 'all'
              ? 'De nouvelles formations seront bient\u00f4t disponibles.'
              : 'Aucune formation trouv\u00e9e avec ce filtre.'}
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredFormations.map((formation) => {
            const statusInfo = getStatusInfo(formation);
            const progress = formation.user_formation?.progress_percent ?? 0;

            return (
              <motion.div
                key={formation.id}
                variants={itemVariants}
                className="card-ecs flex flex-col group hover:border-ecs-amber/20 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-full h-40 rounded-md bg-ecs-gray-dark/30 mb-4 overflow-hidden flex items-center justify-center">
                  {formation.thumbnail_url ? (
                    <img
                      src={formation.thumbnail_url}
                      alt={formation.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-ecs-gray/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                    </svg>
                  )}
                </div>

                <h3 className="font-display font-bold text-white mb-1 line-clamp-1">
                  {formation.title}
                </h3>
                <p className="text-xs text-ecs-gray line-clamp-2 mb-3">
                  {formation.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-ecs-gray mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(formation.duration_minutes)}
                  </span>
                  <span className="font-display font-bold text-ecs-amber">
                    +{formatXP(formation.xp_reward)} XP
                  </span>
                </div>

                {/* Progress bar */}
                {formation.user_formation && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-ecs-gray mb-1">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="xp-bar">
                      <div
                        className="xp-bar-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  {statusInfo.variant === 'done' ? (
                    <div className="w-full py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider text-center text-green-400 bg-green-400/10 border border-green-400/20">
                      Termin&eacute;
                    </div>
                  ) : (
                    <button
                      className={cn(
                        'w-full py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all',
                        statusInfo.variant === 'start' ? 'btn-primary' : 'btn-secondary'
                      )}
                    >
                      {statusInfo.label}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
