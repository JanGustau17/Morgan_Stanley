import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const revalidate = 60; // cache for 60s

interface CampaignRow {
  id: string;
  name: string | null;
  neighborhood: string | null;
  volunteers_needed: number;
  status: string;
  campaign_volunteers: { count: number }[];
}

interface TopVolunteerRow {
  name: string | null;
  weekly_points: number;
  streak_days: number;
}

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

  const campaign = activeCampaign as CampaignRow | null;
  const volunteerCount = campaign?.campaign_volunteers?.[0]?.count ?? 0;
  const topVol = topVolunteer as TopVolunteerRow | null;

  return NextResponse.json({
    activeCampaign: campaign
      ? {
          id: campaign.id,
          name: campaign.name,
          neighborhood: campaign.neighborhood,
          volunteersNeeded: campaign.volunteers_needed,
          volunteersJoined: volunteerCount,
          status: campaign.status,
        }
      : null,
    stats: {
      totalCampaigns: totalCampaigns ?? 0,
      totalVolunteers: totalVolunteers ?? 0,
      weeklyPins: weeklyPinRows?.length ?? 0,
    },
    weeklyPinCoords: (weeklyPinRows ?? []) as { lat: number; lng: number }[],
    topVolunteer: topVol
      ? {
          name: topVol.name,
          weeklyPoints: topVol.weekly_points,
          streakDays: topVol.streak_days,
        }
      : null,
  });
}
