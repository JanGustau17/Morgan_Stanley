'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Trophy, Flame, Calendar } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface LeaderboardVolunteer {
  id: string;
  name: string | null;
  avatar_url: string | null;
  total_points: number;
  weekly_points: number;
  level: number;
  streak_days: number;
}

interface LeaderboardProps {
  initialData: LeaderboardVolunteer[];
  currentUserId: string | null;
  campaigns: { id: string; name: string }[];
}

type Period = 'weekly' | 'alltime';

const POINT_LABELS = [
  { type: 'qr_signup', label: 'Flyer QR scanned', points: 50 },
  { type: 'volunteer_joined', label: 'Volunteer joined your event', points: 25 },
  { type: 'campaign_created', label: 'Created a campaign', points: 10 },
  { type: 'flyer_pinned', label: 'Pinned a flyer location', points: 5 },
  { type: 'report_submitted', label: 'Submitted a report', points: 20 },
  { type: 'new_neighborhood', label: 'New neighborhood reached', points: 50 },
];

function getRankStyle(rank: number) {
  if (rank === 1) return 'text-amber-500';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-amber-700';
  return 'text-gray-500';
}

function getRankBg(rank: number) {
  if (rank === 1) return 'bg-amber-50 border-amber-200';
  if (rank === 2) return 'bg-gray-50 border-gray-200';
  if (rank === 3) return 'bg-orange-50 border-orange-200';
  return 'bg-white border-gray-100';
}

export function Leaderboard({ initialData, currentUserId, campaigns }: LeaderboardProps) {
  const [period, setPeriod] = useState<Period>('weekly');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [data, setData] = useState<LeaderboardVolunteer[]>(initialData);
  const router = useRouter();
  const supabase = createClient();

  async function handleVolunteerClick() {
    const { data: {session} } = await supabase.auth.getSession();
    if (session) {
      router.push('/profile');
    } else {
      router.push('/auth');
    }
  }
  const [isPending, startTransition] = useTransition();

  const fetchLeaderboard = useCallback((p: Period, cId: string | null) => {
    startTransition(async () => {
      const params = new URLSearchParams({ period: p });
      if (cId) params.set('campaignId', cId);
      try {
        const res = await fetch(`/api/leaderboard?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // keep existing data on error
      }
    });
  }, []);

  useEffect(() => {
    fetchLeaderboard(period, selectedCampaignId);
  }, [period, selectedCampaignId, fetchLeaderboard]);

  const currentUser = currentUserId ? data.find((v) => v.id === currentUserId) : null;
  const currentUserRank = currentUserId
    ? data.findIndex((v) => v.id === currentUserId) + 1
    : null;
  const isCurrentUserInTop = currentUserRank !== null && currentUserRank > 0 && currentUserRank <= 50;
  const pointsKey = period === 'alltime' ? 'total_points' : 'weekly_points';

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setPeriod('weekly')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all',
              period === 'weekly'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Calendar className="h-4 w-4" />
            Weekly
          </button>
          <button
            onClick={() => setPeriod('alltime')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all',
              period === 'alltime'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Trophy className="h-4 w-4" />
            All-time
          </button>
        </div>

        {campaigns.length > 0 && (
          <select
            value={selectedCampaignId ?? ''}
            onChange={(e) => setSelectedCampaignId(e.target.value || null)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Leaderboard list */}
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
              Loading...
            </div>
          </div>
        )}

        <div className="space-y-2">
          {data.length === 0 && !isPending && (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
              <Trophy className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No volunteers yet. Be the first!</p>
            </div>
          )}

          {data.map((volunteer, index) => {
            const rank = index + 1;
            const isCurrentUser = volunteer.id === currentUserId;

            return (
              <div
                key={volunteer.id}
                onClick = {handleVolunteerClick}
                className={cn(
                  'group flex items-center gap-4 rounded-xl border px-4 py-3 transition-all hover:shadow-md hover:-translate-y-0.5',
                  isCurrentUser
                    ? 'border-green-300 bg-green-50 ring-1 ring-green-200'
                    : getRankBg(rank),
                )}
              >
                {/* Rank */}
                <div className="flex w-10 shrink-0 items-center justify-center">
                  <span className={cn('text-lg font-bold', getRankStyle(rank))}>
                    {rank}
                  </span>
                </div>

                {/* Avatar */}
                <Avatar src={volunteer.avatar_url} name={volunteer.name} size="md" />

                {/* Name + Level */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'truncate font-semibold',
                      isCurrentUser ? 'text-green-800' : 'text-gray-900',
                    )}>
                      {volunteer.name ?? 'Anonymous'}
                    </span>
                    {isCurrentUser && (
                      <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        You
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5">
                    <LevelBadge level={volunteer.level} size="sm" />
                  </div>
                </div>

                {/* Lemons */}
                <div className="text-right">
                  <div className={cn(
                    'text-lg font-bold tabular-nums',
                    rank <= 3 ? getRankStyle(rank) : 'text-gray-900',
                  )}>
                    {volunteer[pointsKey].toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500"> lemons picked</div>
                </div>

                {/* Streak */}
                {volunteer.streak_days > 0 && (
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
                    <Flame className="h-3.5 w-3.5" />
                    {volunteer.streak_days}d
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pinned current user */}
      {currentUser && !isCurrentUserInTop && (
        <div className="sticky bottom-4">
          <div className="flex items-center gap-4 rounded-xl border-2 border-green-400 bg-green-50 px-4 py-3 shadow-lg">
            <div className="flex w-10 shrink-0 items-center justify-center">
              <span className="text-lg font-bold text-green-700">
                {currentUserRank ?? '—'}
              </span>
            </div>
            <Avatar src={currentUser.avatar_url} name={currentUser.name} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-green-800">
                  {currentUser.name ?? 'Anonymous'}
                </span>
                <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  You
                </span>
              </div>
              <div className="mt-0.5">
                <LevelBadge level={currentUser.level} size="sm" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold tabular-nums text-green-700">
                {currentUser[pointsKey].toLocaleString()}
              </div>
              <div className="text-xs text-green-600"> lemons picked</div>
            </div>
          </div>
        </div>
      )}

      {/* How to earn lemons */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">How to provide lemons</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          {POINT_LABELS.map((item) => (
            <div key={item.type} className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                +{item.points}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}