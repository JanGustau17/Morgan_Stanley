import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

/**
 * Admin-only API: list volunteers (users).
 * Backend access control: requireAdmin() enforces role = 'admin' from session.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const roleFilter = searchParams.get("role")?.trim() ?? "";

  const supabase = createServiceClient();
  let query = supabase
    .from("volunteers")
    .select("id, email, name, phone, role, created_at, avatar_url")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `email.ilike.%${q}%,name.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }
  if (roleFilter) {
    query = query.eq("role", roleFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin users list error", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
  return NextResponse.json(data ?? []);
}
