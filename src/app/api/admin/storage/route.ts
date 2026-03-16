import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

const BUCKETS = ["flyer-photos", "avatars", "campaign-images"] as const;

/**
 * Admin-only API: list storage buckets and optionally files in a bucket.
 * Uses service role; RLS still applies to direct client access — only this server route can list/delete.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket");

  const supabase = createServiceClient();

  if (!bucket) {
    const list = BUCKETS.map((id) => ({
      id,
      name: id,
      public: true,
    }));
    return NextResponse.json(list);
  }

  if (!BUCKETS.includes(bucket as (typeof BUCKETS)[number])) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list("", { limit: 200 });

  if (error) {
    console.error("admin storage list error", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }

  const list = (files ?? []).map((f) => ({
    name: f.name,
    id: f.id,
    updated_at: f.updated_at ?? "",
    created_at: (f as { created_at?: string }).created_at ?? "",
    metadata: f.metadata ?? {},
  }));
  return NextResponse.json(list);
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const { bucket, path } = body as { bucket?: string; path?: string };
  if (!bucket || !path) {
    return NextResponse.json(
      { error: "bucket and path required" },
      { status: 400 }
    );
  }
  if (!BUCKETS.includes(bucket as (typeof BUCKETS)[number])) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error("admin storage delete error", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
