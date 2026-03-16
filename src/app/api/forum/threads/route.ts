import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

// GET /api/forum/threads — list threads (newest first by default, or by upvotes)
export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") ?? "newest";
  const tag = url.searchParams.get("tag");

  let query = supabase
    .from("forum_threads")
    .select("*, author:volunteers!forum_threads_author_id_fkey(id, name, avatar_url)");

  if (tag && tag !== "all") {
    query = query.eq("tag", tag);
  }

  if (sort === "top") {
    query = query.order("upvotes", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.limit(50);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/forum/threads — create a new thread
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const volunteerId = (session.user as { volunteerId?: string }).volunteerId;
  if (!volunteerId) {
    return NextResponse.json({ error: "No volunteer profile" }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, tag } = body as {
    title?: string;
    content?: string;
    tag?: string;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      author_id: volunteerId,
      title: title.trim(),
      body: (content ?? "").trim(),
      tag: tag ?? "general",
    })
    .select("*, author:volunteers!forum_threads_author_id_fkey(id, name, avatar_url)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
