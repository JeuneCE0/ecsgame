/* ------------------------------------------------------------------ */
/*  Quest Templates — real business actions mapped to game levels      */
/*  Each quest = a concrete action the player does in their real biz   */
/* ------------------------------------------------------------------ */

export interface QuestTemplate {
  readonly title: string;
  readonly description: string;
  readonly xpReward: number;
  readonly source: string;
}

export const QUEST_TEMPLATES = {
  beginner: [
    {
      title: 'Premier message de prospection',
      description: 'Envoie ton premier message à un prospect potentiel',
      xpReward: 50,
      source: 'lead_generated',
    },
    {
      title: 'Définis ton ICP',
      description: 'Écris la description de ton client idéal en 3 phrases',
      xpReward: 30,
      source: 'manual_log',
    },
    {
      title: 'Crée ton pitch',
      description: 'Rédige ton elevator pitch en 30 secondes',
      xpReward: 40,
      source: 'manual_log',
    },
    {
      title: 'Première session de travail',
      description: 'Fais 25 minutes de travail concentré avec le timer',
      xpReward: 25,
      source: 'manual_log',
    },
    {
      title: 'Étudie la concurrence',
      description: 'Analyse 3 concurrents et note ce qui les rend uniques',
      xpReward: 35,
      source: 'manual_log',
    },
  ],
  intermediate: [
    {
      title: 'Call de découverte',
      description: 'Réalise un appel de découverte avec un prospect qualifié',
      xpReward: 75,
      source: 'call_booked',
    },
    {
      title: 'Publie du contenu',
      description: 'Publie un post LinkedIn/Instagram avec un CTA business',
      xpReward: 50,
      source: 'lead_generated',
    },
    {
      title: 'Relance stratégique',
      description: "Relance 5 prospects qui n'ont pas répondu",
      xpReward: 60,
      source: 'lead_generated',
    },
    {
      title: 'Close un deal',
      description: 'Transforme un prospect en client payant',
      xpReward: 150,
      source: 'deal_closed',
    },
  ],
  advanced: [
    {
      title: 'Process documenté',
      description: 'Documente un process de ton business en SOP',
      xpReward: 100,
      source: 'manual_log',
    },
    {
      title: 'Referral obtenu',
      description: "Obtiens une recommandation d'un client satisfait",
      xpReward: 100,
      source: 'referral',
    },
    {
      title: 'Formation terminée',
      description: 'Complete un module de formation entier',
      xpReward: 80,
      source: 'formation_completed',
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/*  Derived types                                                     */
/* ------------------------------------------------------------------ */

export type QuestTier = keyof typeof QUEST_TEMPLATES;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Map a player level to the appropriate quest tier */
export function getQuestTierForLevel(level: number): QuestTier {
  if (level <= 3) return 'beginner';
  if (level <= 6) return 'intermediate';
  return 'advanced';
}

/** Get quest templates appropriate for a given level */
export function getQuestTemplatesForLevel(
  level: number
): readonly QuestTemplate[] {
  const tier = getQuestTierForLevel(level);
  return QUEST_TEMPLATES[tier];
}

/** Get all quest templates across all tiers */
export function getAllQuestTemplates(): readonly QuestTemplate[] {
  return [
    ...QUEST_TEMPLATES.beginner,
    ...QUEST_TEMPLATES.intermediate,
    ...QUEST_TEMPLATES.advanced,
  ];
}
