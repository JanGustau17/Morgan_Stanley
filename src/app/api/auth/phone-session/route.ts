import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { signPhoneToken } from "@/lib/phone-token";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accessToken, phone, name, smsOptIn } = body as {
      accessToken?: string;
      phone?: string;
      name?: string;
      smsOptIn?: boolean;
    };
    if (!accessToken || !phone) {
      return NextResponse.json({ error: "Missing accessToken or phone" }, { status: 400 });
    }
    if (!SUPABASE_URL) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }
    const supabaseUser = await userRes.json();
    const verifiedPhone = supabaseUser?.phone;
    if (!verifiedPhone || verifiedPhone.replace(/\s/g, "") !== phone.replace(/\s/g, "")) {
      return NextResponse.json({ error: "Phone does not match session" }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { data: existing } = await supabase
      .from("volunteers")
      .select("id, role")
      .eq("phone", verifiedPhone)
      .maybeSingle();

    let volunteerId: string;
    if (existing) {
      volunteerId = existing.id;
      await supabase
        .from("volunteers")
        .update({
          ...(name != null && name !== "" && { name }),
          phone_verified: true,
          sms_opt_in: smsOptIn ?? false,
        })
        .eq("id", existing.id);
    } else {
      const { data: inserted, error } = await supabase
        .from("volunteers")
        .insert({
          phone: verifiedPhone,
          name: name || null,
          phone_verified: true,
          sms_opt_in: smsOptIn ?? false,
        })
        .select("id")
        .single();
      if (error || !inserted) {
        return NextResponse.json({ error: "Could not create account" }, { status: 500 });
      }
      volunteerId = inserted.id;
    }

    const exp = Date.now() + 60 * 1000;
    let token: string;
    try {
      token = signPhoneToken({ volunteerId, exp });
    } catch (signErr) {
      console.error("phone-session sign error", signErr);
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }
    return NextResponse.json({ token });
  } catch (e) {
    console.error("phone-session error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
