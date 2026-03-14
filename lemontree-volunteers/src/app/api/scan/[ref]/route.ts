import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { POINTS } from '@/lib/points';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;

    const parts = ref.match(/^vol-([a-f0-9-]+)-(.+)$/);
    if (!parts) {
      return NextResponse.json(
        { error: 'Invalid ref tag format' },
        { status: 400 }
      );
    }

    const volunteerId = parts[1];
    const supabase = createServiceClient();

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('ref_tag', ref)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found for this ref tag' },
        { status: 404 }
      );
    }

    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const body = await req.json();
      if (typeof body.lat === 'number') lat = body.lat;
      if (typeof body.lng === 'number') lng = body.lng;
    } catch {
      // Body is optional — geolocation may not be available
    }

    await supabase.from('conversions').insert({
      campaign_id: campaign.id,
      volunteer_id: volunteerId,
      ref_tag: ref,
      source: 'qr_scan',
      lat,
      lng,
    });

    await supabase.from('point_events').insert({
      volunteer_id: volunteerId,
      campaign_id: campaign.id,
      event_type: 'qr_signup',
      points: POINTS.qr_signup,
    });

    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('total_points, weekly_points')
      .eq('id', volunteerId)
      .single();

    if (volunteer) {
      await supabase
        .from('volunteers')
        .update({
          total_points: volunteer.total_points + POINTS.qr_signup,
          weekly_points: volunteer.weekly_points + POINTS.qr_signup,
        })
        .eq('id', volunteerId);
    }

    const { data: currentCampaign } = await supabase
      .from('campaigns')
      .select('flyers_count')
      .eq('id', campaign.id)
      .single();

    if (currentCampaign) {
      await supabase
        .from('campaigns')
        .update({ flyers_count: currentCampaign.flyers_count + 1 })
        .eq('id', campaign.id);
    }

    return NextResponse.json({ success: true, campaignId: campaign.id });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to process QR scan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
