'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  is_published: boolean;
  created_at: string;
  user_formation: {
    id: string;
    progress_percent: number;
    completed_at: string | null;
    created_at: string;
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
  if (formation.user_formation.completed_at) {
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

function ProgressRing({ percent, size = 56, strokeWidth = 4 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-white/5"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFBF00" />
            <stop offset="100%" stopColor="#FF9D00" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-display font-bold text-white tabular-nums">
          {percent}%
        </span>
      </div>
    </div>
  );
}

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

export default function FormationsClient({ formations }: FormationsClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filteredFormations = formations.filter((f) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in_progress') {
      return f.user_formation && !f.user_formation.completed_at;
    }
    if (activeFilter === 'completed') {
      return !!f.user_formation?.completed_at;
    }
    return true;
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={childVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFBF00] to-[#FF9D00] flex items-center justify-center shadow-[0_0_20px_rgba(255,191,0,0.3)]">
            <svg className="w-5 h-5 text-[#0C0C0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Formations
            </h1>
            <p className="text-white/40 text-sm">
              Formez-vous et gagnez de l&apos;XP en compl&eacute;tant des formations.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={childVariants}>
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 mb-8 w-fit">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                'relative px-5 py-2.5 rounded-lg text-sm font-display font-medium transition-colors',
                activeFilter === filter.key
                  ? 'text-[#0C0C0C]'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {activeFilter === filter.key && (
                <motion.div
                  layoutId="active-formation-filter"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFBF00] to-[#FF9D00]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{filter.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filteredFormations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-black/40 backdrop-blur-sm border border-white/5 text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white/10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">
              Aucune formation disponible
            </h2>
            <p className="text-white/30 text-sm max-w-md mx-auto">
              {activeFilter === 'all'
                ? 'De nouvelles formations seront bient\u00f4t disponibles.'
                : 'Aucune formation trouv\u00e9e avec ce filtre.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeFilter}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredFormations.map((formation) => {
              const statusInfo = getStatusInfo(formation);
              const progress = formation.user_formation?.progress_percent ?? 0;

              return (
                <motion.div
                  key={formation.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm flex flex-col overflow-hidden hover:border-white/10 transition-all duration-300"
                >
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-[#FFBF00]/20 via-transparent to-[#FF9D00]/20" />
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-full h-44 overflow-hidden">
                    {formation.thumbnail_url ? (
                      <img
                        src={formation.thumbnail_url}
                        alt={formation.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FFBF00]/10 via-[#FF9D00]/5 to-transparent flex items-center justify-center">
                        <svg className="w-14 h-14 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                        </svg>
                      </div>
                    )}

                    {/* Duration tag */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[11px] font-display font-medium text-white/60">
                        {formatDuration(formation.duration_minutes)}
                      </span>
                    </div>

                    {/* XP reward badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#FFBF00]/20 backdrop-blur-sm border border-[#FFBF00]/30 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-[#FFBF00]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      <span className="text-[11px] font-display font-bold text-[#FFBF00]">
                        +{formatXP(formation.xp_reward)}
                      </span>
                    </div>

                    {/* Status indicator */}
                    <div className="absolute bottom-3 left-3">
                      {statusInfo.variant === 'done' ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-[11px] font-display font-semibold text-green-400">Termin&eacute;</span>
                        </div>
                      ) : statusInfo.variant === 'continue' ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFBF00]/20 backdrop-blur-sm border border-[#FFBF00]/30">
                          <div className="w-2 h-2 rounded-full bg-[#FFBF00] animate-pulse" />
                          <span className="text-[11px] font-display font-semibold text-[#FFBF00]">En cours</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                          <div className="w-2 h-2 rounded-full bg-white/40" />
                          <span className="text-[11px] font-display font-semibold text-white/40">Nouveau</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-[#FFBF00] transition-colors">
                          {formation.title}
                        </h3>
                        <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">
                          {formation.description}
                        </p>
                      </div>

                      {/* Progress ring */}
                      {formation.user_formation && (
                        <div className="flex-shrink-0">
                          <ProgressRing percent={progress} />
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="mt-auto pt-4">
                      {statusInfo.variant === 'done' ? (
                        <div className="w-full py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider text-center text-green-400 bg-green-400/5 border border-green-400/20">
                          Termin&eacute;
                        </div>
                      ) : (
                        <button
                          className={cn(
                            'w-full py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider transition-all duration-300',
                            statusInfo.variant === 'start'
                              ? 'bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.02]'
                              : 'bg-white/5 border border-[#FFBF00]/30 text-[#FFBF00] hover:bg-[#FFBF00]/10 hover:border-[#FFBF00]/50'
                          )}
                        >
                          {statusInfo.label}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
