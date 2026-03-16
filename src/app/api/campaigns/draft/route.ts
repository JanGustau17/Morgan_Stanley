import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export type DraftPayload = {
  step?: number;
  name?: string;
  campaign_date?: string;
  campaign_time?: string;
  neighborhood?: string;
  location_name?: string;
  meeting_point?: string;
  location_notes?: string;
  description?: string;
  lat?: number;
  lng?: number;
  target_group?: string;
  language?: string;
  volunteers_needed?: number;
  flyer_goal?: number;
  cover_image_url?: string | null;
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volunteerId = (session.user as { volunteerId?: string }).volunteerId;
    if (!volunteerId) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('campaign_drafts')
      .select('payload, updated_at')
      .eq('organizer_id', volunteerId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to load draft' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ draft: null });
    }

    return NextResponse.json({
      draft: data.payload as DraftPayload,
      updated_at: data.updated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volunteerId = (session.user as { volunteerId?: string }).volunteerId;
    if (!volunteerId) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 403 });
    }

    const body = await request.json();
    const payload: DraftPayload = {
      step: body.step,
      name: body.name,
      campaign_date: body.campaign_date,
      campaign_time: body.campaign_time,
      neighborhood: body.neighborhood,
      location_name: body.location_name,
      meeting_point: body.meeting_point,
      location_notes: body.location_notes,
      description: body.description,
      lat: body.lat,
      lng: body.lng,
      target_group: body.target_group,
      language: body.language,
      volunteers_needed: body.volunteers_needed,
      flyer_goal: body.flyer_goal,
      cover_image_url: body.cover_image_url ?? null,
    };

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('campaign_drafts')
      .upsert(
        {
          organizer_id: volunteerId,
          payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organizer_id' }
      );

    if (error) {
      return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volunteerId = (session.user as { volunteerId?: string }).volunteerId;
    if (!volunteerId) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 403 });
    }

    const supabase = createServiceClient();
    await supabase.from('campaign_drafts').delete().eq('organizer_id', volunteerId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
