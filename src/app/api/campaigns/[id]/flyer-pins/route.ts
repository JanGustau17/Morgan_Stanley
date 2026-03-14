import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volunteerId = (session.user as unknown as Record<string, unknown>)
      .volunteerId as string;
    if (!volunteerId) {
      return NextResponse.json(
        { error: 'Volunteer profile not found' },
        { status: 403 },
      );
    }

    const { id: campaignId } = await params;
    const body = await request.json();
    const { lat, lng, photo_url } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'lat and lng are required numbers' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: pin, error } = await supabase
      .from('flyer_pins')
      .insert({
        campaign_id: campaignId,
        volunteer_id: volunteerId,
        lat,
        lng,
        photo_url: photo_url ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create flyer pin' },
        { status: 500 },
      );
    }

    await supabase.from('point_events').insert({
      volunteer_id: volunteerId,
      campaign_id: campaignId,
      event_type: 'flyer_pinned',
      points: 5,
    });

    const { data: vol } = await supabase
      .from('volunteers')
      .select('total_points, weekly_points')
      .eq('id', volunteerId)
      .single();

    if (vol) {
      await supabase
        .from('volunteers')
        .update({
          total_points: vol.total_points + 5,
          weekly_points: vol.weekly_points + 5,
        })
        .eq('id', volunteerId);
    }

    return NextResponse.json(pin, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to create flyer pin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
