'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/stores/usePlayerStore';

/* ------------------------------------------------------------------ */
/*  Lead generation data pools                                         */
/* ------------------------------------------------------------------ */

const BUSINESS_PREFIXES = [
  'Boulangerie', 'Restaurant', 'Pizzeria', 'Salon', 'Cabinet',
  'Studio', 'Agence', 'Centre', 'Garage', 'Boutique',
  'Clinique', 'Institut', 'Atelier', 'Soci\u00e9t\u00e9', 'Maison',
  'Caf\u00e9', 'Brasserie', 'Librairie', 'Pharmacie', 'H\u00f4tel',
  'Cr\u00e8che', 'Pressing', 'Fleuriste', 'P\u00e2tisserie', 'Fromagerie',
];

const BUSINESS_NAMES = [
  'Martin', 'Dupont', 'Bernard', 'Petit', 'Durand',
  'Leroy', 'Moreau', 'Simon', 'Laurent', 'Michel',
  'Garcia', 'Thomas', 'Robert', 'Richard', 'Dubois',
  'Morel', 'Fournier', 'Girard', 'Bonnet', 'Lambert',
  'Fontaine', 'Mercier', 'Blanc', 'Robin', 'Faure',
];

const BUSINESS_TYPES = [
  'Restaurant', 'Agence web', 'Comptable', 'Avocat', 'Plombier',
  'Coach sportif', 'Architecte', 'D\u00e9corateur', 'Traiteur', 'Photographe',
  'Consultant RH', 'Garagiste', 'Opticien', 'Dentiste', 'V\u00e9t\u00e9rinaire',
  'Fleuriste', 'Boulanger', 'Coiffeur', 'Esth\u00e9ticienne', 'Kiné',
];

const CITIES = [
  'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille',
  'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier',
  'Rennes', 'Grenoble', 'Rouen', 'Toulon', 'Clermont-Ferrand',
  'Angers', 'Dijon', 'Brest', 'Metz', 'Tours',
  'Limoges', 'Amiens', 'Perpignan', 'Orl\u00e9ans', 'Reims',
];

const EMAIL_DOMAINS = [
  'gmail.com', 'outlook.fr', 'yahoo.fr', 'orange.fr', 'free.fr',
  'hotmail.fr', 'laposte.net', 'sfr.fr', 'wanadoo.fr', 'protonmail.com',
];

/* ------------------------------------------------------------------ */
/*  Lead interface                                                     */
/* ------------------------------------------------------------------ */

export interface Lead {
  id: string;
  businessName: string;
  businessType: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  source: string;
  savedAt: string;
  contacted: boolean;
}

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const LEADS_KEY = 'ecs-game-leads';
const ENERGY_KEY = 'ecs-game-farming-energy';

interface EnergyState {
  remaining: number;
  lastReset: string;
}

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

function getEnergy(prospectionStat: number): EnergyState {
  if (typeof window === 'undefined') return { remaining: 10, lastReset: new Date().toISOString() };

  try {
    const raw = localStorage.getItem(ENERGY_KEY);
    if (!raw) {
      const base = 10 + Math.floor(prospectionStat / 2);
      return { remaining: base, lastReset: new Date().toDateString() };
    }
    const parsed = JSON.parse(raw) as EnergyState;

    // Reset at midnight
    const today = new Date().toDateString();
    if (parsed.lastReset !== today) {
      const base = 10 + Math.floor(prospectionStat / 2);
      return { remaining: base, lastReset: today };
    }
    return parsed;
  } catch {
    const base = 10 + Math.floor(prospectionStat / 2);
    return { remaining: base, lastReset: new Date().toDateString() };
  }
}

function saveEnergy(state: EnergyState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ENERGY_KEY, JSON.stringify(state));
}

/* ------------------------------------------------------------------ */
/*  Generate a lead                                                    */
/* ------------------------------------------------------------------ */

