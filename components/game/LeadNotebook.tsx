'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/usePlayerStore';
import type { Lead } from '@/components/game/FarmingEncounter';

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const LEADS_KEY = 'ecs-game-leads';

function getLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

function saveLeads(leads: Lead[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface LeadNotebookProps {
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LeadNotebook({ onClose }: LeadNotebookProps) {
  const addXP = usePlayerStore((s) => s.addXP);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [copied, setCopied] = useState(false);

  // Load leads from localStorage
  useEffect(() => {
    setLeads(getLeads());
  }, []);

  // Available filter values
  const cities = useMemo(() => {
    const set = new Set(leads.map((l) => l.city));
    return Array.from(set).sort();
  }, [leads]);

  const types = useMemo(() => {
    const set = new Set(leads.map((l) => l.businessType));
    return Array.from(set).sort();
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterCity && lead.city !== filterCity) return false;
      if (filterType && lead.businessType !== filterType) return false;
      return true;
    });
  }, [leads, filterCity, filterType]);

  // Contact a lead
  const handleContact = useCallback(
    (leadId: string) => {
      const updated = leads.map((l) => {
        if (l.id === leadId && !l.contacted) {
          addXP(30, 'call_booked');
          return { ...l, contacted: true };
        }
        return l;
      });
      setLeads(updated);
      saveLeads(updated);
    },
    [leads, addXP],
  );

  // Toggle contacted status
  const toggleContacted = useCallback(
    (leadId: string) => {
      const updated = leads.map((l) => {
        if (l.id === leadId) {
          return { ...l, contacted: !l.contacted };
        }
        return l;
      });
      setLeads(updated);
      saveLeads(updated);
    },
    [leads],
  );

  // Export as CSV
  const handleExport = useCallback(() => {
    const header = 'Entreprise,Type,Ville,T\u00e9l\u00e9phone,Email,Note,Contact\u00e9,Date';
    const rows = filteredLeads.map((l) =>
      [
        l.businessName,
        l.businessType,
        l.city,
        l.phone,
        l.email,
        `${l.rating}/5`,
        l.contacted ? 'Oui' : 'Non',
        new Date(l.savedAt).toLocaleDateString('fr-FR'),
      ].join(','),
    );
    const csv = [header, ...rows].join('\n');

    navigator.clipboard.writeText(csv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback: ignore clipboard errors
    });
  }, [filteredLeads]);

  const contactedCount = useMemo(() => leads.filter((l) => l.contacted).length, [leads]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Fermer le carnet"
      />

      {/* Notebook panel */}
      <motion.div
        className="relative z-[101] bg-[#0a0a2e] border-2 border-ecs-amber/50 p-4 pixel-art max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h3 className="font-pixel text-[12px] text-ecs-amber">Carnet de Leads</h3>
            <p className="font-pixel text-[8px] text-white/40 mt-0.5">
              {leads.length} leads &bull; {contactedCount} contact\u00e9s
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="font-pixel text-[8px] text-blue-400 border border-blue-400/30 px-2 py-1 hover:bg-blue-400/10 transition-colors"
            >
              {copied ? 'Copi\u00e9 !' : 'Exporter CSV'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="font-pixel text-[10px] text-white/50 hover:text-white px-2"
              aria-label="Fermer"
            >
              X
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-3 shrink-0 flex-wrap">
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="font-pixel text-[8px] bg-black/50 border border-white/10 text-white/80 px-2 py-1 appearance-none"
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="font-pixel text-[8px] bg-black/50 border border-white/10 text-white/80 px-2 py-1 appearance-none"
          >
            <option value="">Tous les types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {(filterCity || filterType) && (
            <button
              type="button"
              onClick={() => { setFilterCity(''); setFilterType(''); }}
              className="font-pixel text-[7px] text-red-400 hover:text-red-300"
            >
              Effacer filtres
            </button>
          )}
        </div>

        {/* Lead list */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
          {filteredLeads.length === 0 && (
            <div className="text-center py-8">
              <p className="font-pixel text-[10px] text-white/30">
                {leads.length === 0
                  ? 'Aucun lead. Va dans la Zone de Farming !'
                  : 'Aucun lead ne correspond aux filtres.'}
              </p>
            </div>
          )}

          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className={cn(
                'bg-black/30 border p-3 space-y-1.5',
                lead.contacted ? 'border-green-500/20' : 'border-white/10',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[10px] text-white truncate">
                    {lead.businessName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="font-pixel text-[7px] text-ecs-amber bg-ecs-amber/10 px-1 py-0.5">
                      {lead.businessType}
                    </span>
                    <span className="font-pixel text-[7px] text-white/50">
                      {lead.city}
                    </span>
                    <span className="font-pixel text-[7px] text-yellow-400">
                      {Array.from({ length: lead.rating }, () => '\u2605').join('')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {/* Contact button */}
                  {!lead.contacted && (
                    <button
                      type="button"
                      onClick={() => handleContact(lead.id)}
                      className="font-pixel text-[7px] text-green-400 border border-green-400/30 px-1.5 py-0.5 hover:bg-green-400/10 transition-colors"
                    >
                      Contacter
                    </button>
                  )}
                  {/* Contacted checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleContacted(lead.id)}
                    className={cn(
                      'w-4 h-4 border flex items-center justify-center font-pixel text-[8px]',
                      lead.contacted
                        ? 'border-green-400/50 text-green-400 bg-green-400/10'
                        : 'border-white/20 text-transparent hover:border-white/40',
                    )}
                    aria-label={lead.contacted ? 'Marquer non contact\u00e9' : 'Marquer contact\u00e9'}
                  >
                    {lead.contacted ? '\u2713' : ''}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-pixel text-[7px] text-white/60">
                  {lead.phone}
                </span>
                <span className="font-pixel text-[7px] text-white/60 truncate">
                  {lead.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-pixel text-[6px] text-white/20">
                  {new Date(lead.savedAt).toLocaleDateString('fr-FR')}
                </span>
                <span className="font-pixel text-[6px] text-white/20">
                  {lead.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
