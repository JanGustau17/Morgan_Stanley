import { Trophy } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { Leaderboard } from '@/components/gamification/Leaderboard';

export const metadata = {
  title: 'Leaderboard | Lemontree Volunteers',
};

export default async function LeaderboardPage() {
  const supabase = createServiceClient();

  const [leaderboardResult, campaignsResult] = await Promise.all([
    supabase
      .from('volunteers')
      .select('id, name, avatar_url, total_points, weekly_points, level, streak_days')
      .order('weekly_points', { ascending: false })
      .limit(50),
    supabase
      .from('campaigns')
      .select('id, name')
      .order('name'),
  ]);

  const initialData = leaderboardResult.data ?? [];
  const campaigns = campaignsResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 pb-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
          <Trophy className="h-6 w-6 text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-sm text-gray-500">
            Top volunteers making a difference
          </p>
        </div>
      </div>

      <Leaderboard
        initialData={initialData}
        currentUserId={null}
        campaigns={campaigns}
      />
    </div>
  );
}