'use client';

import { useState, useCallback, type FormEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, Sparkles, ChevronDown, FileCheck } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';

const XP_SOURCES = [
  { value: 'call_booked', label: 'Appel booke' },
  { value: 'deal_closed', label: 'Deal conclu' },
  { value: 'lead_generated', label: 'Lead genere' },
  { value: 'formation_completed', label: 'Formation terminee' },
  { value: 'referral', label: 'Parrainage' },
  { value: 'manual_log', label: 'Autre (manuel)' },
] as const;

function GlassInput({
  children,
  isFocused,
}: {
  children: React.ReactNode;
  isFocused: boolean;
}) {
  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-300"
      style={{
        boxShadow: isFocused
          ? '0 0 0 1px rgba(255, 191, 0, 0.4), 0 0 16px rgba(255, 191, 0, 0.1)'
          : '0 0 0 1px rgba(42, 42, 42, 1)',
      }}
    >
      {/* Ambient glow on focus */}
      {isFocused && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 191, 0, 0.04) 0%, transparent 70%)',
          }}
        />
      )}
      {children}
    </div>
  );
}

export function LogXPForm() {
  const addXP = usePlayerStore((s) => s.addXP);

  const [source, setSource] = useState<string>('call_booked');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setProofFile(file);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Le montant doit etre superieur a 0.');
      return;
    }

    setIsLoading(true);

    try {
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

  const inputBaseClass =
    'w-full rounded-xl bg-ecs-black-light px-4 py-3 text-sm text-white placeholder:text-ecs-gray/50 focus:outline-none transition-colors duration-200';

  return (
    <motion.form
      className="relative rounded-2xl overflow-hidden p-6"
      style={{
        background: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 191, 0, 0.06)',
      }}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 191, 0, 0.2), transparent)',
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.12), rgba(255, 157, 0, 0.06))',
            border: '1px solid rgba(255, 191, 0, 0.15)',
          }}
        >
          <Sparkles className="h-5 w-5 text-ecs-amber" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-white">
            Logger de l&apos;XP
          </h3>
          <p className="text-xs text-ecs-gray">Enregistrez votre activite</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Source dropdown */}
        <div className="space-y-2">
          <label
            htmlFor="xp-source"
            className="text-xs font-display uppercase tracking-[0.15em] text-ecs-gray"
          >
            Type d&apos;activite
          </label>
          <GlassInput isFocused={focusedField === 'source'}>
            <div className="relative">
              <select
                id="xp-source"
                className={`${inputBaseClass} appearance-none cursor-pointer pr-10`}
                style={{ background: 'rgba(20, 20, 20, 0.8)' }}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                onFocus={() => setFocusedField('source')}
                onBlur={() => setFocusedField(null)}
              >
                {XP_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ecs-gray pointer-events-none" />
            </div>
          </GlassInput>
        </div>

        {/* Amount input */}
        <div className="space-y-2">
          <label
            htmlFor="xp-amount"
            className="text-xs font-display uppercase tracking-[0.15em] text-ecs-gray"
          >
            Montant XP
          </label>
          <GlassInput isFocused={focusedField === 'amount'}>
            <div className="relative">
              <input
                id="xp-amount"
                type="number"
                min={1}
                placeholder="50"
                className={inputBaseClass}
                style={{ background: 'rgba(20, 20, 20, 0.8)' }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onFocus={() => setFocusedField('amount')}
                onBlur={() => setFocusedField(null)}
                required
              />
              {/* XP unit indicator */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-display font-bold text-ecs-amber/50 pointer-events-none">
                XP
              </span>
            </div>
          </GlassInput>
        </div>

        {/* Description textarea */}
        <div className="space-y-2">
          <label
            htmlFor="xp-description"
            className="text-xs font-display uppercase tracking-[0.15em] text-ecs-gray"
          >
            Description
          </label>
          <GlassInput isFocused={focusedField === 'description'}>
            <textarea
              id="xp-description"
              rows={2}
              placeholder="Decris ton activite..."
              className={`${inputBaseClass} resize-none`}
              style={{ background: 'rgba(20, 20, 20, 0.8)' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
            />
          </GlassInput>
        </div>

        {/* File upload drag zone */}
        <div className="space-y-2">
          <label
            className="text-xs font-display uppercase tracking-[0.15em] text-ecs-gray"
          >
            Preuve (optionnel)
          </label>
          <label
            htmlFor="xp-proof"
            className="block cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-4"
            style={{
              borderColor: isDragging
                ? 'rgba(255, 191, 0, 0.5)'
                : proofFile
                  ? 'rgba(255, 191, 0, 0.3)'
                  : 'rgba(42, 42, 42, 0.8)',
              background: isDragging
                ? 'rgba(255, 191, 0, 0.04)'
                : proofFile
                  ? 'rgba(255, 191, 0, 0.02)'
                  : 'rgba(20, 20, 20, 0.4)',
              boxShadow: isDragging
                ? '0 0 20px rgba(255, 191, 0, 0.1) inset'
                : 'none',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              {proofFile ? (
                <>
                  <FileCheck className="h-6 w-6 text-ecs-amber" />
                  <span className="text-sm text-white font-medium truncate max-w-full">
                    {proofFile.name}
                  </span>
                  <span className="text-[10px] text-ecs-gray uppercase tracking-wider">
                    Fichier selectionne
                  </span>
                </>
              ) : (
                <>
                  <Upload
                    className="h-6 w-6 text-ecs-gray/60"
                    style={isDragging ? { color: '#FFBF00' } : undefined}
                  />
                  <span className="text-sm text-ecs-gray">
                    {isDragging
                      ? 'Deposez le fichier ici'
                      : 'Glisser-deposer ou cliquer'}
                  </span>
                  <span className="text-[10px] text-ecs-gray/50 uppercase tracking-wider">
                    Images, PDF
                  </span>
                </>
              )}
            </div>
            <input
              id="xp-proof"
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-sm text-red-400 font-medium"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          type="submit"
          className="w-full flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wider text-sm px-6 py-3.5 rounded-xl transition-all duration-200"
          style={{
            background: isLoading
              ? 'linear-gradient(135deg, rgba(255, 191, 0, 0.3), rgba(255, 157, 0, 0.2))'
              : 'linear-gradient(135deg, #FFBF00, #FF9D00)',
            color: isLoading ? '#FFBF00' : '#0C0C0C',
            boxShadow: isLoading
              ? 'none'
              : '0 0 20px rgba(255, 191, 0, 0.15), 0 4px 12px rgba(0,0,0,0.3)',
          }}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 0 30px rgba(255, 191, 0, 0.25), 0 6px 16px rgba(0,0,0,0.4)' } : undefined}
          whileTap={!isLoading ? { scale: 0.98 } : undefined}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Soumettre
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
