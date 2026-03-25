'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';
import { LEVEL_TITLES } from '@/lib/constants';

interface MemberRow {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  role: string;
  created_at: string;
  last_active_date: string | null;
}

interface AdminMembersClientProps {
  members: MemberRow[];
}

const ROLES = ['member', 'admin', 'super_admin'] as const;

const ROLE_LABELS: Record<string, string> = {
  member: 'Membre',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const ROLE_COLORS: Record<string, string> = {
  member: 'text-ecs-gray',
  admin: 'text-red-400',
  super_admin: 'text-red-500',
};

export default function AdminMembersClient({ members }: AdminMembersClientProps) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [grantXPForm, setGrantXPForm] = useState<{ memberId: string; amount: number; description: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.display_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  async function handleRoleChange(memberId: string, newRole: string) {
    setActionLoading(memberId);
    try {
      await fetch('/api/admin/members/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  }

  async function handleGrantXP() {
    if (!grantXPForm || grantXPForm.amount <= 0) return;
    setActionLoading(grantXPForm.memberId);
    try {
      await fetch('/api/admin/members/grant-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: grantXPForm.memberId,
          amount: grantXPForm.amount,
          description: grantXPForm.description.trim() || 'Attribution manuelle par admin',
        }),
      });
      setGrantXPForm(null);
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
            Membres
          </h1>
          <p className="text-ecs-gray text-sm">
            {members.length} membre{members.length > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full md:w-96 px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white placeholder:text-ecs-gray/50 outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
        />
      </div>

      {/* Grant XP modal */}
      <AnimatePresence>
        {grantXPForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setGrantXPForm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-ecs w-full max-w-md"
            >
              <h3 className="font-display text-lg font-bold text-white mb-4">
                Attribuer de l&apos;XP
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">Montant XP</label>
                  <input
                    type="number"
                    min={1}
                    value={grantXPForm.amount}
                    onChange={(e) => setGrantXPForm({ ...grantXPForm, amount: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">Description</label>
                  <input
                    type="text"
                    value={grantXPForm.description}
                    onChange={(e) => setGrantXPForm({ ...grantXPForm, description: e.target.value })}
                    placeholder="Raison de l'attribution"
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white placeholder:text-ecs-gray/50 outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGrantXPForm(null)}
                    className="btn-secondary flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleGrantXP}
                    disabled={actionLoading === grantXPForm.memberId || grantXPForm.amount <= 0}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === grantXPForm.memberId ? 'Attribution...' : 'Attribuer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members list */}
      {filteredMembers.length === 0 ? (
        <div className="card-ecs text-center py-12">
          <p className="text-ecs-gray text-sm">Aucun membre trouv&eacute;.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <div key={member.id} className="card-ecs p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-ecs-gray-dark flex items-center justify-center overflow-hidden flex-shrink-0">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-ecs-gray font-display font-bold text-sm">
                      {member.display_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-white text-sm truncate">
                      {member.display_name}
                    </p>
                    <span className={cn('text-xs font-display', ROLE_COLORS[member.role] ?? 'text-ecs-gray')}>
                      {ROLE_LABELS[member.role] ?? member.role}
                    </span>
                  </div>
                  <p className="text-xs text-ecs-gray truncate">{member.email}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs flex-shrink-0">
                  <div className="text-center">
                    <p className="font-display font-bold text-white">{member.level}</p>
                    <p className="text-ecs-gray">Niveau</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-ecs-amber">{formatXP(member.total_xp)}</p>
                    <p className="text-ecs-gray">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-white">{member.current_streak}j</p>
                    <p className="text-ecs-gray">Streak</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase bg-ecs-black-light text-ecs-gray border border-ecs-gray-border hover:text-white transition-colors"
                  >
                    {expandedId === member.id ? 'Fermer' : 'D\u00e9tails'}
                  </button>
                  <button
                    onClick={() => setGrantXPForm({ memberId: member.id, amount: 100, description: '' })}
                    className="px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase bg-ecs-amber/10 text-ecs-amber border border-ecs-amber/20 hover:bg-ecs-amber/20 transition-colors"
                  >
                    +XP
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedId === member.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-ecs-gray-border grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-ecs-gray mb-0.5">Titre</p>
                        <p className="text-sm text-white font-display">{LEVEL_TITLES[member.level] ?? `Niveau ${member.level}`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ecs-gray mb-0.5">Record streak</p>
                        <p className="text-sm text-white font-display">{member.longest_streak} jours</p>
                      </div>
                      <div>
                        <p className="text-xs text-ecs-gray mb-0.5">Membre depuis</p>
                        <p className="text-sm text-white font-display">
                          {new Date(member.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-ecs-gray mb-0.5">Derni&egrave;re activit&eacute;</p>
                        <p className="text-sm text-white font-display">
                          {member.last_active_date
                            ? new Date(member.last_active_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                            : 'Jamais'}
                        </p>
                      </div>
                    </div>

                    {/* Role change */}
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs text-ecs-gray">R&ocirc;le :</span>
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={actionLoading === member.id}
                        className="px-3 py-1.5 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white text-xs outline-none focus:border-ecs-amber/40 transition-colors disabled:opacity-50"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
