export const SCALE_CORP_ORG_ID = '00000000-0000-0000-0000-000000000001';

export const XP_THRESHOLDS = {
  AUTO_VERIFY_MAX: 100,
} as const;

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Recrue',
  2: 'Apprenti',
  3: 'Vendeur',
  4: 'Closer',
  5: 'Négociateur',
  6: 'Business Dev',
  7: 'Rainmaker',
  8: 'Directeur',
  9: 'VP Sales',
  10: 'Partenaire',
  11: 'Associé',
  12: 'CEO',
  13: 'Mogul',
  14: 'Titan',
  15: 'Légende',
};

export const BADGE_RARITIES = {
  common: { label: 'Commun', color: '#888888' },
  rare: { label: 'Rare', color: '#3B82F6' },
  epic: { label: 'Épique', color: '#A855F7' },
  legendary: { label: 'Légendaire', color: '#FFBF00' },
} as const;

export const STREAK_BONUSES: Record<number, number> = {
  3: 10,
  7: 25,
  14: 50,
  30: 100,
};

export const BUSINESS_CLASSES = {
  freelance: {
    id: 'freelance',
    name: 'Freelance',
    emoji: '\u{1F4BB}',
    tagline: "L'ind\u00e9pendant qui forge son propre chemin",
    description: 'Tu vends tes comp\u00e9tences en direct. Ton arme : ton expertise et ta r\u00e9putation.',
    strengths: ['Agilit\u00e9', 'Expertise', 'Libert\u00e9'],
    weaknesses: ['Scalabilit\u00e9', 'Revenus irr\u00e9guliers'],
    bonusXP: 'manual_log',
    bonusPercent: 20,
    color: '#3B82F6',
    quests: ['D\u00e9croche 3 clients ce mois', 'Augmente ton TJM de 10%', 'Cr\u00e9e ton portfolio'],
    stats: { closing: 3, prospection: 2, management: 1, creation: 4, networking: 2 },
  },
  createur: {
    id: 'createur',
    name: 'Cr\u00e9ateur de Contenu',
    emoji: '\u{1F3AC}',
    tagline: "L'influenceur qui transforme l'attention en business",
    description: 'Tu cr\u00e9es du contenu qui attire et convertit. Ton arme : ta communaut\u00e9 et ta cr\u00e9ativit\u00e9.',
    strengths: ['Visibilit\u00e9', 'Communaut\u00e9', 'Cr\u00e9ativit\u00e9'],
    weaknesses: ['Mon\u00e9tisation', 'D\u00e9pendance aux plateformes'],
    bonusXP: 'lead_generated',
    bonusPercent: 20,
    color: '#EC4899',
    quests: ['Poste 5 contenus cette semaine', 'Atteins 1000 vues', 'Convertis 10 followers en leads'],
    stats: { closing: 1, prospection: 4, management: 1, creation: 5, networking: 3 },
  },
  agence: {
    id: 'agence',
    name: 'Agence',
    emoji: '\u{1F3E2}',
    tagline: 'Le b\u00e2tisseur qui construit une machine de guerre',
    description: 'Tu g\u00e8res une \u00e9quipe et des clients. Ton arme : ton organisation et ton leadership.',
    strengths: ['Scalabilit\u00e9', 'Revenus r\u00e9currents', '\u00c9quipe'],
    weaknesses: ['Complexit\u00e9', 'Charges fixes'],
    bonusXP: 'deal_closed',
    bonusPercent: 20,
    color: '#F59E0B',
    quests: ['Recrute un collaborateur', 'Signe un contrat r\u00e9current', 'Mets en place un process'],
    stats: { closing: 4, prospection: 3, management: 5, creation: 2, networking: 3 },
  },
  coach: {
    id: 'coach',
    name: 'Coach / Consultant',
    emoji: '\u{1F3AF}',
    tagline: 'Le mentor qui transforme les vies',
    description: 'Tu accompagnes les autres vers leurs objectifs. Ton arme : ton expertise et ta p\u00e9dagogie.',
    strengths: ['Expertise', 'Marges \u00e9lev\u00e9es', 'Impact'],
    weaknesses: ['Temps = argent', 'Acquisition clients'],
    bonusXP: 'formation_completed',
    bonusPercent: 20,
    color: '#8B5CF6',
    quests: ['Donne ta premi\u00e8re session', 'Cr\u00e9e ton offre signature', 'Obtiens un t\u00e9moignage client'],
    stats: { closing: 3, prospection: 2, management: 2, creation: 3, networking: 5 },
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce',
    emoji: '\u{1F6D2}',
    tagline: 'Le marchand digital qui vend pendant son sommeil',
    description: 'Tu vends des produits en ligne. Ton arme : tes funnels et ton marketing.',
    strengths: ['Automatisation', 'Scalabilit\u00e9', 'Data'],
    weaknesses: ['Concurrence', 'Logistique'],
    bonusXP: 'deal_closed',
    bonusPercent: 20,
    color: '#10B981',
    quests: ['Lance ta premi\u00e8re pub', 'Atteins 10 ventes', 'Optimise ton taux de conversion'],
    stats: { closing: 5, prospection: 4, management: 2, creation: 3, networking: 1 },
  },
  saas: {
    id: 'saas',
    name: 'SaaS / Tech',
    emoji: '\u{1F680}',
    tagline: "L'innovateur qui automatise le monde",
    description: 'Tu construis un produit tech. Ton arme : ton produit et tes m\u00e9triques.',
    strengths: ['Revenus r\u00e9currents', 'Scalabilit\u00e9 infinie', 'Innovation'],
    weaknesses: ['Temps de d\u00e9veloppement', 'Co\u00fbt initial'],
    bonusXP: 'referral',
    bonusPercent: 20,
    color: '#06B6D4',
    quests: ['Trouve tes 10 premiers users', 'Atteins le product-market fit', 'Lance ta beta'],
    stats: { closing: 2, prospection: 3, management: 3, creation: 5, networking: 4 },
  },
} as const;

