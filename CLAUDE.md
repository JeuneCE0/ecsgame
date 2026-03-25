# ECS GAME — The Business Game

## Projet
SaaS gamifié pour entrepreneurs et apporteurs d'affaires.
Produit de Scale Corp Inc Ltd (UK LTD).
Fondateurs : Rudy Bonte (CTO) & Anthony Jonas (CMO).

## Stack
- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS + shadcn/ui + Framer Motion
- Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- Stripe (subscriptions + webhooks)
- Vercel (hosting + auto-deploy)
- Zustand (state) + React Query (server state)
- Resend (emails transactionnels)

## Conventions
- Langue du code : anglais
- Langue de l'UI : français
- Composants : kebab-case pour les fichiers, PascalCase pour les exports
- Pas de `use client` sauf si nécessaire (SSR par défaut)
- Types Supabase générés dans `types/database.ts`
- RLS activé sur toutes les tables sans exception
- Pas de `any`, jamais
- Toujours gérer les erreurs Supabase explicitement
- Animations : Framer Motion pour les transitions, CSS pour les micro-interactions
- Imports : toujours utiliser `@/` (pas de relatif au-delà de 2 niveaux)

## Architecture Clé
- `lib/game/xp-engine.ts` : tout le calcul XP + level-up
- `lib/game/quest-engine.ts` : logique quêtes + progression
- `lib/game/streak-engine.ts` : streaks + bonus
- `lib/game/badge-engine.ts` : attribution automatique
- API Routes : `/api/webhooks/*` pour Stripe + GHL
- Realtime : Supabase Realtime pour le leaderboard

## Patterns
- Server Components par défaut, Client Components pour interactivité
- Server Actions pour les mutations simples
- API Routes pour les webhooks et ops complexes
- Middleware Next.js pour la protection des routes auth
- Zustand stores pour l'état UI (modals, notifications XP)
- React Query pour le cache et la synchro serveur

## Ne fais jamais
- Pas de `console.log` en production (utilise un logger si besoin)
- Pas de données mock/hardcodées sauf seed
- Pas de désactivation de RLS (même temporairement)
- Pas de secrets dans le code (toujours `.env`)
- Pas de `SELECT *` (toujours spécifier les colonnes)
- Pas d'import relatif au-delà de 2 niveaux (utiliser `@/`)
- Pas de `// @ts-ignore` ou `// @ts-expect-error`
- Pas de `as any` pour contourner le typage
