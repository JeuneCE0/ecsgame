'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatXP } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  activeToday: number;
  totalXPAwarded: number;
  pendingReviews: number;
}

interface PendingEvent {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  description: string | null;
  verification_status: string;
  created_at: string;
}

interface AdminDashboardClientProps {
  stats: AdminStats;
  pendingEvents: PendingEvent[];
}

const SOURCE_LABELS: Record<string, string> = {
  quest_completion: 'Qu\u00eate',
  call_booked: 'Appel',
  deal_closed: 'Deal',
  lead_generated: 'Lead',
  formation_completed: 'Formation',
  streak_bonus: 'Streak',
  manual_log: 'Manuel',
  referral: 'Parrainage',
  badge_earned: 'Badge',
  admin_grant: 'Admin',
};

export default function AdminDashboardClient({ stats, pendingEvents }: AdminDashboardClientProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function handleApprove(eventId: string) {
    setApprovingId(eventId);
    try {
      await fetch('/api/admin/xp-events/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(eventId: string) {
    setApprovingId(eventId);
    try {
      await fetch('/api/admin/xp-events/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      window.location.reload();
    } catch {
      // Error handled silently
    } finally {
      setApprovingId(null);
    }
  }

  const statCards = [
    { label: 'Utilisateurs totaux', value: String(stats.totalUsers), color: 'text-white' },
    { label: 'Actifs aujourd\u2019hui', value: String(stats.activeToday), color: 'text-green-400' },
    { label: 'XP total attribu\u00e9', value: formatXP(stats.totalXPAwarded), color: 'text-ecs-amber' },
    { label: 'En attente de review', value: String(stats.pendingReviews), color: stats.pendingReviews > 0 ? 'text-red-400' : 'text-white' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Dashboard Admin
        </h1>
        <p className="text-ecs-gray text-sm mb-6">
          Vue d&apos;ensemble de la plateforme.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="card-ecs text-center"
          >
            <p className={cn('font-display text-2xl font-bold', stat.color)}>
              {stat.value}
            </p>
            <p className="text-xs text-ecs-gray mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/quests"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Cr&eacute;er une qu&ecirc;te
        </Link>
      </div>

      {/* Pending reviews */}
      <div className="card-ecs">
        <h2 className="font-display text-lg font-bold text-white mb-4">
          &Eacute;v&eacute;nements XP en attente de review
        </h2>
        {pendingEvents.length === 0 ? (
          <p className="text-ecs-gray text-sm text-center py-6">
            Aucun &eacute;v&eacute;nement en attente.
          </p>
        ) : (
          <div className="space-y-0">
            {pendingEvents.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  'flex flex-col md:flex-row md:items-center gap-3 py-4',
                  index < pendingEvents.length - 1 && 'border-b border-ecs-gray-border'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-display font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                      {SOURCE_LABELS[event.source] ?? event.source}
                    </span>
                    <span className="font-display font-bold text-ecs-amber text-sm">
                      +{formatXP(event.amount)} XP
                    </span>
                  </div>
                  <p className="text-sm text-white truncate">
                    {event.description ?? 'Aucune description'}
                  </p>
                  <p className="text-xs text-ecs-gray">
                    {new Date(event.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(event.id)}
                    disabled={approvingId === event.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20 transition-colors disabled:opacity-50"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(event.id)}
                    disabled={approvingId === event.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20 transition-colors disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
