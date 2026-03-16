"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "ready" | "saving" | "success" | "error" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Supabase auto-processes the recovery token from the URL hash when the
    // browser client is initialised. We listen for the PASSWORD_RECOVERY event
    // to know when it is safe to call updateUser().
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setStatus("ready");
        }
      },
    );

    // Safety timeout — if no recovery event arrives within 5 s the token is
    // missing or expired. We use the functional updater so the callback does
    // not capture a stale `status` value in its closure.
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "invalid" : prev));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!password.trim()) {
      setErrorMsg("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setStatus("saving");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus("ready");
        setErrorMsg(error.message);
        return;
      }
      setStatus("success");
      // Sign out Supabase session — the user will sign in normally via NextAuth
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setStatus("ready");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl bg-brand-card shadow-sm border border-brand-border px-8 pt-8 pb-7 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-brand-text">Set a new password</h1>
          <p className="text-sm text-brand-muted">
            Choose a strong password for your account.
          </p>
        </div>

        {/* Loading — waiting for Supabase recovery event */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-8 w-8 rounded-full border-2 border-brand-yellow border-t-transparent animate-spin" />
            <p className="text-sm text-brand-muted">Validating reset link…</p>
          </div>
        )}

        {/* Invalid / expired link */}
        {status === "invalid" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
              This reset link has expired or is invalid. Please request a new one.
            </div>
            <a
              href="/auth/forgot-password"
              className="block w-full rounded-full bg-brand-yellow py-3 text-center font-bold text-brand-green hover:bg-brand-yellowHover transition-colors"
            >
              Request new link
            </a>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800 text-center">
              <p className="font-semibold">Password updated!</p>
              <p className="mt-1">Redirecting you to sign in…</p>
            </div>
          </div>
        )}

        {/* Form */}
        {(status === "ready" || status === "saving") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-brand-muted"
              >
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 pr-10 text-brand-text outline-none transition-all duration-300 hover:bg-gray-50/80 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-brand-muted hover:text-brand-text focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-semibold text-brand-muted"
              >
                Confirm password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-brand-text outline-none transition-all duration-300 hover:bg-gray-50/80 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                autoComplete="new-password"
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full rounded-full bg-brand-yellow py-3 font-bold text-brand-green hover:bg-brand-yellowHover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 disabled:opacity-60"
            >
              {status === "saving" ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>

      {/* Supabase config note (visible in development only) */}
      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 text-center text-xs text-brand-muted opacity-60">
          ℹ️ Supabase: set redirect URL to{" "}
          <code className="rounded bg-white/60 px-1">
            {typeof window !== "undefined" ? window.location.origin : ""}/auth/reset-password
          </code>{" "}
          in Authentication &rarr; URL Configuration &rarr; Redirect URLs.
        </p>
      )}
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}
