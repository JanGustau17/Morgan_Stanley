"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

const TAGS = ["general", "events", "ideas", "help", "introductions"];

interface NewThreadFormProps {
  onSubmit: (data: { title: string; content: string; tag: string }) => Promise<void>;
  onCancel: () => void;
}

export function NewThreadForm({ onSubmit, onCancel }: NewThreadFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), tag });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-[#e8e0cc] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#101726]">New Thread</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
              tag === t
                ? "bg-[#008A81] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Thread title…"
        className="w-full px-3 py-2 text-sm border border-[#e8e0cc] rounded-lg bg-white text-[#101726] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008A81]/25 mb-2"
        maxLength={200}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post (optional)…"
        rows={4}
        className="w-full px-3 py-2 text-sm border border-[#e8e0cc] rounded-lg bg-white text-[#101726] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008A81]/25 resize-none"
        maxLength={5000}
      />

      <div className="flex justify-end mt-3">
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#008A81" }}
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? "Posting…" : "Post Thread"}
        </button>
      </div>
    </form>
  );
}
