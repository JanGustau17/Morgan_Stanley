import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

function getTwilioClient() {
  return require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'A valid phone number is required' },
        { status: 400 }
      );
    }
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    const client = getTwilioClient();
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to: phone, code });

    if (verification.status !== 'approved') {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('phone', phone)
      .single();

    let volunteerId: string;

    if (existing) {
      await supabase
        .from('volunteers')
        .update({ phone_verified: true })
        .eq('id', existing.id);
      volunteerId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from('volunteers')
        .insert({ phone, phone_verified: true })
        .select('id')
        .single();

      if (error || !created) {
        return NextResponse.json(
          { error: 'Failed to create volunteer record' },
          { status: 500 }
        );
      }
      volunteerId = created.id;
    }

    return NextResponse.json({ success: true, volunteerId });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to verify code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
