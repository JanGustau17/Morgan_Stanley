'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streakDays: number;
  className?: string;
}

export function StreakCounter({ streakDays, className }: StreakCounterProps) {
  const hasStreak = streakDays > 0;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Flame
        className={cn(
          'h-5 w-5',
          hasStreak ? 'text-amber-500 animate-pulse' : 'text-gray-400',
        )}
      />
      <span
        className={cn(
          'text-sm font-medium',
          hasStreak ? 'text-amber-700' : 'text-gray-500',
        )}
      >
        {hasStreak ? `${streakDays} day streak` : 'No streak yet'}
      </span>
    </div>
  );
}
