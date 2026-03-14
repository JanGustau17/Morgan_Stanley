'use client';

import { LEVELS, getLevelForPoints, getProgressToNextLevel } from '@/lib/points';
import { cn } from '@/lib/utils';

interface XPBarProps {
  currentPoints: number;
  level: number;
  className?: string;
}

export function XPBar({ currentPoints, level, className }: XPBarProps) {
  const isMaxLevel = level >= 5;
  const progress = getProgressToNextLevel(currentPoints);
  const currentLevel = getLevelForPoints(currentPoints);
  const nextLevel = LEVELS[currentLevel.level] as (typeof LEVELS)[number] | undefined;

  const xpIntoLevel = currentPoints - currentLevel.minPoints;
  const xpNeeded = nextLevel ? nextLevel.minPoints - currentLevel.minPoints : 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500 text-center">
        {isMaxLevel ? (
          <span className="font-semibold text-green-600">MAX LEVEL</span>
        ) : (
          <>
            {xpIntoLevel} / {xpNeeded} XP
          </>
        )}
      </p>
    </div>
  );
}
