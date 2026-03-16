import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volunteerId = (session.user as unknown as Record<string, unknown>)
      .volunteerId as string;
    if (!volunteerId) {
      return NextResponse.json({ error: 'Volunteer profile not found' }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Delete related data first (respects FK constraints)
    await Promise.all([
      supabase.from('forum_votes').delete().eq('volunteer_id', volunteerId),
      supabase.from('forum_replies').delete().eq('author_id', volunteerId),
      supabase.from('forum_threads').delete().eq('author_id', volunteerId),
      supabase.from('point_events').delete().eq('volunteer_id', volunteerId),
      supabase.from('badges').delete().eq('volunteer_id', volunteerId),
      supabase.from('campaign_volunteers').delete().eq('volunteer_id', volunteerId),
      supabase.from('flyer_pins').delete().eq('volunteer_id', volunteerId),
      supabase.from('conversions').delete().eq('volunteer_id', volunteerId),
    ]);

    // Delete the volunteer row itself
    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('id', volunteerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}