import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') === 'alltime' ? 'alltime' : 'weekly';
    const campaignId = searchParams.get('campaignId');

    const supabase = createServiceClient();
    const orderColumn = period === 'alltime' ? 'total_points' : 'weekly_points';

    let query = supabase
      .from('volunteers')
      .select('id, name, avatar_url, total_points, weekly_points, level, streak_days')
      .order(orderColumn, { ascending: false })
      .limit(50);

    if (campaignId) {
      const { data: volunteerIds, error: cvError } = await supabase
        .from('campaign_volunteers')
        .select('volunteer_id')
        .eq('campaign_id', campaignId);

      if (cvError) {
        return NextResponse.json(
          { error: 'Failed to fetch campaign volunteers' },
          { status: 500 },
        );
      }

      const ids = volunteerIds?.map((cv) => cv.volunteer_id) ?? [];

      if (ids.length === 0) {
        return NextResponse.json([]);
      }

      query = query.in('id', ids);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch leaderboard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
