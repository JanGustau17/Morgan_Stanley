import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

/**
 * Admin-only API: update or delete a volunteer (user).
 * Backend access control: requireAdmin() enforces role = 'admin'.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { role } = body as { role?: string };

  if (!role || !["volunteer", "admin"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role; use 'volunteer' or 'admin'" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("volunteers")
    .update({ role })
    .eq("id", id);

  if (error) {
    console.error("admin user update error", error);
    return NextResponse.json(
      { error: "Failed to update user" },
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

  // Delete volunteer; ensure FK constraints allow (e.g. campaign_volunteers, etc. may need handling)
  const { error } = await supabase.from("volunteers").delete().eq("id", id);

  if (error) {
    console.error("admin user delete error", error);
    return NextResponse.json(
      { error: "Failed to delete user. They may have related data." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
