import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { signPhoneToken } from '@/lib/phone-token';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * POST /api/auth/email-session
 *
 * Authenticates a user via Supabase email+password, then returns a short-lived
 * JWT that the client exchanges for a NextAuth session using the credentials provider.
 *
 * Body: { email: string; password: string }
 * Returns: { token: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }

    // Authenticate against Supabase using the password grant
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!authRes.ok) {
      const errBody = await authRes.json().catch(() => ({})) as Record<string, unknown>;
      const message =
        typeof errBody.error_description === 'string'
          ? errBody.error_description
          : typeof errBody.msg === 'string'
            ? errBody.msg
            : 'Invalid email or password.';
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const authData = await authRes.json().catch(() => null) as {
      user?: { id: string; email?: string; user_metadata?: { full_name?: string } };
    } | null;
    const supabaseUser = authData?.user;
    if (!supabaseUser?.email) {
      return NextResponse.json({ error: 'Could not retrieve user data.' }, { status: 500 });
    }

    // Ensure a volunteer row exists for this user
    const supabase = createServiceClient();
    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('email', supabaseUser.email)
      .maybeSingle();

    let volunteerId: string;
    if (existing) {
      volunteerId = existing.id as string;
    } else {
      const { data: inserted, error } = await supabase
        .from('volunteers')
        .insert({
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name ?? null,
        })
        .select('id')
        .single();
      if (error || !inserted) {
        return NextResponse.json({ error: 'Could not create account.' }, { status: 500 });
      }
      volunteerId = (inserted as { id: string }).id;
    }

    // Issue a short-lived token for the NextAuth credentials provider
    const exp = Date.now() + 60 * 1000;
    let token: string;
    try {
      token = signPhoneToken({ volunteerId, exp });
    } catch {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch (e) {
    console.error('email-session error', e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
