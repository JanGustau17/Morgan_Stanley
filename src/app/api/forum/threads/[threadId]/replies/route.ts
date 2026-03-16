import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

// GET /api/forum/threads/[threadId]/replies
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("forum_replies")
    .select("*, author:volunteers!forum_replies_author_id_fkey(id, name, avatar_url)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/forum/threads/[threadId]/replies
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const volunteerId = (session.user as { volunteerId?: string }).volunteerId;
  if (!volunteerId) {
    return NextResponse.json({ error: "No volunteer profile" }, { status: 403 });
  }

  const body = await req.json();
  const { content } = body as { content?: string };

  if (!content?.trim()) {
    return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("forum_replies")
    .insert({
      thread_id: threadId,
      author_id: volunteerId,
      body: content.trim(),
    })
    .select("*, author:volunteers!forum_replies_author_id_fkey(id, name, avatar_url)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }

  // Increment reply_count on thread
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("reply_count")
    .eq("id", threadId)
    .single();

  if (thread) {
    await supabase
      .from("forum_threads")
      .update({ reply_count: (thread.reply_count ?? 0) + 1 })
      .eq("id", threadId);
  }

  return NextResponse.json(data, { status: 201 });
}
