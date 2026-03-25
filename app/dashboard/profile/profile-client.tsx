'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';
import { LEVEL_TITLES, BADGE_RARITIES } from '@/lib/constants';

interface ProfileData {
  id: string;
  display_name: string;
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

export default function ProfileClient({
  profile,
  badges,
  xpEvents,
  questsCompleted,
  badgesEarned,
}: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.display_name);
  const [saving, setSaving] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;

    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: editName.trim() }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    { label: 'XP Total', value: formatXP(profile.total_xp), accent: true },
    { label: 'Niveau', value: String(profile.level), accent: false },
    { label: 'Record streak', value: `${profile.longest_streak}j`, accent: false },
    { label: 'Qu\u00eates termin\u00e9es', value: String(questsCompleted), accent: false },
    { label: 'Badges obtenus', value: String(badgesEarned), accent: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-ecs"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-ecs-gray-dark flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-ecs-amber/30">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-display font-bold text-ecs-amber">
                {profile.display_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="font-display text-2xl font-bold text-white">
                {profile.display_name}
              </h1>
              <span className="badge-level mx-auto md:mx-0">
                Niv. {profile.level} &middot; {LEVEL_TITLES[profile.level] ?? `Niveau ${profile.level}`}
              </span>
            </div>
            <p className="text-ecs-gray text-sm mb-1">{profile.email}</p>
            <p className="text-ecs-gray text-xs">
              Membre depuis {formatDate(profile.created_at)}
            </p>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-3 text-sm text-ecs-amber hover:text-ecs-orange transition-colors font-display font-medium"
            >
              {isEditing ? 'Annuler' : 'Modifier le profil'}
            </button>
          </div>
        </div>

        {/* Edit form */}
        {isEditing && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-ecs-gray-border"
          >
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-ecs-gray mb-1.5">
                  Nom d&apos;affichage
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white placeholder:text-ecs-gray/50 outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !editName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card-ecs text-center"
          >
            <p className={cn(
              'font-display text-2xl font-bold',
              stat.accent ? 'text-ecs-amber' : 'text-white'
            )}>
              {stat.value}
            </p>
            <p className="text-xs text-ecs-gray mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-ecs"
      >
        <h2 className="font-display text-lg font-bold text-white mb-4">
          Badges
        </h2>
        {badges.length === 0 ? (
          <p className="text-ecs-gray text-sm text-center py-6">
            Aucun badge obtenu pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map((ub) => {
              const rarity = BADGE_RARITIES[ub.badge.rarity as keyof typeof BADGE_RARITIES];
              return (
                <div
                  key={ub.id}
                  className="rounded-lg border border-ecs-gray-border p-4 text-center bg-ecs-black-light hover:border-ecs-amber/20 transition-colors"
                >
                  <div
                    className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${rarity?.color ?? '#888'}15`, borderColor: `${rarity?.color ?? '#888'}30` }}
                  >
                    {ub.badge.icon_url ? (
                      <img src={ub.badge.icon_url} alt={ub.badge.name} className="w-7 h-7" />
                    ) : (
                      <svg className="w-6 h-6" style={{ color: rarity?.color ?? '#888' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    )}
                  </div>
                  <p className="font-display font-bold text-white text-sm truncate">{ub.badge.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: rarity?.color ?? '#888' }}>
                    {rarity?.label ?? ub.badge.rarity}
                  </p>
                  <p className="text-xs text-ecs-gray mt-1 line-clamp-2">{ub.badge.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* XP History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="card-ecs"
      >
        <h2 className="font-display text-lg font-bold text-white mb-4">
          Historique XP
        </h2>
        {xpEvents.length === 0 ? (
          <p className="text-ecs-gray text-sm text-center py-6">
            Aucun &eacute;v&eacute;nement XP pour le moment.
          </p>
        ) : (
          <div className="space-y-0">
            {xpEvents.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  'flex items-center gap-4 py-3',
                  index < xpEvents.length - 1 && 'border-b border-ecs-gray-border'
                )}
              >
                {/* Timeline dot */}
                <div className="flex-shrink-0 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-ecs-amber/60" />
                  {index < xpEvents.length - 1 && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-6 bg-ecs-gray-border" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium truncate">
                      {event.description ?? SOURCE_LABELS[event.source] ?? event.source}
                    </span>
                    {event.verification_status === 'pending_review' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-display bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                        En attente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ecs-gray">
                    {formatRelativeDate(event.created_at)}
                  </p>
                </div>

                <span className={cn(
                  'font-display font-bold text-sm flex-shrink-0',
                  event.amount > 0 ? 'text-ecs-amber' : 'text-red-400'
                )}>
                  {event.amount > 0 ? '+' : ''}{formatXP(event.amount)} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
