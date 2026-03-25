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

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/quests', label: 'Quêtes', icon: 'Sword' },
  { href: '/dashboard/leaderboard', label: 'Classement', icon: 'Trophy' },
  { href: '/dashboard/formations', label: 'Formations', icon: 'GraduationCap' },
  { href: '/dashboard/rewards', label: 'Récompenses', icon: 'Gift' },
  { href: '/dashboard/timer', label: 'Timer', icon: 'Timer' },
  { href: '/dashboard/profile', label: 'Profil', icon: 'User' },
] as const;
