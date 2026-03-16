import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'level'
  | 'trusted'
  | 'verified'
  | 'warning'
  | 'active'
  | 'upcoming'
  | 'completed';

export type BadgeSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<BadgeVariant, string> = {
  level:     'bg-green-100 text-green-800 border border-green-200',
  trusted:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  verified:  'bg-green-50 text-green-700 border border-green-200',
  warning:   'bg-amber-50 text-amber-700 border border-amber-200',
  active:    'bg-green-100 text-green-800 border border-green-200',
  upcoming:  'bg-amber-100 text-amber-800 border border-amber-200',
  completed: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
};

interface StatusBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

export function StatusBadge({
  variant = 'active',
  size = 'sm',
  icon,
  label,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {icon !== undefined && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
