import type { EventType, LevelInfo } from './types';

export const POINTS: Record<EventType, number> = {
  qr_signup: 50,
  social_signup: 40,
  volunteer_joined: 25,
  campaign_created: 10,
  flyer_pinned: 5,
  report_submitted: 20,
  new_neighborhood: 50,
  streak_bonus: 30,
};

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Seedling', emoji: '🌱', minPoints: 0, maxPoints: 99 },
  { level: 2, name: 'Sprout', emoji: '🍃', minPoints: 100, maxPoints: 299 },
  { level: 3, name: 'Branch', emoji: '🌿', minPoints: 300, maxPoints: 599 },
  { level: 4, name: 'Grower', emoji: '🍋', minPoints: 600, maxPoints: 999 },
  { level: 5, name: 'Lemontree', emoji: '🌳', minPoints: 1000, maxPoints: Infinity },
];

export function getLevelForPoints(points: number): LevelInfo {
  return LEVELS.findLast((l) => points >= l.minPoints) ?? LEVELS[0];
}

export function getProgressToNextLevel(points: number): number {
  const current = getLevelForPoints(points);
  if (current.level === 5) return 100;
  const next = LEVELS[current.level];
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.round((progress / range) * 100);
}
