"use client";

import { Avatar } from "@/components/ui/Avatar";
import { formatTime } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const senderName = message.sender?.name ?? "Unknown";

  return (
    <div
      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      <Avatar
        src={message.sender?.avatar_url}
        name={senderName}
        size="sm"
        className="shrink-0 mb-5"
      />

      <div
        className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}
      >
        <span className="mb-0.5 px-1 text-xs text-gray-500">{senderName}</span>

        <div
          className={`rounded-2xl px-4 py-2 text-sm leading-relaxed break-words ${
            isOwn
              ? "bg-green-600 text-white rounded-br-md"
              : "bg-gray-100 text-gray-900 rounded-bl-md"
          }`}
        >
          {message.content}
        </div>

        <span className="mt-0.5 px-1 text-[11px] text-gray-400">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
