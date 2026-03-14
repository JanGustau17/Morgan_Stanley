import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { volunteerId, smsOptIn } = await request.json();

    if (!volunteerId || typeof volunteerId !== 'string') {
      return NextResponse.json(
        { error: 'Volunteer ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('volunteers')
      .update({ sms_opt_in: !!smsOptIn })
      .eq('id', volunteerId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update SMS preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to update preference';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
