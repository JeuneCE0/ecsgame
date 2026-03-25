'use client';

import { type ReactNode } from 'react';
import {
  Handshake,
  Phone,
  UserPlus,
  Trophy,
  GraduationCap,
  Flame,
  PenLine,
  Users,
  Award,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type XPSource =
  | 'deal_closed'
  | 'call_booked'
  | 'lead_generated'
  | 'quest_completion'
  | 'formation_completed'
  | 'streak_bonus'
  | 'manual_log'
  | 'referral'
  | 'badge_earned'
  | 'admin_grant';

type SourceSize = 'sm' | 'md' | 'lg';

interface XPSourceIconProps {
  source: XPSource;
  size?: SourceSize;
  className?: string;
}

interface SourceConfig {
  icon: ReactNode;
  color: string;
  bgColor: string;
  label: string;
}

const sizeConfig: Record<SourceSize, { outer: string; iconSize: string }> = {
  sm: { outer: 'w-6 h-6', iconSize: 'w-3 h-3' },
  md: { outer: 'w-8 h-8', iconSize: 'w-4 h-4' },
  lg: { outer: 'w-10 h-10', iconSize: 'w-5 h-5' },
};

function getSourceConfig(source: XPSource, iconClass: string): SourceConfig {
  const configs: Record<XPSource, SourceConfig> = {
    deal_closed: {
      icon: <Handshake className={iconClass} />,
      color: '#FFD700',
      bgColor: 'rgba(255, 215, 0, 0.15)',
      label: 'Deal conclu',
    },
    call_booked: {
      icon: <Phone className={iconClass} />,
      color: '#22C55E',
      bgColor: 'rgba(34, 197, 94, 0.15)',
      label: 'Appel reserve',
    },
    lead_generated: {
      icon: <UserPlus className={iconClass} />,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      label: 'Lead genere',
    },
    quest_completion: {
      icon: <Trophy className={iconClass} />,
      color: '#FFBF00',
      bgColor: 'rgba(255, 191, 0, 0.15)',
      label: 'Quete terminee',
    },
    formation_completed: {
      icon: <GraduationCap className={iconClass} />,
      color: '#A855F7',
      bgColor: 'rgba(168, 85, 247, 0.15)',
      label: 'Formation terminee',
    },
    streak_bonus: {
      icon: <Flame className={iconClass} />,
      color: '#FF9D00',
      bgColor: 'rgba(255, 157, 0, 0.15)',
      label: 'Bonus streak',
    },
    manual_log: {
      icon: <PenLine className={iconClass} />,
      color: '#888888',
      bgColor: 'rgba(136, 136, 136, 0.15)',
      label: 'Saisie manuelle',
    },
    referral: {
      icon: <Users className={iconClass} />,
      color: '#14B8A6',
      bgColor: 'rgba(20, 184, 166, 0.15)',
      label: 'Parrainage',
    },
    badge_earned: {
      icon: <Award className={iconClass} />,
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.15)',
      label: 'Badge obtenu',
    },
    admin_grant: {
      icon: <Shield className={iconClass} />,
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      label: 'Attribution admin',
    },
  };

  return configs[source];
}

export function XPSourceIcon({ source, size = 'md', className }: XPSourceIconProps) {
  const sizeConf = sizeConfig[size];
  const config = getSourceConfig(source, sizeConf.iconSize);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0',
        sizeConf.outer,
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
      title={config.label}
    >
      {config.icon}
    </div>
  );
}
