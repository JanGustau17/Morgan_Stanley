import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json();

    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        { error: 'Recipient phone number is required' },
        { status: 400 }
      );
    }
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message body is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('id, sms_opt_in')
      .eq('phone', to)
      .single();

    if (!volunteer?.sms_opt_in) {
      return NextResponse.json(
        { error: 'Volunteer has not opted in to SMS messages' },
        { status: 403 }
      );
    }

    const result = await client.messages.create({
      body: `${message}\n\nReply STOP to opt out.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to send SMS';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
