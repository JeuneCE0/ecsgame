'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';
import { LEVEL_TITLES, BADGE_RARITIES } from '@/lib/constants';

interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
  organization_id: string | null;
}

interface BadgeData {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon_url: string | null;
    rarity: string;
    xp_bonus: number;
  };
}

interface XPEventData {
  id: string;
  source: string;
  amount: number;
  description: string | null;
  verification_status: string;
  created_at: string;
}

interface ProfileClientProps {
  profile: ProfileData;
  badges: BadgeData[];
  xpEvents: XPEventData[];
  questsCompleted: number;
  badgesEarned: number;
}

const SOURCE_LABELS: Record<string, string> = {
  quest_completion: 'Qu\u00eate',
  call_booked: 'Appel r\u00e9serv\u00e9',
  deal_closed: 'Deal conclu',
  lead_generated: 'Lead g\u00e9n\u00e9r\u00e9',
  formation_completed: 'Formation',
  streak_bonus: 'Bonus streak',
  manual_log: 'Saisie manuelle',
  referral: 'Parrainage',
  badge_earned: 'Badge obtenu',
  admin_grant: 'Attribution admin',
};

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  quest_completion: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  call_booked: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  deal_closed: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  lead_generated: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  formation_completed: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  ),
  streak_bonus: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  manual_log: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  referral: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  ),
  badge_earned: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  admin_grant: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const RARITY_GLOW: Record<string, string> = {
  common: 'shadow-[0_0_15px_rgba(136,136,136,0.2)]',
  rare: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  epic: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
  legendary: 'shadow-[0_0_30px_rgba(255,191,0,0.4)]',
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-gray-500/30 hover:border-gray-500/50',
  rare: 'border-blue-500/30 hover:border-blue-500/50',
  epic: 'border-purple-500/30 hover:border-purple-500/50',
  legendary: 'border-[#FFBF00]/30 hover:border-[#FFBF00]/50',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '\u00c0 l\u2019instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(dateStr);
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

export default function ProfileClient({
  profile,
  badges,
  xpEvents,
  questsCompleted,
  badgesEarned,
}: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.full_name);
  const [saving, setSaving] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;

    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: editName.trim() }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    { label: 'XP Total', value: formatXP(profile.total_xp), icon: (
      <svg className="w-5 h-5 text-[#FFBF00]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ), accent: true },
    { label: 'Niveau', value: String(profile.level), icon: (
      <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ), accent: false },
    { label: 'Streak actuel', value: `${profile.current_streak}j`, icon: (
      <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    ), accent: false },
    { label: 'Record streak', value: `${profile.longest_streak}j`, icon: (
      <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ), accent: false },
    { label: 'Qu\u00eates', value: String(questsCompleted), icon: (
      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ), accent: false },
    { label: 'Badges', value: String(badgesEarned), icon: (
      <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ), accent: false },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Profile Hero Card */}
      <motion.div
        variants={childVariants}
        className="relative rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden"
      >
        {/* Background gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#FFBF00]/10 via-[#FF9D00]/5 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with animated ring */}
            <div className="relative group">
              {/* Animated outer ring */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#FFBF00] via-[#FF9D00] to-[#FFBF00] opacity-60 blur-sm group-hover:opacity-80 transition-opacity" />
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FFBF00] to-[#FF9D00]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #FFBF00, transparent 30%, transparent 70%, #FF9D00)',
                }}
              />
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#0C0C0C] flex items-center justify-center overflow-hidden border-2 border-[#0C0C0C]">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-display font-bold bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] bg-clip-text text-transparent">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Level badge on avatar */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] shadow-[0_0_15px_rgba(255,191,0,0.4)]">
                <span className="font-display font-bold text-[#0C0C0C] text-xs">
                  Niv. {profile.level}
                </span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left mt-4 md:mt-2">
              {/* Name with gradient */}
              <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-1">
                {profile.full_name}
              </h1>

              {/* Title badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20 mb-3">
                <svg className="w-4 h-4 text-[#FFBF00]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
                </svg>
                <span className="font-display font-semibold text-[#FFBF00] text-sm">
                  {LEVEL_TITLES[profile.level] ?? `Niveau ${profile.level}`}
                </span>
              </div>

              <p className="text-white/30 text-sm mb-1">{profile.email}</p>
              <p className="text-white/20 text-xs">
                Membre depuis {formatDate(profile.created_at)}
              </p>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-medium text-[#FFBF00] bg-[#FFBF00]/5 border border-[#FFBF00]/20 hover:bg-[#FFBF00]/10 hover:border-[#FFBF00]/30 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                {isEditing ? 'Annuler' : 'Modifier le profil'}
              </button>
            </div>
          </div>

          {/* Edit form */}
          <AnimatePresence>
            {isEditing && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveProfile}
                className="mt-6 pt-6 border-t border-white/5"
              >
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-white/40 mb-1.5">
                      Nom d&apos;affichage
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-[#FFBF00]/40 focus:ring-1 focus:ring-[#FFBF00]/20 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving || !editName.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] font-display font-bold text-sm hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={childVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={cn(
              'group relative rounded-2xl border p-4 text-center',
              'bg-black/40 backdrop-blur-sm border-white/5',
              'hover:border-white/10 transition-all duration-300',
              stat.accent && 'border-[#FFBF00]/20 bg-[#FFBF00]/[0.03]'
            )}
          >
            <div className="flex justify-center mb-2">
              {stat.icon}
            </div>
            <p className={cn(
              'font-display text-2xl font-bold mb-0.5',
              stat.accent ? 'text-[#FFBF00]' : 'text-white'
            )}>
              {stat.value}
            </p>
            <p className="text-[11px] text-white/30 font-display">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Badges - Trophy Case */}
      <motion.div
        variants={childVariants}
        className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/10 border border-[#FFBF00]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#FFBF00]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            Vitrine de badges
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {badges.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm font-display">
              Aucun badge obtenu pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map((ub, index) => {
              const rarity = BADGE_RARITIES[ub.badge.rarity as keyof typeof BADGE_RARITIES];
              const glowClass = RARITY_GLOW[ub.badge.rarity] ?? '';
              const borderClass = RARITY_BORDER[ub.badge.rarity] ?? 'border-white/10';

              return (
                <motion.div
                  key={ub.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                  className={cn(
                    'group rounded-2xl border p-4 text-center transition-all duration-300',
                    'bg-black/40 backdrop-blur-sm',
                    borderClass,
                    glowClass
                  )}
                >
                  <div
                    className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${rarity?.color ?? '#888'}10`,
                      border: `1px solid ${rarity?.color ?? '#888'}30`,
                    }}
                  >
                    {ub.badge.icon_url ? (
                      <img src={ub.badge.icon_url} alt={ub.badge.name} className="w-8 h-8" />
                    ) : (
                      <svg
                        className="w-7 h-7"
                        style={{ color: rarity?.color ?? '#888' }}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    )}
                  </div>
                  <p className="font-display font-bold text-white text-sm truncate mb-0.5">
                    {ub.badge.name}
                  </p>
                  <p className="text-[11px] font-display font-semibold mb-1" style={{ color: rarity?.color ?? '#888' }}>
                    {rarity?.label ?? ub.badge.rarity}
                  </p>
                  <p className="text-[11px] text-white/20 line-clamp-2">{ub.badge.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* XP History - Timeline */}
      <motion.div
        variants={childVariants}
        className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            Historique XP
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {xpEvents.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm font-display">
              Aucun &eacute;v&eacute;nement XP pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {xpEvents.map((event, index) => {
              const icon = SOURCE_ICONS[event.source] ?? SOURCE_ICONS.manual_log;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className={cn(
                    'group flex items-center gap-4 py-3.5 px-3 -mx-3 rounded-xl hover:bg-white/[0.02] transition-colors',
                    index < xpEvents.length - 1 && 'border-b border-white/5'
                  )}
                >
                  {/* Icon with timeline connector */}
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300',
                      event.amount > 0 ? 'bg-[#FFBF00]/10 text-[#FFBF00] border border-[#FFBF00]/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
                    )}>
                      {icon}
                    </div>
                    {index < xpEvents.length - 1 && (
                      <div className="absolute top-[38px] left-1/2 -translate-x-1/2 w-px h-4 bg-white/5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium truncate">
                        {event.description ?? SOURCE_LABELS[event.source] ?? event.source}
                      </span>
                      {event.verification_status === 'pending_review' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-display font-semibold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                          En attente
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/20 mt-0.5">
                      {formatRelativeDate(event.created_at)}
                    </p>
                  </div>

                  <span className={cn(
                    'font-display font-bold text-sm flex-shrink-0 tabular-nums',
                    event.amount > 0 ? 'text-[#FFBF00]' : 'text-red-400'
                  )}>
                    {event.amount > 0 ? '+' : ''}{formatXP(event.amount)} XP
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
