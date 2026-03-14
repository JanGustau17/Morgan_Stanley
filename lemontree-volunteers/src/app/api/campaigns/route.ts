import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volunteerId = (session.user as any).volunteerId as string;
    if (!volunteerId) {
      return NextResponse.json(
        { error: 'Volunteer profile not found' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      neighborhood,
      lat,
      lng,
      location_name,
      campaign_date,
      language,
      target_group,
      volunteers_needed,
    } = body;

    if (!name || !neighborhood || !campaign_date) {
      return NextResponse.json(
        { error: 'Name, neighborhood, and campaign_date are required' },
        { status: 400 },
      );
    }

    const refTag = `vol-${volunteerId}-${crypto.randomUUID().slice(0, 8)}`;
    const supabase = createServiceClient();

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        organizer_id: volunteerId,
        name,
        neighborhood,
        lat: lat ?? null,
        lng: lng ?? null,
        location_name: location_name ?? null,
        campaign_date,
        language: language ?? 'en',
        target_group: target_group ?? 'families',
        volunteers_needed: volunteers_needed ?? 5,
        ref_tag: refTag,
        status: 'upcoming',
      })
      .select()
      .single();

    if (campaignError) {
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 },
      );
    }

    const { error: pointError } = await supabase.from('point_events').insert({
      volunteer_id: volunteerId,
      campaign_id: campaign.id,
      event_type: 'campaign_created',
      points: 10,
    });

    if (!pointError) {
      await supabase.rpc('increment_points', {
        vol_id: volunteerId,
        pts: 10,
      }).then(({ error: rpcError }) => {
        if (rpcError) {
          // Fallback: manual update if RPC doesn't exist
          return supabase
            .from('volunteers')
            .select('total_points, weekly_points')
            .eq('id', volunteerId)
            .single()
            .then(({ data }) => {
              if (data) {
                return supabase
                  .from('volunteers')
                  .update({
                    total_points: data.total_points + 10,
                    weekly_points: data.weekly_points + 10,
                  })
                  .eq('id', volunteerId);
              }
            });
        }
      });
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to create campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*, campaign_volunteers(count)')
      .order('campaign_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 },
      );
    }

    const result = campaigns.map((c: any) => ({
      ...c,
      volunteer_count: c.campaign_volunteers?.[0]?.count ?? 0,
      campaign_volunteers: undefined,
    }));

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch campaigns';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
