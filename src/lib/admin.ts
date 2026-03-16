import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Use in admin API routes to enforce role-based access.
 * Returns 403 if not authenticated or role !== 'admin'.
 * Role is set from volunteers.role in NextAuth session (lib/auth.ts).
 *
 * Security: Frontend-only checks (e.g. hiding Admin link or redirect in layout)
 * are not sufficient. Every admin API route MUST call requireAdmin() and return
 * 403 for non-admins. Supabase RLS: use service role only in trusted server
 * code (e.g. these admin routes); do not expose service role to the client.
 * For storage/DB, RLS still applies to direct client access—admin mutations
 * go through these server routes that use the service client.
 */
export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
