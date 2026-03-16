import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const revalidate = 60; // cache for 60s

export async function GET() {
  const supabase = createServiceClient();

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekStartIso = weekStart.toISOString();

  const [
    { data: activeCampaign },
    { count: totalCampaigns },
    { count: totalVolunteers },
    { data: weeklyPinRows },
    { data: topVolunteer },
  ] = await Promise.all([
    // Most recent active/upcoming campaign with volunteer count
    supabase
      .from('campaigns')
      .select('id, name, neighborhood, volunteers_needed, status, campaign_volunteers(count)')
      .in('status', ['active', 'upcoming'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),

    // Total campaigns
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),

    // Total volunteers
    supabase.from('volunteers').select('*', { count: 'exact', head: true }),

    // Flyer pins this week — count + coordinates for map
    supabase
      .from('flyer_pins')
      .select('lat, lng')
      .gte('created_at', weekStartIso)
      .limit(200),

    // Top volunteer this week by weekly_points
    supabase
      .from('volunteers')
      .select('id, name, avatar_url, weekly_points, streak_days')
      .gt('weekly_points', 0)
      .order('weekly_points', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const volunteerCount =
    (activeCampaign as { campaign_volunteers?: { count: number }[] } | null)
      ?.campaign_volunteers?.[0]?.count ?? 0;

  return NextResponse.json({
    activeCampaign: activeCampaign
      ? {
          id: (activeCampaign as Record<string, unknown>).id,
          name: (activeCampaign as Record<string, unknown>).name,
          neighborhood: (activeCampaign as Record<string, unknown>).neighborhood,
          volunteersNeeded: (activeCampaign as Record<string, unknown>).volunteers_needed,
          volunteersJoined: volunteerCount,
          status: (activeCampaign as Record<string, unknown>).status,
        }
      : null,
    stats: {
      totalCampaigns: totalCampaigns ?? 0,
      totalVolunteers: totalVolunteers ?? 0,
      weeklyPins: weeklyPinRows?.length ?? 0,
    },
    weeklyPinCoords: (weeklyPinRows ?? []) as { lat: number; lng: number }[],
    topVolunteer: topVolunteer
      ? {
          name: (topVolunteer as Record<string, unknown>).name,
          weeklyPoints: (topVolunteer as Record<string, unknown>).weekly_points,
          streakDays: (topVolunteer as Record<string, unknown>).streak_days,
        }
      : null,
  });
}
