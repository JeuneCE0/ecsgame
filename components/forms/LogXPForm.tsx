'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Upload } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';

const XP_SOURCES = [
  { value: 'call_booked', label: 'Appel booké' },
  { value: 'deal_closed', label: 'Deal conclu' },
  { value: 'lead_generated', label: 'Lead généré' },
  { value: 'formation_completed', label: 'Formation terminée' },
  { value: 'referral', label: 'Parrainage' },
  { value: 'manual_log', label: 'Autre (manuel)' },
] as const;

export function LogXPForm() {
  const addXP = usePlayerStore((s) => s.addXP);

  const [source, setSource] = useState<string>('call_booked');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Le montant doit être supérieur à 0.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: handle proofFile upload via storage when needed
      const res = await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          amount: numericAmount,
          description: description || undefined,
          proofUrl: undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? 'Erreur lors de la soumission.');
      }

      const sourceLabel = XP_SOURCES.find((s) => s.value === source)?.label ?? source;
      addXP(numericAmount, sourceLabel);

      setAmount('');
      setDescription('');
      setProofFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.form
      className="card-ecs space-y-4"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-display font-bold text-lg text-white">
        Logger de l&apos;XP
      </h3>

      <div className="space-y-1.5">
        <label htmlFor="xp-source" className="text-sm text-ecs-gray">
          Type d&apos;activité
        </label>
        <select
          id="xp-source"
          className="w-full rounded-lg border border-ecs-gray-border bg-ecs-black-light px-3 py-2 text-sm text-white focus:border-ecs-amber/40 focus:outline-none"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {XP_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="xp-amount" className="text-sm text-ecs-gray">
          Montant XP
        </label>
        <input
          id="xp-amount"
          type="number"
          min={1}
          placeholder="50"
          className="w-full rounded-lg border border-ecs-gray-border bg-ecs-black-light px-3 py-2 text-sm text-white focus:border-ecs-amber/40 focus:outline-none"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="xp-description" className="text-sm text-ecs-gray">
          Description
        </label>
        <textarea
          id="xp-description"
          rows={2}
          placeholder="Décris ton activité..."
          className="w-full resize-none rounded-lg border border-ecs-gray-border bg-ecs-black-light px-3 py-2 text-sm text-white focus:border-ecs-amber/40 focus:outline-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="xp-proof" className="text-sm text-ecs-gray">
          Preuve (optionnel)
        </label>
        <label
          htmlFor="xp-proof"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ecs-gray-border px-3 py-3 text-sm text-ecs-gray transition-colors hover:border-ecs-amber/30 hover:text-white"
        >
          <Upload className="h-4 w-4" />
          {proofFile ? proofFile.name : 'Choisir un fichier'}
          <input
            id="xp-proof"
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi...
          </>
        ) : (
          'Soumettre'
        )}
      </button>
    </motion.form>
  );
}
