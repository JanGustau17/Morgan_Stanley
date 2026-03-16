import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

// POST /api/forum/replies/[replyId]/vote — toggle upvote on a reply
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ replyId: string }> },
) {
  const { replyId } = await params;
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
    .eq("reply_id", replyId)
    .maybeSingle();

  if (existing) {
    // Remove vote
    await supabase.from("forum_votes").delete().eq("id", existing.id);
    // Update upvotes atomically using count of remaining votes
    const { count } = await supabase
      .from("forum_votes")
      .select("*", { count: "exact", head: true })
      .eq("reply_id", replyId);
    await supabase
      .from("forum_replies")
      .update({ upvotes: count ?? 0 })
      .eq("id", replyId);
    return NextResponse.json({ voted: false });
  }

  // Add vote
  await supabase.from("forum_votes").insert({
    volunteer_id: volunteerId,
    reply_id: replyId,
    value: 1,
  });
  // Update upvotes atomically using count of all votes
  const { count } = await supabase
    .from("forum_votes")
    .select("*", { count: "exact", head: true })
    .eq("reply_id", replyId);
  await supabase
    .from("forum_replies")
    .update({ upvotes: count ?? 0 })
    .eq("id", replyId);

  return NextResponse.json({ voted: true });
}
