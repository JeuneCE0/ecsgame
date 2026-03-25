// Each stat affects specific gameplay mechanics

export interface PlayerStats {
  closing: number;    // 0-10
  prospection: number;
  management: number;
  creation: number;
  networking: number;
}

// Base stats from class + earned from actions
// Every 10 deals closed = +1 closing
// Every 20 leads generated = +1 prospection
// Every 5 formations completed = +1 management
// Every 30 content posts = +1 creation
// Every 5 referrals = +1 networking

export function calculateStats(classStats: PlayerStats, actionCounts: Record<string, number>): PlayerStats {
  return {
    closing: classStats.closing + Math.floor((actionCounts.deal_closed || 0) / 10),
    prospection: classStats.prospection + Math.floor((actionCounts.lead_generated || 0) / 20) + Math.floor((actionCounts.call_booked || 0) / 15),
    management: classStats.management + Math.floor((actionCounts.formation_completed || 0) / 5),
    creation: classStats.creation + Math.floor((actionCounts.manual_log || 0) / 30),
    networking: classStats.networking + Math.floor((actionCounts.referral || 0) / 5),
  };
}

// WHAT EACH STAT DOES:

// CLOSING (affects deal XP)
// Each point = +5% XP on deal_closed
// At 5+: unlock "Négociateur" quest line
// At 8+: unlock "Closer d'Élite" title
// At 10: "Légende du Closing" badge

// PROSPECTION (affects lead XP)
// Each point = +5% XP on lead_generated and call_booked
// At 5+: daily quest slots +1
// At 8+: unlock auto-verify on prospection XP (no review needed)
// At 10: "Machine à Leads" badge

// MANAGEMENT (affects quest efficiency)
// Each point = -3% quest completion requirement (rounded)
// Example: quest requires 10 actions, with management 5 → requires 9
// At 5+: unlock team features
// At 8+: unlock delegation (complete quests faster)
// At 10: "CEO" badge

// CREATION (affects content XP)
// Each point = +5% XP on manual_log (content creation logs)
// At 5+: unlock premium cosmetics in shop
// At 8+: featured in community
// At 10: "Influenceur" badge

// NETWORKING (affects social features)
// Each point = +5% XP on referral
// At 3+: unlock direct messages
// At 5+: +2 friend slots, unlock team battles
// At 8+: unlock VIP chat rooms
// At 10: "Connecteur" badge

export function getXPMultiplier(stats: PlayerStats, source: string): number {
  let multiplier = 1.0;

  switch (source) {
    case 'deal_closed':
      multiplier += stats.closing * 0.05;
      break;
    case 'lead_generated':
    case 'call_booked':
      multiplier += stats.prospection * 0.05;
      break;
    case 'manual_log':
      multiplier += stats.creation * 0.05;
      break;
    case 'referral':
      multiplier += stats.networking * 0.05;
      break;
    case 'formation_completed':
      multiplier += stats.management * 0.05;
      break;
  }

  return multiplier;
}

export function getQuestReduction(managementStat: number): number {
  // Each management point reduces quest requirements by 3%
  return Math.min(0.30, managementStat * 0.03); // Cap at 30%
}

export function getUnlockedFeatures(stats: PlayerStats): string[] {
  const features: string[] = [];

  if (stats.closing >= 5) features.push('negociateur_quests');
  if (stats.closing >= 8) features.push('closer_elite_title');
  if (stats.closing >= 10) features.push('closing_legend_badge');

  if (stats.prospection >= 5) features.push('extra_daily_quest');
  if (stats.prospection >= 8) features.push('auto_verify_prospection');
  if (stats.prospection >= 10) features.push('lead_machine_badge');

  if (stats.management >= 5) features.push('team_features');
  if (stats.management >= 8) features.push('delegation');
  if (stats.management >= 10) features.push('ceo_badge');

  if (stats.creation >= 5) features.push('premium_cosmetics');
  if (stats.creation >= 8) features.push('community_featured');
  if (stats.creation >= 10) features.push('influencer_badge');

  if (stats.networking >= 3) features.push('direct_messages');
  if (stats.networking >= 5) features.push('team_battles');
  if (stats.networking >= 8) features.push('vip_chat');
  if (stats.networking >= 10) features.push('connector_badge');

  return features;
}

