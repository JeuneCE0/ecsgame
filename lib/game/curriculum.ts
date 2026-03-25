/* ------------------------------------------------------------------ */
/*  Business Curriculum — mapped to game levels                       */
/*  Every module = real business competence acquired                  */
/* ------------------------------------------------------------------ */

export interface CurriculumModule {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly lessons: readonly string[];
  readonly xpReward: number;
  readonly unlockLevel: number;
  readonly estimatedMinutes: number;
  readonly actionItem: string;
}

export interface CurriculumPhase {
  readonly name: string;
  readonly levelRange: readonly [number, number];
  readonly modules: readonly CurriculumModule[];
}

export interface ClassBonusModule {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly lessons: readonly string[];
  readonly xpReward: number;
  readonly estimatedMinutes: number;
  readonly actionItem: string;
}

/* ------------------------------------------------------------------ */
/*  Main curriculum — unlocked progressively by level                 */
/* ------------------------------------------------------------------ */

export const BUSINESS_CURRICULUM = {
  // Level 1-3: FOUNDATIONS
  foundations: {
    name: 'Les Fondations',
    levelRange: [1, 3],
    modules: [
      {
        id: 'mindset-101',
        title: "Mindset d'Entrepreneur",
        description:
          'Les 5 croyances qui séparent ceux qui réussissent de ceux qui abandonnent',
        lessons: [
          'Pourquoi 90% des gens échouent (et comment être dans les 10%)',
          'La règle des 1000 jours',
          'Ton premier ennemi : la procrastination',
          'Transformer la peur en carburant',
          'Le pouvoir des habitudes quotidiennes',
        ],
        xpReward: 100,
        unlockLevel: 1,
        estimatedMinutes: 30,
        actionItem: 'Définis ton objectif business à 90 jours',
      },
      {
        id: 'prospection-101',
        title: 'Les Bases de la Prospection',
        description:
          'Comment trouver tes premiers clients même en partant de zéro',
        lessons: [
          'Identifier ton client idéal (ICP)',
          'Les 5 canaux de prospection gratuits',
          'Écrire un message qui obtient des réponses',
          'La méthode des 100 messages par jour',
          'Suivre et relancer sans être lourd',
        ],
        xpReward: 150,
        unlockLevel: 1,
        estimatedMinutes: 45,
        actionItem: "Envoie 10 messages de prospection aujourd'hui",
      },
      {
        id: 'offre-101',
        title: 'Créer une Offre Irrésistible',
        description:
          'Structure ton offre pour que les gens disent OUI sans hésiter',
        lessons: [
          "La formule d'une offre qui se vend",
          'Pricing : comment fixer tes prix',
          "Les 3 niveaux d'offre (Good/Better/Best)",
          "Créer de l'urgence éthique",
          'Ton pitch en 30 secondes',
        ],
        xpReward: 150,
        unlockLevel: 2,
        estimatedMinutes: 40,
        actionItem: 'Écris ton offre en 1 page',
      },
    ],
  },
  // Level 4-6: ACQUISITION
  acquisition: {
    name: "L'Acquisition",
    levelRange: [4, 6],
    modules: [
      {
        id: 'closing-201',
        title: "L'Art du Closing",
        description:
          'Les techniques des meilleurs closers pour transformer un "peut-être" en "oui"',
        lessons: [
          "Les 7 étapes d'un call de vente parfait",
          'Gérer les objections comme un pro',
          'La technique du silence',
          'Closer par message (DM selling)',
          'Le follow-up qui close',
        ],
        xpReward: 200,
        unlockLevel: 4,
        estimatedMinutes: 60,
        actionItem: 'Fais 3 calls de vente cette semaine',
      },
      {
        id: 'content-201',
        title: 'Content Marketing qui Convertit',
        description:
          'Crée du contenu qui attire des clients, pas juste des likes',
        lessons: [
          'La stratégie de contenu en 3 piliers',
          'Écrire des hooks qui arrêtent le scroll',
          'Transformer un post en tunnel de conversion',
          'Repurposer : 1 contenu = 10 formats',
          'Les metrics qui comptent vraiment',
        ],
        xpReward: 200,
        unlockLevel: 5,
        estimatedMinutes: 50,
        actionItem: 'Publie 3 contenus cette semaine avec CTA',
      },
      {
        id: 'network-201',
        title: 'Networking Stratégique',
        description:
          "Construis un réseau qui t'apporte des opportunités chaque semaine",
        lessons: [
          'Les 3 types de contacts à avoir',
          "Comment approcher n'importe qui",
          'La méthode du give-first',
          'Transformer un contact en partenaire',
          'Les événements qui valent le déplacement',
        ],
        xpReward: 175,
        unlockLevel: 5,
        estimatedMinutes: 35,
        actionItem: 'Contacte 5 personnes de ton industrie',
      },
    ],
  },
  // Level 7-9: SCALING
  scaling: {
    name: 'Le Scaling',
    levelRange: [7, 9],
    modules: [
      {
        id: 'systems-301',
        title: 'Systématiser ton Business',
        description:
          'Mets en place les systèmes qui font tourner ton business sans toi',
        lessons: [
          'Les 5 process à automatiser en premier',
          'Créer des SOP (Standard Operating Procedures)',
          'Les outils qui te font gagner 10h/semaine',
          'Déléguer efficacement',
          'Le tableau de bord du CEO',
        ],
        xpReward: 300,
        unlockLevel: 7,
        estimatedMinutes: 60,
        actionItem: 'Documente 1 process de ton business',
      },
      {
        id: 'team-301',
        title: 'Construire ton Équipe',
        description:
          'Recrute, forme et manage une équipe performante',
        lessons: [
          'Quand et qui recruter en premier',
          'Recruter sans budget (freelances, stagiaires, associés)',
          "L'onboarding parfait en 7 jours",
          'Manager sans micro-manager',
          "La culture d'entreprise qui retient les talents",
        ],
        xpReward: 300,
        unlockLevel: 8,
        estimatedMinutes: 55,
        actionItem: 'Identifie le premier poste à recruter',
      },
    ],
  },
  // Level 10-12: MASTERY
  mastery: {
    name: 'La Maîtrise',
    levelRange: [10, 12],
    modules: [
      {
        id: 'revenue-401',
        title: 'Revenus Récurrents & Prédictibles',
        description:
          'Transforme ton business en machine à cash prévisible',
        lessons: [
          'Les 7 modèles de revenus récurrents',
          "Du one-shot à l'abonnement",
          "Lifetime Value vs Coût d'Acquisition",
          'Upsell, cross-sell, downsell',
          'La rétention : le metric le plus important',
        ],
        xpReward: 400,
        unlockLevel: 10,
        estimatedMinutes: 70,
        actionItem: "Crée une offre d'abonnement",
      },
    ],
  },
  // Level 13-15: LEGEND
  legend: {
    name: 'La Légende',
    levelRange: [13, 15],
    modules: [
      {
        id: 'empire-501',
        title: 'Bâtir un Empire',
        description:
          'Les stratégies des entrepreneurs qui construisent des empires durables',
        lessons: [
          'Multi-business : quand et comment diversifier',
          'Lever des fonds vs bootstrapper',
          'M&A : racheter pour grandir',
          'Personal branding de dirigeant',
          "L'héritage : construire quelque chose qui te dépasse",
        ],
        xpReward: 500,
        unlockLevel: 13,
        estimatedMinutes: 90,
        actionItem: 'Définis ta vision à 5 ans',
      },
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Derived type for a single phase key                               */
/* ------------------------------------------------------------------ */

export type CurriculumPhaseKey = keyof typeof BUSINESS_CURRICULUM;

/* ------------------------------------------------------------------ */
/*  Class-specific bonus modules                                      */
/* ------------------------------------------------------------------ */

export const CLASS_CURRICULUM: Record<string, readonly ClassBonusModule[]> = {
  freelance: [
    {
      id: 'freelance-pricing',
      title: 'Fixer ses Prix en Freelance',
      description: 'TJM, forfaits, value-based pricing',
      lessons: [
        'Calculer ton TJM idéal',
        'Passer du temps vendu au forfait',
        'La négociation de prix',
        'Augmenter ses prix sans perdre de clients',
        'Le value-based pricing',
      ],
      xpReward: 150,
      estimatedMinutes: 35,
      actionItem: 'Recalcule ton TJM',
    },
    {
      id: 'freelance-pipeline',
      title: 'Le Pipeline du Freelance',
      description: 'Ne plus jamais manquer de clients',
      lessons: [
        'La règle des 3 sources',
        'Inbound vs Outbound',
        'Les plateformes qui marchent',
        'Le referral system',
        'Anticiper les creux',
      ],
      xpReward: 150,
      estimatedMinutes: 40,
      actionItem: "Mets en place 2 canaux d'acquisition",
    },
  ],
  createur: [
    {
      id: 'createur-audience',
      title: 'Construire une Audience',
      description: 'De 0 à 10K followers qui achètent',
      lessons: [
        'Choisir sa niche',
        'Le calendrier éditorial',
        "L'algorithme est ton ami",
        'Engagement > Followers',
        'Monétiser dès 1000 abonnés',
      ],
      xpReward: 150,
      estimatedMinutes: 40,
      actionItem: 'Planifie 7 jours de contenu',
    },
  ],
  agence: [
    {
      id: 'agence-process',
      title: "Les Process d'Agence",
      description: 'Scaler sans perdre en qualité',
      lessons: [
        'Le delivery framework',
        'Onboarding client en 48h',
        "Les KPIs d'agence",
        'Gérer 10+ clients en même temps',
        'La rentabilité par client',
      ],
      xpReward: 200,
      estimatedMinutes: 50,
      actionItem: "Crée ton process d'onboarding client",
    },
  ],
  coach: [
    {
      id: 'coach-offre',
      title: "L'Offre de Coaching Signature",
      description: "Crée un programme que les clients s'arrachent",
      lessons: [
        'La transformation promise',
        'Structurer un programme de 12 semaines',
        'Le pricing du coaching',
        'Témoignages et résultats',
        'Du 1:1 au groupe',
      ],
      xpReward: 175,
      estimatedMinutes: 45,
      actionItem: 'Structure ton programme signature',
    },
  ],
  ecommerce: [
    {
      id: 'ecom-funnel',
      title: 'Les Funnels E-Commerce',
      description: 'Optimise chaque étape pour maximiser les ventes',
      lessons: [
        'La page produit parfaite',
        'Upsell et order bumps',
        'Email marketing automation',
        'Retargeting rentable',
        'Les metrics e-commerce',
      ],
      xpReward: 175,
      estimatedMinutes: 45,
      actionItem: 'Optimise ta page produit #1',
    },
  ],
  saas: [
    {
      id: 'saas-growth',
      title: 'SaaS Growth Playbook',
      description: 'Les stratégies de croissance SaaS',
      lessons: [
        'Product-led growth',
        'Les metrics SaaS (MRR, churn, LTV)',
        'Onboarding utilisateur',
        'Feature vs Bug prioritization',
        'La boucle virale',
      ],
      xpReward: 200,
      estimatedMinutes: 50,
      actionItem: 'Mesure ton churn rate',
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Get all curriculum modules in a flat array */
export function getAllCurriculumModules(): readonly CurriculumModule[] {
  const phases = Object.values(BUSINESS_CURRICULUM) as readonly CurriculumPhase[];
  return phases.flatMap((phase) => phase.modules);
}

/** Get the current curriculum phase for a given level */
export function getPhaseForLevel(
  level: number
): { key: CurriculumPhaseKey; phase: CurriculumPhase } | null {
  const entries = Object.entries(BUSINESS_CURRICULUM) as [
    CurriculumPhaseKey,
    CurriculumPhase,
  ][];

  for (const [key, phase] of entries) {
    const [min, max] = phase.levelRange;
    if (level >= min && level <= max) {
      return { key, phase };
    }
  }

  // Above max level — return the last phase
  const last = entries[entries.length - 1];
  if (last && level > last[1].levelRange[1]) {
    return { key: last[0], phase: last[1] };
  }

  return null;
}

/** Get modules unlocked at or below the given level */
export function getUnlockedModules(level: number): readonly CurriculumModule[] {
  return getAllCurriculumModules().filter((m) => m.unlockLevel <= level);
}

/** Get modules NOT yet unlocked */
export function getLockedModules(level: number): readonly CurriculumModule[] {
  return getAllCurriculumModules().filter((m) => m.unlockLevel > level);
}

/** Get class-specific bonus modules for a business type */
export function getClassModules(
  businessType: string | null | undefined
): readonly ClassBonusModule[] {
  if (!businessType) return [];
  return CLASS_CURRICULUM[businessType] ?? [];
}
