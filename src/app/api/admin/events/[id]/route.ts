import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

const ALLOWED_STATUSES = ["upcoming", "active", "completed"];

/**
 * Admin-only API: update or delete a campaign (event).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status, name, neighborhood, campaign_date } = body as {
    status?: string;
    name?: string;
    neighborhood?: string;
    campaign_date?: string;
  };

  const updates: Record<string, unknown> = {};
  if (status && ALLOWED_STATUSES.includes(status)) updates.status = status;
  if (typeof name === "string") updates.name = name;
  if (typeof neighborhood === "string") updates.neighborhood = neighborhood;
  if (typeof campaign_date === "string") updates.campaign_date = campaign_date;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("campaigns")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("admin event update error", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = createServiceClient();

  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) {
    console.error("admin event delete error", error);
    return NextResponse.json(
      { error: "Failed to delete event. It may have related data." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
