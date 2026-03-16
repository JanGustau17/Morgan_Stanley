import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/forum/threads/[threadId] — get a single thread by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("forum_threads")
    .select("*, author:volunteers!forum_threads_author_id_fkey(id, name, avatar_url)")
    .eq("id", threadId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
