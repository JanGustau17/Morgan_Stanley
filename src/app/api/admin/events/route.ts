import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

/**
 * Admin-only API: list campaigns (events) with volunteer and conversion counts.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const statusFilter = searchParams.get("status")?.trim() ?? "";

  const supabase = createServiceClient();
  let query = supabase
    .from("campaigns")
    .select(`
      id,
      name,
      neighborhood,
      campaign_date,
      status,
      flyers_count,
      organizer_id,
      organizer:volunteers!campaigns_organizer_id_fkey(id, name, email)
    `)
    .order("campaign_date", { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,neighborhood.ilike.%${q}%`);
  }
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: campaignsRaw, error } = await query;
  if (error) {
    console.error("admin events list error", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }

  const campaignIds = (campaignsRaw ?? []).map((c) => c.id);
  let volunteerCounts: Record<string, number> = {};
  let conversionCounts: Record<string, number> = {};

  if (campaignIds.length > 0) {
    const [cvRes, convRes] = await Promise.all([
      supabase.from("campaign_volunteers").select("campaign_id"),
      supabase.from("conversions").select("campaign_id"),
    ]);
    if (cvRes.data) {
      volunteerCounts = cvRes.data.reduce<Record<string, number>>((acc, row) => {
        acc[row.campaign_id] = (acc[row.campaign_id] || 0) + 1;
        return acc;
      }, {});
    }
    if (convRes.data) {
      conversionCounts = convRes.data.reduce<Record<string, number>>((acc, row) => {
        acc[row.campaign_id] = (acc[row.campaign_id] || 0) + 1;
        return acc;
      }, {});
    }
  }

  const campaigns = (campaignsRaw ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    neighborhood: c.neighborhood,
    campaign_date: c.campaign_date,
    status: c.status,
    flyers_count: c.flyers_count ?? 0,
    organizer_id: c.organizer_id,
    organizer_name:
      (c.organizer as { name?: string; email?: string } | null)?.name ??
      (c.organizer as { name?: string; email?: string } | null)?.email ??
      "Unknown",
    volunteer_count: volunteerCounts[c.id] ?? 0,
    conversion_count: conversionCounts[c.id] ?? 0,
  }));

  return NextResponse.json(campaigns);
}
