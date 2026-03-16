"use client";

import Link from "next/link";
import { ArrowBigUp, MessageCircle } from "lucide-react";
import type { ForumThread } from "@/lib/types";

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  general: { bg: "#008A8114", text: "#008A81" },
  events: { bg: "#ffcc1022", text: "#7a5f00" },
  ideas: { bg: "#5C3D8F14", text: "#5C3D8F" },
  help: { bg: "#E8522A14", text: "#E8522A" },
  introductions: { bg: "#2D6A4F14", text: "#2D6A4F" },
};

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

interface ThreadCardProps {
  thread: ForumThread;
  onVote?: (threadId: string) => void;
  hasVoted?: boolean;
}

export function ThreadCard({ thread, onVote, hasVoted }: ThreadCardProps) {
  const tagStyle = TAG_COLORS[thread.tag] ?? TAG_COLORS.general;

  return (
    <div className="bg-white rounded-xl border border-[#e8e0cc] p-4 hover:shadow-md transition-all duration-200 flex gap-3">
      {/* Vote column */}
      <div className="flex flex-col items-center gap-0.5 pt-0.5">
        <button
          onClick={(e) => {
            e.preventDefault();
            onVote?.(thread.id);
          }}
          className={`p-1 rounded-lg transition-colors ${
            hasVoted
              ? "text-[#008A81] bg-[#008A8114]"
              : "text-gray-400 hover:text-[#008A81] hover:bg-[#008A8108]"
          }`}
          title="Upvote"
        >
          <ArrowBigUp className="h-5 w-5" fill={hasVoted ? "currentColor" : "none"} />
        </button>
        <span className={`text-xs font-bold ${hasVoted ? "text-[#008A81]" : "text-gray-500"}`}>
          {thread.upvotes}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: tagStyle.bg, color: tagStyle.text }}
          >
            {thread.tag}
          </span>
          <span className="text-[11px] text-gray-400">
            {thread.author?.name ?? "Anonymous"} · {timeAgo(thread.created_at)}
          </span>
        </div>

        <Link
          href={`/forum/${thread.id}`}
          className="block font-semibold text-sm text-[#101726] leading-snug hover:text-[#008A81] transition-colors mb-1"
        >
          {thread.title}
        </Link>

        {thread.body && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{thread.body}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <Link
            href={`/forum/${thread.id}`}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#008A81] transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}
          </Link>
        </div>
      </div>
    </div>
  );
}
