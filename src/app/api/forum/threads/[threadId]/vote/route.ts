import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

// POST /api/forum/threads/[threadId]/vote — toggle upvote on a thread
export async function POST(
  _req: NextRequest,
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

  const supabase = createServiceClient();

  // Check if already voted
  const { data: existing } = await supabase
    .from("forum_votes")
    .select("id")
    .eq("volunteer_id", volunteerId)
    .eq("thread_id", threadId)
    .maybeSingle();

  if (existing) {
    // Remove vote
    await supabase.from("forum_votes").delete().eq("id", existing.id);
    // Decrement upvotes
    const { data: thread } = await supabase
      .from("forum_threads")
      .select("upvotes")
      .eq("id", threadId)
      .single();
    if (thread) {
      await supabase
        .from("forum_threads")
        .update({ upvotes: Math.max(0, (thread.upvotes ?? 0) - 1) })
        .eq("id", threadId);
    }
    return NextResponse.json({ voted: false });
  }

  // Add vote
  await supabase.from("forum_votes").insert({
    volunteer_id: volunteerId,
    thread_id: threadId,
    value: 1,
  });
  // Increment upvotes
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("upvotes")
    .eq("id", threadId)
    .single();
  if (thread) {
    await supabase
      .from("forum_threads")
      .update({ upvotes: (thread.upvotes ?? 0) + 1 })
      .eq("id", threadId);
  }

  return NextResponse.json({ voted: true });
}
