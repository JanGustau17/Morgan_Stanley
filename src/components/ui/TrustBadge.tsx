'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type BadgeType = 'verified' | 'top-volunteer' | 'seedling' | 'sprout' | 'branch' | 'grower' | 'lemontree';

const badgeConfig: Record<BadgeType, { icon: string; label: string; bg: string; text: string; border: string }> = {
  verified: {
    icon: '✔',
    label: 'Verified Organizer',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  'top-volunteer': {
    icon: '⭐',
    label: 'Top Volunteer',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  seedling: {
    icon: '🌱',
    label: 'Seedling',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  sprout: {
    icon: '🍃',
    label: 'Sprout',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  branch: {
    icon: '🌿',
    label: 'Branch',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  grower: {
    icon: '🍋',
    label: 'Grower',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  lemontree: {
    icon: '🌳',
    label: 'Lemontree',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
  },
};

interface TrustBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export function TrustBadge({ type, size = 'md', className, animate = true }: TrustBadgeProps) {
  const config = badgeConfig[type];
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const badge = (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        config.bg,
        config.text,
        config.border,
        sizeStyles[size],
        className,
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );

  if (!animate) return badge;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-flex"
    >
      {badge}
    </motion.span>
  );
}

interface TrustSignalsProps {
  isVerified?: boolean;
  isTopVolunteer?: boolean;
  level?: number;
  className?: string;
}

const levelToBadgeType: Record<number, BadgeType> = {
  1: 'seedling',
  2: 'sprout',
  3: 'branch',
  4: 'grower',
  5: 'lemontree',
};

export function TrustSignals({ isVerified, isTopVolunteer, level, className }: TrustSignalsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {isVerified && <TrustBadge type="verified" size="sm" />}
      {isTopVolunteer && <TrustBadge type="top-volunteer" size="sm" />}
      {level && levelToBadgeType[level] && (
        <TrustBadge type={levelToBadgeType[level]} size="sm" />
      )}
    </div>
  );
}
