'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatXP, getXPProgressPercent } from '@/lib/utils';
import { LEVEL_TITLES, BADGE_RARITIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import {
  Star,
  Flame,
  Trophy,
  Target,
  BookOpen,
  Shield,
  Clock,
  X,
  Save,
  Pencil,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

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
  business_type: string | null;
  business_name: string | null;
  bio: string | null;
  goals: string[] | null;
  social_links: Record<string, string> | null;
  experience_level: string | null;
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

interface AllBadgeData {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  rarity: string;
  xp_bonus: number;
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
  allBadges: AllBadgeData[];
  xpEvents: XPEventData[];
  questsCompleted: number;
  formationsCompleted: number;
  badgesEarned: number;
  currentLevelXP: number;
  nextLevelXP: number;
}

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

const BUSINESS_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  agence: { icon: '\uD83C\uDFE2', label: 'Agence', color: 'from-blue-500/20 to-blue-600/10' },
  coach: { icon: '\uD83C\uDFAF', label: 'Coach', color: 'from-green-500/20 to-green-600/10' },
  createur: { icon: '\uD83C\uDFAC', label: 'Cr\u00e9ateur', color: 'from-pink-500/20 to-pink-600/10' },
  freelance: { icon: '\uD83D\uDCBB', label: 'Freelance', color: 'from-cyan-500/20 to-cyan-600/10' },
  saas: { icon: '\uD83D\uDE80', label: 'SaaS', color: 'from-violet-500/20 to-violet-600/10' },
  ecommerce: { icon: '\uD83D\uDED2', label: 'E-commerce', color: 'from-orange-500/20 to-orange-600/10' },
  immobilier: { icon: '\uD83C\uDFE0', label: 'Immobilier', color: 'from-emerald-500/20 to-emerald-600/10' },
  mlm: { icon: '\uD83E\uDD1D', label: 'MLM', color: 'from-amber-500/20 to-amber-600/10' },
  consultant: { icon: '\uD83D\uDCCA', label: 'Consultant', color: 'from-indigo-500/20 to-indigo-600/10' },
};

const EXPERIENCE_LEVELS: Record<string, { label: string; stars: number }> = {
  debutant: { label: 'D\u00e9butant', stars: 1 },
  intermediaire: { label: 'Interm\u00e9diaire', stars: 2 },
  avance: { label: 'Avanc\u00e9', stars: 3 },
  expert: { label: 'Expert', stars: 4 },
};

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

const SOCIAL_LINK_OPTIONS = [
  { key: 'website', label: 'Site web', placeholder: 'https://monsite.com' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
];

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                             Animation Configs                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                          Edit Profile Modal Types                          */
/* -------------------------------------------------------------------------- */

interface EditFormState {
  full_name: string;
  business_type: string;
  business_name: string;
  bio: string;
  goals: string[];
  social_links: Record<string, string>;
  experience_level: string;
}

/* -------------------------------------------------------------------------- */
/*                           Edit Profile Modal                               */
/* -------------------------------------------------------------------------- */

function EditProfileModal({
  profile,
  isOpen,
  onClose,
}: {
  profile: ProfileData;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditFormState>({
    full_name: profile.full_name,
    business_type: profile.business_type ?? '',
    business_name: profile.business_name ?? '',
    bio: profile.bio ?? '',
    goals: profile.goals ?? [],
    social_links: profile.social_links ?? {},
    experience_level: profile.experience_level ?? '',
  });
  const [newGoal, setNewGoal] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        business_type: form.business_type || null,
        business_name: form.business_name.trim() || null,
        bio: form.bio.trim() || null,
        goals: form.goals.length > 0 ? form.goals : null,
        social_links: Object.keys(form.social_links).length > 0 ? form.social_links : null,
        experience_level: form.experience_level || null,
      })
      .eq('id', profile.id);

    setSaving(false);

    if (!error) {
      window.location.reload();
    }
  }, [form, profile.id]);

  const addGoal = useCallback(() => {
    if (newGoal.trim() && form.goals.length < 5) {
      setForm((prev) => ({ ...prev, goals: [...prev.goals, newGoal.trim()] }));
      setNewGoal('');
    }
  }, [newGoal, form.goals]);

  const removeGoal = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  }, []);

  const updateSocialLink = useCallback((key: string, value: string) => {
    setForm((prev) => {
      const links = { ...prev.social_links };
      if (value.trim()) {
        links[key] = value.trim();
      } else {
        delete links[key];
      }
      return { ...prev, social_links: links };
    });
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0C0C0C]/95 backdrop-blur-xl p-6 md:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white">
                Modifier le profil
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">
                  Nom d&apos;affichage
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-[#FFBF00]/40 focus:ring-1 focus:ring-[#FFBF00]/20 transition-colors"
                />
              </div>

              {/* Business type */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">
                  Type d&apos;activit&eacute;
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(BUSINESS_TYPE_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, business_type: prev.business_type === key ? '' : key }))}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                        form.business_type === key
                          ? 'border-[#FFBF00]/40 bg-[#FFBF00]/10 text-[#FFBF00]'
                          : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80'
                      )}
                    >
                      <span>{config.icon}</span>
                      <span className="truncate">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business name */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">
                  Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
                  placeholder="Mon entreprise"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-[#FFBF00]/40 focus:ring-1 focus:ring-[#FFBF00]/20 transition-colors"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Parle-nous de toi en quelques mots..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-[#FFBF00]/40 focus:ring-1 focus:ring-[#FFBF00]/20 transition-colors resize-none"
                />
                <p className="text-xs text-white/20 mt-1 text-right">
                  {form.bio.length}/300
                </p>
              </div>

              {/* Experience level */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">
                  Niveau d&apos;exp&eacute;rience
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(EXPERIENCE_LEVELS).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, experience_level: prev.experience_level === key ? '' : key }))}
                      className={cn(
                        'flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-sm transition-all',
                        form.experience_level === key
                          ? 'border-[#FFBF00]/40 bg-[#FFBF00]/10 text-[#FFBF00]'
                          : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20'
                      )}
                    >
                      <span className="text-xs">
                        {Array.from({ length: config.stars }, () => '\u2B50').join('')}
                      </span>
                      <span className="font-medium text-xs">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">
                  Objectifs (max 5)
                </label>
                <div className="space-y-2">
                  {form.goals.map((goal, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80">
                        {goal}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGoal(i)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {form.goals.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addGoal();
                          }
                        }}
                        placeholder="Ajouter un objectif..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 outline-none focus:border-[#FFBF00]/40 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={addGoal}
                        disabled={!newGoal.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#FFBF00]/10 text-[#FFBF00] text-sm font-medium border border-[#FFBF00]/20 hover:bg-[#FFBF00]/20 transition-colors disabled:opacity-40"
                      >
                        Ajouter
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Social links */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">
                  Liens sociaux
                </label>
                <div className="space-y-2">
                  {SOCIAL_LINK_OPTIONS.map((option) => (
                    <div key={option.key} className="flex items-center gap-2">
                      <span className="w-20 text-xs text-white/40 font-medium shrink-0">
                        {option.label}
                      </span>
                      <input
                        type="url"
                        value={form.social_links[option.key] ?? ''}
                        onChange={(e) => updateSocialLink(option.key, e.target.value)}
                        placeholder={option.placeholder}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/15 outline-none focus:border-[#FFBF00]/40 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.full_name.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFBF00] to-[#FF9D00] text-[#0C0C0C] font-display font-bold text-sm hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Main Profile Client                              */
/* -------------------------------------------------------------------------- */

export default function ProfileClient({
  profile,
  badges,
  allBadges,
  xpEvents,
  questsCompleted,
  formationsCompleted,
  badgesEarned,
  currentLevelXP,
  nextLevelXP,
}: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);

  const rankTitle = LEVEL_TITLES[profile.level] ?? `Niveau ${profile.level}`;
  const businessConfig = profile.business_type
    ? BUSINESS_TYPE_CONFIG[profile.business_type]
    : null;
  const expConfig = profile.experience_level
    ? EXPERIENCE_LEVELS[profile.experience_level]
    : null;
  const xpProgress = getXPProgressPercent(profile.total_xp, currentLevelXP, nextLevelXP);
  const xpIntoLevel = profile.total_xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;

  // Separate earned badge IDs for trophy case
  const earnedBadgeIds = new Set(badges.map((b) => b.badge_id));

  const stats = [
    { label: 'XP Total', value: formatXP(profile.total_xp), icon: Star, color: 'text-[#FFBF00]', accent: true },
    { label: 'Niveau', value: String(profile.level), icon: Shield, color: 'text-purple-400', accent: false },
    { label: 'Streak', value: `${profile.current_streak}j`, icon: Flame, color: 'text-orange-400', accent: false },
    { label: 'Record', value: `${profile.longest_streak}j`, icon: Flame, color: 'text-red-400', accent: false },
    { label: 'Qu\u00eates', value: String(questsCompleted), icon: Target, color: 'text-blue-400', accent: false },
    { label: 'Formations', value: String(formationsCompleted), icon: BookOpen, color: 'text-green-400', accent: false },
    { label: 'Badges', value: String(badgesEarned), icon: Trophy, color: 'text-amber-400', accent: false },
  ];

  const socialLinks = profile.social_links
    ? Object.entries(profile.social_links).filter(([, v]) => v)
    : [];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* ================================================================== */}
      {/*  HERO BANNER — Character Sheet Header                              */}
      {/* ================================================================== */}
      <motion.div
        variants={childVariants}
        className="relative rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden"
      >
        {/* Background gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-[#FFBF00]/10 via-[#FF9D00]/5 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with animated gradient ring */}
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
              <motion.div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFBF00] to-[#FF9D00]"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(255,191,0,0.3)',
                    '0 0 20px rgba(255,191,0,0.5)',
                    '0 0 10px rgba(255,191,0,0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="font-display font-bold text-[#0C0C0C] text-xs">
                  Niv. {profile.level}
                </span>
              </motion.div>
            </div>

            <div className="flex-1 text-center md:text-left mt-4 md:mt-2 min-w-0">
              {/* Name with gradient */}
              <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-2">
                {profile.full_name}
              </h1>

              {/* Rank title badge */}
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20">
                  <Shield className="w-4 h-4 text-[#FFBF00]" />
                  <span className="font-display font-semibold text-[#FFBF00] text-sm">
                    {rankTitle}
                  </span>
                </div>

                {/* Business type badge */}
                {businessConfig && (
                  <div className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-gradient-to-r',
                    businessConfig.color,
                  )}>
                    <span className="text-sm">{businessConfig.icon}</span>
                    <span className="font-display font-medium text-white/80 text-sm">
                      {businessConfig.label}
                    </span>
                  </div>
                )}

                {/* Experience level */}
                {expConfig && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs">{Array.from({ length: expConfig.stars }, () => '\u2B50').join('')}</span>
                    <span className="font-display font-medium text-white/60 text-sm">
                      {expConfig.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Business name */}
              {profile.business_name && (
                <p className="text-white/50 text-sm mb-1 font-medium">
                  {profile.business_name}
                </p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-white/40 text-sm mb-2 max-w-xl">
                  {profile.bio}
                </p>
              )}

              {/* Goals */}
              {profile.goals && profile.goals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2 justify-center md:justify-start">
                  {profile.goals.map((goal, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FFBF00]/5 border border-[#FFBF00]/10 text-xs text-[#FFBF00]/80 font-medium"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              )}

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
                  {socialLinks.map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {SOCIAL_LINK_OPTIONS.find((s) => s.key === key)?.label ?? key}
                    </a>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-white/20 justify-center md:justify-start">
                <span>{profile.email}</span>
                <span>|</span>
                <span>Membre depuis {formatDate(profile.created_at)}</span>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-medium text-[#FFBF00] bg-[#FFBF00]/5 border border-[#FFBF00]/20 hover:bg-[#FFBF00]/10 hover:border-[#FFBF00]/30 transition-all"
              >
                <Pencil className="w-4 h-4" />
                Modifier le profil
              </button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#FFBF00]" />
                <span className="text-sm font-display font-medium text-white/60">
                  Progression vers niveau {profile.level + 1}
                </span>
              </div>
              <span className="text-sm font-display font-bold text-[#FFBF00]">
                {Math.round(xpProgress)}%
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FFBF00] via-[#FF9D00] to-[#FFBF00]"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${xpProgress}%`,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
              />
            </div>
            <p className="text-xs text-white/20 mt-1">
              {formatXP(xpIntoLevel)} / {formatXP(xpNeeded)} XP
            </p>
          </div>
        </div>
      </motion.div>

      {/* ================================================================== */}
      {/*  STATS GRID                                                        */}
      {/* ================================================================== */}
      <motion.div
        variants={childVariants}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
      >
        {stats.map((stat, index) => {
          const IconComp = stat.icon;
          return (
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
                <IconComp className={cn('w-5 h-5', stat.color)} />
              </div>
              <p className={cn(
                'font-display text-2xl font-bold mb-0.5',
                stat.accent ? 'text-[#FFBF00]' : 'text-white'
              )}>
                {stat.value}
              </p>
              <p className="text-[11px] text-white/30 font-display">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ================================================================== */}
      {/*  BADGE SHOWCASE — Trophy Case                                      */}
      {/* ================================================================== */}
      <motion.div
        variants={childVariants}
        className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/10 border border-[#FFBF00]/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#FFBF00]" />
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            Vitrine de badges
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          <span className="text-xs text-white/30 font-display">
            {badgesEarned} / {allBadges.length}
          </span>
        </div>

        {allBadges.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/30 text-sm font-display">
              Aucun badge disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allBadges.map((badge, index) => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const rarity = BADGE_RARITIES[badge.rarity as keyof typeof BADGE_RARITIES];
              const glowClass = isEarned ? (RARITY_GLOW[badge.rarity] ?? '') : '';
              const borderClass = isEarned
                ? (RARITY_BORDER[badge.rarity] ?? 'border-white/10')
                : 'border-white/5';

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: isEarned ? 1 : 0.4, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={isEarned ? { y: -4, scale: 1.02, transition: { duration: 0.2 } } : undefined}
                  className={cn(
                    'group rounded-2xl border p-4 text-center transition-all duration-300',
                    'bg-black/40 backdrop-blur-sm',
                    borderClass,
                    glowClass,
                    !isEarned && 'grayscale'
                  )}
                >
                  <div
                    className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: isEarned ? `${rarity?.color ?? '#888'}10` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isEarned ? `${rarity?.color ?? '#888'}30` : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.name} className="w-7 h-7" />
                    ) : (
                      <Star
                        className="w-6 h-6"
                        style={{ color: isEarned ? (rarity?.color ?? '#888') : '#333' }}
                      />
                    )}
                  </div>
                  <p className="font-display font-bold text-white text-xs truncate mb-0.5">
                    {badge.name}
                  </p>
                  <p className="text-[10px] font-display font-semibold" style={{ color: isEarned ? (rarity?.color ?? '#888') : '#555' }}>
                    {rarity?.label ?? badge.rarity}
                  </p>
                  {!isEarned && (
                    <p className="text-[10px] text-white/15 mt-1 line-clamp-1">
                      {badge.description}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ================================================================== */}
      {/*  XP HISTORY — Timeline                                             */}
      {/* ================================================================== */}
      <motion.div
        variants={childVariants}
        className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            Historique XP
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {xpEvents.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <Clock className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/30 text-sm font-display">
              Aucun &eacute;v&eacute;nement XP pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {xpEvents.map((event, index) => (
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
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300',
                    event.amount > 0
                      ? 'bg-[#FFBF00]/10 text-[#FFBF00] border border-[#FFBF00]/20'
                      : 'bg-red-400/10 text-red-400 border border-red-400/20'
                  )}>
                    <Star className="w-4 h-4" />
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
            ))}

            {/* Link to see more */}
            <div className="pt-3 text-center">
              <span className="inline-flex items-center gap-1 text-xs text-white/20 font-display">
                Derni&egrave;res 10 actions
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />
    </motion.div>
  );
}
