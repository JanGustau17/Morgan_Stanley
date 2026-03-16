"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Flame, Clock, MessageSquare } from "lucide-react";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { NewThreadForm } from "@/components/forum/NewThreadForm";
import type { ForumThread } from "@/lib/types";
import Link from "next/link";

const TAGS = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "events", label: "Events" },
  { value: "ideas", label: "Ideas" },
  { value: "help", label: "Help" },
  { value: "introductions", label: "Intros" },
];

export default function ForumPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"newest" | "top">("newest");
  const [activeTag, setActiveTag] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (activeTag !== "all") params.set("tag", activeTag);
      const res = await fetch(`/api/forum/threads?${params}`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [sort, activeTag]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  async function handleNewThread(data: { title: string; content: string; tag: string }) {
    const res = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowNew(false);
      fetchThreads();
    }
  }

  async function handleVote(threadId: string) {
    if (!session?.user) return;
    const res = await fetch(`/api/forum/threads/${threadId}/vote`, { method: "POST" });
    if (res.ok) {
      const { voted } = await res.json();
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (voted) next.add(threadId);
        else next.delete(threadId);
        return next;
      });
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, upvotes: t.upvotes + (voted ? 1 : -1) } : t,
        ),
      );
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#fff6E0" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold text-[#101726]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Forum
            </h1>
            <p className="text-sm text-[#101726]/50 mt-1">
              Chat with other volunteers, share ideas, and get help
            </p>
          </div>
          {session?.user && (
            <button
              onClick={() => setShowNew((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: "#5C3D8F" }}
            >
              <Plus className="h-4 w-4" />
              New Thread
            </button>
          )}
        </div>

        {/* New thread form */}
        {showNew && (
          <div className="mb-6">
            <NewThreadForm onSubmit={handleNewThread} onCancel={() => setShowNew(false)} />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Sort buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setSort("newest")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                sort === "newest"
                  ? "bg-[#101726] text-white"
                  : "bg-white text-gray-600 border border-[#e8e0cc] hover:bg-gray-50"
              }`}
            >
              <Clock className="h-3 w-3" />
              New
            </button>
            <button
              onClick={() => setSort("top")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                sort === "top"
                  ? "bg-[#101726] text-white"
                  : "bg-white text-gray-600 border border-[#e8e0cc] hover:bg-gray-50"
              }`}
            >
              <Flame className="h-3 w-3" />
              Top
            </button>
          </div>

          {/* Tag pills */}
          <div className="flex gap-1.5 flex-wrap">
            {TAGS.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTag(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTag === t.value
                    ? "bg-[#008A81] text-white"
                    : "bg-white text-gray-500 border border-[#e8e0cc] hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Thread list */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#008A81] border-t-transparent" />
            <p className="text-sm text-gray-500">Loading threads…</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No threads yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onVote={handleVote}
                hasVoted={votedIds.has(thread.id)}
              />
            ))}
          </div>
        )}

        {/* Sign in prompt */}
        {!session?.user && (
          <div className="mt-8 rounded-xl border border-[#e8e0cc] bg-white p-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Sign in to create threads, vote, and join the discussion.
            </p>
            <Link
              href="/auth"
              className="inline-flex px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: "#5C3D8F" }}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