// All possible features with their stat requirements
export const ALL_FEATURES = [
  { id: 'negociateur_quests', stat: 'closing' as const, level: 5, label: 'Quetes Negociateur' },
  { id: 'closer_elite_title', stat: 'closing' as const, level: 8, label: 'Titre Closer d\'Elite' },
  { id: 'closing_legend_badge', stat: 'closing' as const, level: 10, label: 'Badge Legende du Closing' },
  { id: 'extra_daily_quest', stat: 'prospection' as const, level: 5, label: '+1 Quete quotidienne' },
  { id: 'auto_verify_prospection', stat: 'prospection' as const, level: 8, label: 'Auto-validation prospection' },
  { id: 'lead_machine_badge', stat: 'prospection' as const, level: 10, label: 'Badge Machine a Leads' },
  { id: 'team_features', stat: 'management' as const, level: 5, label: 'Features equipe' },
  { id: 'delegation', stat: 'management' as const, level: 8, label: 'Delegation' },
  { id: 'ceo_badge', stat: 'management' as const, level: 10, label: 'Badge CEO' },
  { id: 'premium_cosmetics', stat: 'creation' as const, level: 5, label: 'Cosmetiques premium' },
  { id: 'community_featured', stat: 'creation' as const, level: 8, label: 'Mis en avant communaute' },
  { id: 'influencer_badge', stat: 'creation' as const, level: 10, label: 'Badge Influenceur' },
  { id: 'direct_messages', stat: 'networking' as const, level: 3, label: 'Messages directs' },
  { id: 'team_battles', stat: 'networking' as const, level: 5, label: 'Batailles d\'equipe' },
  { id: 'vip_chat', stat: 'networking' as const, level: 8, label: 'Chat VIP' },
  { id: 'connector_badge', stat: 'networking' as const, level: 10, label: 'Badge Connecteur' },
] as const;

// Stat descriptions for UI
export const STAT_INFO = {
  closing: {
    name: 'Closing',
    emoji: '\u{1F91D}',
    description: 'Ta capacit\u00e9 \u00e0 closer des deals',
    effect: '+5% XP par point sur les deals',
    color: '#F59E0B',
    milestones: [
      { level: 5, reward: 'Qu\u00eates N\u00e9gociateur d\u00e9bloqu\u00e9es' },
      { level: 8, reward: 'Titre "Closer d\'\u00c9lite"' },
      { level: 10, reward: 'Badge L\u00e9gende du Closing' },
    ],
  },
  prospection: {
    name: 'Prospection',
    emoji: '\u{1F4DE}',
    description: 'Ta capacit\u00e9 \u00e0 g\u00e9n\u00e9rer des leads',
    effect: '+5% XP par point sur les leads et calls',
    color: '#3B82F6',
    milestones: [
      { level: 5, reward: '+1 qu\u00eate quotidienne' },
      { level: 8, reward: 'Auto-validation des XP prospection' },
      { level: 10, reward: 'Badge Machine \u00e0 Leads' },
    ],
  },
  management: {
    name: 'Management',
    emoji: '\u{1F4CA}',
    description: 'Ta capacit\u00e9 \u00e0 g\u00e9rer et organiser',
    effect: '-3% requis par point sur les qu\u00eates',
    color: '#8B5CF6',
    milestones: [
      { level: 5, reward: 'Features \u00e9quipe d\u00e9bloqu\u00e9es' },
      { level: 8, reward: 'D\u00e9l\u00e9gation (qu\u00eates plus rapides)' },
      { level: 10, reward: 'Badge CEO' },
    ],
  },
  creation: {
    name: 'Cr\u00e9ation',
    emoji: '\u{1F3AC}',
    description: 'Ta capacit\u00e9 \u00e0 cr\u00e9er du contenu',
    effect: '+5% XP par point sur la cr\u00e9ation',
    color: '#EC4899',
    milestones: [
      { level: 5, reward: 'Cosm\u00e9tiques premium d\u00e9bloqu\u00e9s' },
      { level: 8, reward: 'Mis en avant dans la communaut\u00e9' },
      { level: 10, reward: 'Badge Influenceur' },
    ],
  },
  networking: {
    name: 'Networking',
    emoji: '\u{1F310}',
    description: 'Ta capacit\u00e9 \u00e0 r\u00e9seauter',
    effect: '+5% XP par point sur les referrals',
    color: '#06B6D4',
    milestones: [
      { level: 3, reward: 'Messages directs d\u00e9bloqu\u00e9s' },
      { level: 5, reward: 'Batailles d\'\u00e9quipe + amis' },
      { level: 8, reward: 'Chat VIP' },
      { level: 10, reward: 'Badge Connecteur' },
    ],
  },
} as const;

export type StatKey = keyof PlayerStats;

// Progress toward next stat point for each stat
export interface StatProgress {
  stat: StatKey;
  current: number;
  required: number;
  actionLabel: string;
}

export function getStatProgress(actionCounts: Record<string, number>): StatProgress[] {
  return [
    {
      stat: 'closing',
      current: (actionCounts.deal_closed || 0) % 10,
      required: 10,
      actionLabel: 'deals',
    },
    {
      stat: 'prospection',
      current: (actionCounts.lead_generated || 0) % 20,
      required: 20,
      actionLabel: 'leads',
    },
    {
      stat: 'management',
      current: (actionCounts.formation_completed || 0) % 5,
      required: 5,
      actionLabel: 'formations',
    },
    {
      stat: 'creation',
      current: (actionCounts.manual_log || 0) % 30,
      required: 30,
      actionLabel: 'posts',
    },
    {
      stat: 'networking',
      current: (actionCounts.referral || 0) % 5,
      required: 5,
      actionLabel: 'referrals',
    },
  ];
}
