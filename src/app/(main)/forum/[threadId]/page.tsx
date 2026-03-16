"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowBigUp, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { ForumThread, ForumReply } from "@/lib/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  general: { bg: "#008A8114", text: "#008A81" },
  events: { bg: "#ffcc1022", text: "#7a5f00" },
  ideas: { bg: "#5C3D8F14", text: "#5C3D8F" },
  help: { bg: "#E8522A14", text: "#E8522A" },
  introductions: { bg: "#2D6A4F14", text: "#2D6A4F" },
};

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { data: session } = useSession();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [threadVoted, setThreadVoted] = useState(false);
  const [replyVotes, setReplyVotes] = useState<Set<string>>(new Set());

  const fetchThread = useCallback(async () => {
    const res = await fetch(`/api/forum/threads?sort=newest`);
    if (res.ok) {
      const threads: ForumThread[] = await res.json();
      const found = threads.find((t) => t.id === threadId);
      if (found) setThread(found);
    }
  }, [threadId]);

  const fetchReplies = useCallback(async () => {
    const res = await fetch(`/api/forum/threads/${threadId}/replies`);
    if (res.ok) {
      const data = await res.json();
      setReplies(data);
    }
  }, [threadId]);

  useEffect(() => {
    Promise.all([fetchThread(), fetchReplies()]).finally(() => setLoading(false));
  }, [fetchThread, fetchReplies]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/forum/threads/${threadId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText("");
        fetchReplies();
        // Update thread reply count locally
        setThread((prev) => prev ? { ...prev, reply_count: prev.reply_count + 1 } : prev);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleThreadVote() {
    if (!session?.user || !thread) return;
    const res = await fetch(`/api/forum/threads/${thread.id}/vote`, { method: "POST" });
    if (res.ok) {
      const { voted } = await res.json();
      setThreadVoted(voted);
      setThread((prev) =>
        prev ? { ...prev, upvotes: prev.upvotes + (voted ? 1 : -1) } : prev,
      );
    }
  }

  async function handleReplyVote(replyId: string) {
    if (!session?.user) return;
    const res = await fetch(`/api/forum/replies/${replyId}/vote`, { method: "POST" });
    if (res.ok) {
      const { voted } = await res.json();
      setReplyVotes((prev) => {
        const next = new Set(prev);
        if (voted) next.add(replyId);
        else next.delete(replyId);
        return next;
      });
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId ? { ...r, upvotes: r.upvotes + (voted ? 1 : -1) } : r,
        ),
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fff6E0" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#008A81] border-t-transparent" />
          <p className="text-sm text-gray-500">Loading thread…</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fff6E0" }}>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Thread not found</p>
          <Link href="/forum" className="text-sm text-[#008A81] hover:underline mt-2 inline-block">
            ← Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  const tagStyle = TAG_COLORS[thread.tag] ?? TAG_COLORS.general;

  return (
    <div className="min-h-screen" style={{ background: "#fff6E0" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#008A81] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forum
        </Link>

        {/* Thread */}
        <div className="bg-white rounded-xl border border-[#e8e0cc] p-5 mb-6">
          <div className="flex gap-3">
            {/* Vote */}
            <div className="flex flex-col items-center gap-0.5 pt-1">
              <button
                onClick={handleThreadVote}
                className={`p-1 rounded-lg transition-colors ${
                  threadVoted
                    ? "text-[#008A81] bg-[#008A8114]"
                    : "text-gray-400 hover:text-[#008A81] hover:bg-[#008A8108]"
                }`}
              >
                <ArrowBigUp className="h-6 w-6" fill={threadVoted ? "currentColor" : "none"} />
              </button>
              <span className={`text-sm font-bold ${threadVoted ? "text-[#008A81]" : "text-gray-500"}`}>
                {thread.upvotes}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: tagStyle.bg, color: tagStyle.text }}
                >
                  {thread.tag}
                </span>
              </div>

              <h1 className="text-lg font-bold text-[#101726] leading-snug mb-2">
                {thread.title}
              </h1>

              {thread.body && (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-3">
                  {thread.body}
                </p>
              )}

              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Avatar
                  src={thread.author?.avatar_url}
                  name={thread.author?.name ?? "Anonymous"}
                  size="sm"
                />
                <span className="font-medium text-gray-600">{thread.author?.name ?? "Anonymous"}</span>
                <span>·</span>
                <span>{timeAgo(thread.created_at)}</span>
                <span>·</span>
                <span>{thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reply form */}
        {session?.user ? (
          <form onSubmit={handleReply} className="mb-6">
            <div className="bg-white rounded-xl border border-[#e8e0cc] p-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-[#e8e0cc] rounded-lg bg-white text-[#101726] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008A81]/25 resize-none"
                maxLength={5000}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#008A81" }}
                >
                  <Send className="h-3 w-3" />
                  {sending ? "Posting…" : "Reply"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 rounded-xl border border-[#e8e0cc] bg-white p-4 text-center">
            <p className="text-sm text-gray-500">
              <Link href="/auth" className="text-[#008A81] font-semibold hover:underline">
                Sign in
              </Link>{" "}
              to join the conversation.
            </p>
          </div>
        )}

        {/* Replies */}
        <div className="flex flex-col gap-3">
          {replies.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400">No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-white rounded-xl border border-[#e8e0cc] p-4 flex gap-3"
              >
                {/* Vote */}
                <div className="flex flex-col items-center gap-0.5 pt-0.5">
                  <button
                    onClick={() => handleReplyVote(reply.id)}
                    className={`p-0.5 rounded-lg transition-colors ${
                      replyVotes.has(reply.id)
                        ? "text-[#008A81] bg-[#008A8114]"
                        : "text-gray-400 hover:text-[#008A81] hover:bg-[#008A8108]"
                    }`}
                  >
                    <ArrowBigUp className="h-4 w-4" fill={replyVotes.has(reply.id) ? "currentColor" : "none"} />
                  </button>
                  <span className={`text-[11px] font-bold ${replyVotes.has(reply.id) ? "text-[#008A81]" : "text-gray-500"}`}>
                    {reply.upvotes}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar
                      src={reply.author?.avatar_url}
                      name={reply.author?.name ?? "Anonymous"}
                      size="sm"
                    />
                    <span className="text-xs font-medium text-gray-600">
                      {reply.author?.name ?? "Anonymous"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {timeAgo(reply.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {reply.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
