"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatMessage } from "./ChatMessage";
import type { Message, MessageSender } from "@/lib/types";
import { Send } from "lucide-react";

interface ChatWindowProps {
  campaignId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
}

export function ChatWindow({
  campaignId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:volunteers!messages_sender_id_fkey(*)")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as Message[]);
      setLoading(false);
    }

    fetchMessages();

    const channel = supabase
      .channel(`campaign:${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `campaign_id=eq.${campaignId}`,
        },
        async (payload) => {
          const incoming = payload.new as Message;

          const { data: sender } = await supabase
            .from("volunteers")
            .select("*")
            .eq("id", incoming.sender_id)
            .single();

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [
              ...prev,
              { ...incoming, sender: (sender as MessageSender) ?? undefined },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || sending) return;

    setSending(true);
    setNewMessage("");

    const optimistic: Message = {
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      sender_id: currentUserId,
      content: text,
      type: "text",
      created_at: new Date().toISOString(),
      sender: {
        id: currentUserId,
        name: currentUserName,
        avatar_url: currentUserAvatar,
      },
    };

    setMessages((prev) => [...prev, optimistic]);

    await supabase.from("messages").insert({
      campaign_id: campaignId,
      sender_id: currentUserId,
      content: text,
      type: "text",
    });

    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[500px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Team Chat</h3>
        <p className="text-xs text-gray-500">
          {messages.length} message{messages.length !== 1 && "s"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-gray-100 px-4 py-3"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white transition-colors hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