function generateLead(playerLevel: number): Lead {
  const prefix = BUSINESS_PREFIXES[Math.floor(Math.random() * BUSINESS_PREFIXES.length)];
  const name = BUSINESS_NAMES[Math.floor(Math.random() * BUSINESS_NAMES.length)];
  const businessName = `${prefix} ${name}`;
  const businessType = BUSINESS_TYPES[Math.floor(Math.random() * BUSINESS_TYPES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];

  // Phone: 06 or 07
  const phonePrefix = Math.random() > 0.5 ? '06' : '07';
  const phoneDigits = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  const phone = `${phonePrefix} ${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 4)} ${phoneDigits.slice(4, 6)} ${phoneDigits.slice(6, 8)}`;

  // Email from business name
  const emailName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const emailPrefix2 = prefix.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  const email = `${emailPrefix2}.${emailName}@${domain}`;

  // Rating: higher levels get better leads
  const baseRating = Math.min(5, 3 + Math.floor(playerLevel / 5));
  const rating = Math.max(3, baseRating + Math.floor(Math.random() * 2));

  return {
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    businessName,
    businessType,
    city,
    phone,
    email,
    rating: Math.min(5, rating),
    source: 'Google Maps',
    savedAt: new Date().toISOString(),
    contacted: false,
  };
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface FarmingEncounterProps {
  playerLevel: number;
  businessType: string;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FarmingEncounter({ playerLevel, businessType: _businessType, onClose }: FarmingEncounterProps) {
  const addXP = usePlayerStore((s) => s.addXP);
  const stats = usePlayerStore((s) => s.stats);

  const [phase, setPhase] = useState<'flash' | 'encounter' | 'result'>('flash');
  const [resultMessage, setResultMessage] = useState('');
  const closedRef = useRef(false);

  const energy = useMemo(() => getEnergy(stats.prospection), [stats.prospection]);
  const [currentEnergy, setCurrentEnergy] = useState(energy.remaining);

  const lead = useMemo(() => generateLead(playerLevel), [playerLevel]);

  // Flash animation then show encounter
  useEffect(() => {
    const timer = setTimeout(() => setPhase('encounter'), 400);
    return () => clearTimeout(timer);
  }, []);

  // Check energy
  const hasEnergy = currentEnergy > 0;

  const consumeEnergy = useCallback(() => {
    const newEnergy = Math.max(0, currentEnergy - 1);
    setCurrentEnergy(newEnergy);
    saveEnergy({ remaining: newEnergy, lastReset: new Date().toDateString() });
  }, [currentEnergy]);

  const handleContact = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;

    if (!hasEnergy) {
      setResultMessage("Plus d'\u00e9nergie ! Reviens demain.");
      setPhase('result');
      return;
    }

    consumeEnergy();

    // Save lead as contacted
    const contactedLead: Lead = { ...lead, contacted: true };
    const existing = getLeads();
    saveLeads([...existing, contactedLead]);

    // Award XP
    addXP(30, 'call_booked');

    setResultMessage('Lead contact\u00e9 ! +30 XP');
    setPhase('result');
  }, [lead, hasEnergy, consumeEnergy, addXP]);

  const handleSave = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;

    if (!hasEnergy) {
      setResultMessage("Plus d'\u00e9nergie ! Reviens demain.");
      setPhase('result');
      return;
    }

    consumeEnergy();

    // Save lead without contact
    const existing = getLeads();
    saveLeads([...existing, lead]);

    setResultMessage('Lead sauvegard\u00e9 dans ton carnet !');
    setPhase('result');
  }, [lead, hasEnergy, consumeEnergy]);

  const handleSkip = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose]);

  const handleResultClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Star rating display
  const stars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => (i < lead.rating ? '\u2605' : '\u2606')).join('');
  }, [lead.rating]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Flash effect */}
      {phase === 'flash' && (
        <motion.div
          className="absolute inset-0 bg-white z-[101]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Encounter panel */}
      {phase === 'encounter' && (
        <motion.div
          className="relative z-[102] bg-[#0a0a2e] border-2 border-ecs-amber/50 p-5 pixel-art max-w-sm w-full mx-4"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <motion.div
              className="font-pixel text-[14px] text-green-400 mb-1"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              Lead trouv\u00e9 !
            </motion.div>
            <div className="font-pixel text-[8px] text-white/40">
              \u00c9nergie: {currentEnergy} restante{currentEnergy > 1 ? 's' : ''}
            </div>
          </div>

          {/* Lead card */}
          <div className="bg-black/30 border border-white/10 p-3 mb-4 space-y-2">
            <div className="font-pixel text-[11px] text-white">
              {lead.businessName}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-pixel text-[8px] text-ecs-amber bg-ecs-amber/10 px-1.5 py-0.5">
                {lead.businessType}
              </span>
              <span className="font-pixel text-[8px] text-white/60">
                {lead.city}
              </span>
            </div>
            <div className="font-pixel text-[8px] text-white/80">
              Tel: {lead.phone}
            </div>
            <div className="font-pixel text-[8px] text-white/80">
              Email: {lead.email}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[9px] text-yellow-400">
                {stars}
              </span>
              <span className="font-pixel text-[7px] text-white/30">
                Source: {lead.source}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleContact}
              disabled={!hasEnergy}
              className={`w-full font-pixel text-[10px] py-2 px-3 border transition-colors ${
                hasEnergy
                  ? 'text-green-400 border-green-400/50 hover:bg-green-400/10'
                  : 'text-white/30 border-white/10 cursor-not-allowed'
              }`}
            >
              Contacter (+30 XP)
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasEnergy}
              className={`w-full font-pixel text-[10px] py-2 px-3 border transition-colors ${
                hasEnergy
                  ? 'text-blue-400 border-blue-400/50 hover:bg-blue-400/10'
                  : 'text-white/30 border-white/10 cursor-not-allowed'
              }`}
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full font-pixel text-[10px] py-2 px-3 border text-white/40 border-white/10 hover:bg-white/5 transition-colors"
            >
              Passer
            </button>
          </div>
        </motion.div>
      )}

      {/* Result panel */}
      {phase === 'result' && (
        <motion.div
          className="relative z-[102] bg-[#0a0a2e] border-2 border-ecs-amber/50 p-5 pixel-art max-w-xs w-full mx-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="font-pixel text-[11px] text-ecs-amber mb-4">
            {resultMessage}
          </div>
          <button
            type="button"
            onClick={handleResultClose}
            className="font-pixel text-[10px] text-white/60 border border-white/20 px-4 py-2 hover:bg-white/5 transition-colors"
          >
            Continuer
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
