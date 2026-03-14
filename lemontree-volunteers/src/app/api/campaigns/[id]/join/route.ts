import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { POINTS } from '@/lib/points';

async function awardPoints(
  supabase: ReturnType<typeof createServiceClient>,
  volunteerId: string,
  campaignId: string,
  eventType: string,
  points: number
) {
  await supabase.from('point_events').insert({
    volunteer_id: volunteerId,
    campaign_id: campaignId,
    event_type: eventType,
    points,
  });

  const { data } = await supabase
    .from('volunteers')
    .select('total_points, weekly_points')
    .eq('id', volunteerId)
    .single();

  if (data) {
    await supabase
      .from('volunteers')
      .update({
        total_points: data.total_points + points,
        weekly_points: data.weekly_points + points,
      })
      .eq('id', volunteerId);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const volunteerId = (session.user as any).volunteerId as string | undefined;
  if (!volunteerId) {
    return NextResponse.json({ error: 'Volunteer not found' }, { status: 400 });
  }

  const { id: campaignId } = await params;
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from('campaign_volunteers')
    .select('campaign_id')
    .eq('campaign_id', campaignId)
    .eq('volunteer_id', volunteerId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'Already joined this campaign' },
      { status: 409 }
    );
  }

  const { error: joinError } = await supabase
    .from('campaign_volunteers')
    .insert({ campaign_id: campaignId, volunteer_id: volunteerId });

  if (joinError) {
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  await awardPoints(
    supabase,
    volunteerId,
    campaignId,
    'volunteer_joined',
    POINTS.volunteer_joined
  );

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organizer_id')
    .eq('id', campaignId)
    .single();

  if (campaign && campaign.organizer_id !== volunteerId) {
    await awardPoints(
      supabase,
      campaign.organizer_id,
      campaignId,
      'campaign_created',
      POINTS.campaign_created
    );
  }

  return NextResponse.json({ success: true });
}