export type BusinessClassId = keyof typeof BUSINESS_CLASSES;

export const SHOP_CATEGORIES = {
  formations: {
    id: 'formations',
    name: 'Formations',
    emoji: '📚',
    description: 'Investis dans tes compétences',
  },
  boosts: {
    id: 'boosts',
    name: 'Boosts',
    emoji: '⚡',
    description: 'Accélère ta progression',
  },
  cosmetics: {
    id: 'cosmetics',
    name: 'Cosmétiques',
    emoji: '✨',
    description: 'Personnalise ton profil',
  },
  services: {
    id: 'services',
    name: 'Services',
    emoji: '🎯',
    description: 'Accède à des services exclusifs',
  },
} as const;

export type ShopCategoryId = keyof typeof SHOP_CATEGORIES;

export const SHOP_ITEMS = {
  // FORMATIONS (paid with XP or money)
  formations: [
    { id: 'f1', name: 'Masterclass Closing', description: 'Les techniques avancées des top 1% closers. 2h de contenu vidéo + exercices pratiques.', price_xp: 500, price_eur: 47, category: 'formations', rarity: 'rare', image_emoji: '🎯', stats_boost: { closing: +2 }, duration: '2h', lessons: 8 },
    { id: 'f2', name: 'Prospection Machine', description: 'Génère 50+ leads/semaine en automatique. Templates + workflows inclus.', price_xp: 750, price_eur: 97, category: 'formations', rarity: 'epic', image_emoji: '📞', stats_boost: { prospection: +3 }, duration: '3h', lessons: 12 },
    { id: 'f3', name: 'Personal Branding Mastery', description: 'Construis une marque personnelle qui attire les clients. De 0 à 10K followers.', price_xp: 600, price_eur: 67, category: 'formations', rarity: 'rare', image_emoji: '🎬', stats_boost: { creation: +2, networking: +1 }, duration: '2h30', lessons: 10 },
    { id: 'f4', name: 'Scaling Secrets', description: 'Passe de freelance à agence. Process, recrutement, management.', price_xp: 1000, price_eur: 147, category: 'formations', rarity: 'epic', image_emoji: '🚀', stats_boost: { management: +3 }, duration: '4h', lessons: 15 },
    { id: 'f5', name: 'Mindset Millionnaire', description: 'La psychologie des entrepreneurs qui réussissent. Reprogramme ton cerveau pour le succès.', price_xp: 400, price_eur: 37, category: 'formations', rarity: 'common', image_emoji: '🧠', stats_boost: { closing: +1, prospection: +1 }, duration: '1h30', lessons: 6 },
  ],
  // BOOSTS (XP only)
  boosts: [
    { id: 'b1', name: 'Double XP (1h)', description: 'Toutes tes actions rapportent le double d\'XP pendant 1 heure.', price_xp: 200, category: 'boosts', rarity: 'common', image_emoji: '⚡', effect: 'double_xp', duration: '1h' },
    { id: 'b2', name: 'Double XP (24h)', description: '24 heures de double XP. Idéal pour une journée de hustle.', price_xp: 500, category: 'boosts', rarity: 'rare', image_emoji: '🔥', effect: 'double_xp_24h', duration: '24h' },
    { id: 'b3', name: 'Boost Prospection', description: '+50% XP sur toutes les actions de prospection pendant 24h.', price_xp: 300, category: 'boosts', rarity: 'rare', image_emoji: '📞', effect: 'boost_prospection', duration: '24h' },
    { id: 'b4', name: 'Boost Closing', description: '+50% XP sur tous les deals closés pendant 24h.', price_xp: 300, category: 'boosts', rarity: 'rare', image_emoji: '🤝', effect: 'boost_closing', duration: '24h' },
    { id: 'b5', name: 'Bouclier de Streak', description: 'Protège ton streak pendant 1 jour. Tu ne perdras pas ton streak même sans activité.', price_xp: 150, category: 'boosts', rarity: 'common', image_emoji: '🛡️', effect: 'streak_shield', duration: '24h' },
    { id: 'b6', name: 'Skip de Boss', description: 'Passe un boss event sans le combattre. Garde quand même les récompenses.', price_xp: 400, category: 'boosts', rarity: 'epic', image_emoji: '⏭️', effect: 'boss_skip', duration: 'instant' },
  ],
  // COSMETICS (XP only)
  cosmetics: [
    { id: 'c1', name: 'Cadre Doré', description: 'Un cadre doré autour de ton avatar dans le classement.', price_xp: 300, category: 'cosmetics', rarity: 'rare', image_emoji: '🖼️' },
    { id: 'c2', name: 'Titre "Hustler"', description: 'Affiche le titre "Hustler" sous ton nom.', price_xp: 200, category: 'cosmetics', rarity: 'common', image_emoji: '🏷️' },
    { id: 'c3', name: 'Titre "CEO"', description: 'Affiche le titre "CEO" sous ton nom. Niveau 10+ requis.', price_xp: 800, category: 'cosmetics', rarity: 'epic', image_emoji: '👑', min_level: 10 },
    { id: 'c4', name: 'Effet Flamme', description: 'Des flammes animées autour de ton avatar.', price_xp: 500, category: 'cosmetics', rarity: 'epic', image_emoji: '🔥' },
    { id: 'c5', name: 'Effet Légendaire', description: 'Aura dorée autour de ton avatar. Le flex ultime.', price_xp: 2000, category: 'cosmetics', rarity: 'legendary', image_emoji: '✨', min_level: 12 },
  ],
  // SERVICES (real money or high XP)
  services: [
    { id: 's1', name: 'Coaching 1:1 (30min)', description: '30 minutes avec un mentor Scale Corp. Stratégie personnalisée pour ton business.', price_xp: 1500, price_eur: 97, category: 'services', rarity: 'epic', image_emoji: '🎯' },
    { id: 's2', name: 'Audit Business', description: 'Analyse complète de ton business avec recommandations actionnables.', price_xp: 2000, price_eur: 197, category: 'services', rarity: 'legendary', image_emoji: '📊' },
    { id: 's3', name: 'Accès Communauté VIP', description: 'Rejoins le groupe privé des top players. Networking exclusif.', price_xp: 1000, price_eur: 47, category: 'services', rarity: 'rare', image_emoji: '👥' },
    { id: 's4', name: 'Template Pack Pro', description: 'Scripts de vente, templates d\'emails, modèles de contrats — tout prêt à l\'emploi.', price_xp: 600, price_eur: 27, category: 'services', rarity: 'rare', image_emoji: '📋' },
  ],
} as const;

export type ShopFormationItem = (typeof SHOP_ITEMS.formations)[number];
export type ShopBoostItem = (typeof SHOP_ITEMS.boosts)[number];
export type ShopCosmeticItem = (typeof SHOP_ITEMS.cosmetics)[number];
export type ShopServiceItem = (typeof SHOP_ITEMS.services)[number];
export type ShopItem = ShopFormationItem | ShopBoostItem | ShopCosmeticItem | ShopServiceItem;

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/quests', label: 'Quêtes', icon: 'Sword' },
  { href: '/dashboard/leaderboard', label: 'Classement', icon: 'Trophy' },
  { href: '/dashboard/formations', label: 'Formations', icon: 'GraduationCap' },
  { href: '/dashboard/rewards', label: 'Récompenses', icon: 'Gift' },
  { href: '/dashboard/timer', label: 'Timer', icon: 'Timer' },
  { href: '/dashboard/profile', label: 'Profil', icon: 'User' },
] as const;
