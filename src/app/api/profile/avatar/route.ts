import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
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

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return NextResponse.json(
        { error: 'avatarUrl is required' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('volunteers')
      .update({ avatar_url: avatarUrl })
      .eq('id', volunteerId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update avatar' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, avatar_url: avatarUrl });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to update avatar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
