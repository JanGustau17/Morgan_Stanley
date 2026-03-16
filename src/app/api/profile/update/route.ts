import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { name, banner_id, banner_image, greeting_id } = body as {
      name?: string;
      banner_id?: string;
      banner_image?: string | null;
      greeting_id?: string;
    };

    const updates: Record<string, unknown> = {};
    if (name?.trim())               updates.name = name.trim();
    if (banner_id)                  updates.banner_id = banner_id;
    if (banner_image !== undefined)  updates.banner_image = banner_image;
    if (greeting_id)                updates.greeting_id = greeting_id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('volunteers')
      .update(updates)
      .eq('id', volunteerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}