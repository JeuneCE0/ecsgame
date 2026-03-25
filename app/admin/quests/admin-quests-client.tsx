'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';

interface QuestRow {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  xp_reward: number;
  required_count: number;
  source_filter: string | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface AdminQuestsClientProps {
  quests: QuestRow[];
}

type FilterType = 'all' | 'daily' | 'weekly' | 'main' | 'special';
type FilterStatus = 'all' | 'active' | 'inactive';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  daily: { label: 'Quotidienne', color: 'text-blue-400' },
  weekly: { label: 'Hebdomadaire', color: 'text-purple-400' },
  main: { label: 'Principale', color: 'text-ecs-amber' },
  special: { label: 'Sp\u00e9ciale', color: 'text-green-400' },
};

const INITIAL_FORM = {
  title: '',
  description: '',
  quest_type: 'daily' as string,
  xp_reward: 50,
  required_count: 1,
  source_filter: '',
  starts_at: '',
  expires_at: '',
};

export default function AdminQuestsClient({ quests }: AdminQuestsClientProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const filteredQuests = quests.filter((q) => {
    if (filterType !== 'all' && q.quest_type !== filterType) return false;
    if (filterStatus === 'active' && !q.is_active) return false;
    if (filterStatus === 'inactive' && q.is_active) return false;
    return true;
  });

  async function handleToggleActive(questId: string, currentActive: boolean) {
    setActionLoading(questId);
    try {
      await fetch('/api/admin/quests/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, is_active: !currentActive }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(questId: string) {
    if (!window.confirm('\u00cates-vous s\u00fbr de vouloir supprimer cette qu\u00eate ?')) return;
    setActionLoading(questId);
    try {
      await fetch('/api/admin/quests/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setCreating(true);
    try {
      await fetch('/api/admin/quests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          quest_type: form.quest_type,
          xp_reward: form.xp_reward,
          required_count: form.required_count,
          source_filter: form.source_filter.trim() || null,
          starts_at: form.starts_at || null,
          expires_at: form.expires_at || null,
        }),
      });
      setShowCreateForm(false);
      setForm(INITIAL_FORM);
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
            Gestion des qu&ecirc;tes
          </h1>
          <p className="text-ecs-gray text-sm">
            {quests.length} qu&ecirc;te{quests.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {showCreateForm ? 'Annuler' : 'Nouvelle qu\u00eate'}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleCreate} className="card-ecs space-y-4">
              <h2 className="font-display text-lg font-bold text-white mb-2">
                Cr&eacute;er une qu&ecirc;te
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">Titre</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white placeholder:text-ecs-gray/50 outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                    placeholder="Titre de la qu\u00eate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">Type</label>
                  <select
                    value={form.quest_type}
                    onChange={(e) => setForm({ ...form, quest_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="main">Principale</option>
                    <option value="special">Sp&eacute;ciale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ecs-gray mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white placeholder:text-ecs-gray/50 outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors resize-none"
                  placeholder="Description de la qu\u00eate"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">R&eacute;compense XP</label>
                  <input
                    type="number"
                    min={1}
                    value={form.xp_reward}
                    onChange={(e) => setForm({ ...form, xp_reward: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">Objectif (count)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.required_count}
                    onChange={(e) => setForm({ ...form, required_count: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">Filtre source</label>
                  <input
                    type="text"
                    value={form.source_filter}
                    onChange={(e) => setForm({ ...form, source_filter: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white placeholder:text-ecs-gray/50 outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                    placeholder="Optionnel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">Date de d&eacute;but</label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ecs-gray mb-1.5">Date d&apos;expiration</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-ecs-black-light border border-ecs-gray-border text-white outline-none focus:border-ecs-amber/40 focus:ring-1 focus:ring-ecs-amber/20 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Cr\u00e9ation...' : 'Cr\u00e9er la qu\u00eate'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-lg bg-ecs-black-light border border-ecs-gray-border">
          {(['all', 'daily', 'weekly', 'main', 'special'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors',
                filterType === type
                  ? 'bg-gradient-amber text-ecs-black'
                  : 'text-ecs-gray hover:text-white'
              )}
            >
              {type === 'all' ? 'Tous' : TYPE_CONFIG[type]?.label ?? type}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-ecs-black-light border border-ecs-gray-border">
          {(['all', 'active', 'inactive'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors',
                filterStatus === status
                  ? 'bg-gradient-amber text-ecs-black'
                  : 'text-ecs-gray hover:text-white'
              )}
            >
              {status === 'all' ? 'Tous' : status === 'active' ? 'Actives' : 'Inactives'}
            </button>
          ))}
        </div>
      </div>

      {/* Quest list */}
      {filteredQuests.length === 0 ? (
        <div className="card-ecs text-center py-12">
          <p className="text-ecs-gray text-sm">Aucune qu&ecirc;te trouv&eacute;e.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredQuests.map((quest) => {
            const typeConfig = TYPE_CONFIG[quest.quest_type];
            return (
              <div
                key={quest.id}
                className={cn(
                  'card-ecs flex flex-col md:flex-row md:items-center gap-3 p-4',
                  !quest.is_active && 'opacity-50'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs font-display font-medium', typeConfig?.color ?? 'text-ecs-gray')}>
                      {typeConfig?.label ?? quest.quest_type}
                    </span>
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-display',
                      quest.is_active
                        ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                        : 'bg-red-400/10 text-red-400 border border-red-400/20'
                    )}>
                      {quest.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="font-display font-bold text-white text-sm truncate">{quest.title}</p>
                  <p className="text-xs text-ecs-gray truncate">{quest.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-ecs-gray flex-shrink-0">
                  <span className="font-display font-bold text-ecs-amber">+{formatXP(quest.xp_reward)} XP</span>
                  <span>&middot;</span>
                  <span>{quest.required_count}x</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(quest.id, quest.is_active)}
                    disabled={actionLoading === quest.id}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase transition-colors disabled:opacity-50',
                      quest.is_active
                        ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 hover:bg-yellow-400/20'
                        : 'bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20'
                    )}
                  >
                    {quest.is_active ? 'D\u00e9sactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleDelete(quest.id)}
                    disabled={actionLoading === quest.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20 transition-colors disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
