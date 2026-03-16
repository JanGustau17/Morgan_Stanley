"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setStatus("loading");
    try {
      const supabase = createClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/reset-password`
          : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      );

      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="rounded-2xl bg-brand-card shadow-sm border border-brand-border px-8 pt-8 pb-7 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-brand-text">Forgot password?</h1>
          <p className="text-sm text-brand-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800 text-center">
              <p className="font-semibold">Check your inbox!</p>
              <p className="mt-1">
                If an account exists for <strong>{email}</strong>, you&apos;ll
                receive a password reset link shortly.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full rounded-full bg-brand-yellow py-3 text-center font-bold text-brand-green hover:bg-brand-yellowHover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-brand-muted"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-brand-text outline-none transition-all duration-300 hover:bg-gray-50/80 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                aria-label="Email address"
                autoComplete="email"
                autoFocus
              />
            </div>

            {status === "error" && errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-brand-yellow py-3 font-bold text-brand-green hover:bg-brand-yellowHover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-center text-sm text-brand-muted">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-green underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
