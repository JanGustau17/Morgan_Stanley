"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";

type FormStatus = "idle" | "loading" | "success" | "error" | "exists";

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sendUpdates, setSendUpdates] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setStatus("error");
      setErrorMsg("Please fill in your name, email, and password.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setStatus("loading");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), sms_opt_in: sendUpdates },
        },
      });

      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }

      // Supabase returns identities: [] when the email is already registered
      if (!data.user?.identities || data.user.identities.length === 0) {
        setStatus("exists");
        return;
      }

      // If email confirmation is required, show success message.
      // If not required (auto-confirmed), sign in immediately via email-session.
      if (data.session) {
        // Email confirmation disabled — sign in right away
        const sessionRes = await fetch("/api/auth/email-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const sessionData = await sessionRes.json() as { token?: string; error?: string };
        if (sessionData.token) {
          await signIn("credentials", { token: sessionData.token, callbackUrl: "/" });
          return;
        }
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleEmailSignup} className="space-y-5 font-sans">
      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-sm font-semibold text-brand-muted"
        >
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-brand-text outline-none transition-all duration-300 hover:bg-gray-50/80 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
          aria-label="Full name"
          autoComplete="name"
        />
      </div>

      {/* Email */}
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
          aria-label="Email"
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-semibold text-brand-muted"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 pr-10 text-brand-text outline-none transition-all duration-300 hover:bg-gray-50/80 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
            aria-label="Password"
            autoComplete="new-password"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-brand-muted transition-colors hover:text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
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

      {/* Opt-in checkbox */}
      <div className="pt-1">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={sendUpdates}
            onChange={() => setSendUpdates(!sendUpdates)}
            className="mt-0.5 h-5 w-5 shrink-0 appearance-none rounded border border-brand-border bg-white transition-[transform,background-color,border-color] duration-150 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 checked:scale-105 checked:border-brand-yellow checked:bg-brand-yellow"
            style={{
              backgroundImage: sendUpdates
                ? "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='%232D6A4F' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E\")"
                : "none",
            }}
            aria-label="Send me product updates and news"
          />
          <span className="text-sm font-semibold text-brand-muted select-none">
            Send me product updates and news
          </span>
        </label>
      </div>

      {/* Inline feedback messages */}
      {status === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          ✅ Account created! Check your email to confirm your address, then{" "}
          <a href="/login" className="font-semibold underline underline-offset-2">
            sign in
          </a>
          .
        </div>
      )}
      {status === "exists" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This email is already registered.{" "}
          <a href="/login" className="font-semibold underline underline-offset-2">
            Sign in
          </a>{" "}
          or{" "}
          <a
            href="/auth/forgot-password"
            className="font-semibold underline underline-offset-2"
          >
            reset your password
          </a>
          .
        </div>
      )}
      {status === "error" && errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Primary CTA: email/password sign up */}
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="btn-cta-shimmer w-full rounded-full bg-brand-yellow py-3 font-bold text-brand-green transition-colors hover:bg-brand-yellowHover focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-brand-cream disabled:opacity-60"
      >
        {status === "loading" ? "Creating account…" : "Create account"}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brand-border" />
        </div>
        <div className="relative flex justify-center text-xs text-brand-muted">
          <span className="bg-brand-card px-2">or continue with</span>
        </div>
      </div>

      {/* Google OAuth button */}
      <button
        type="button"
        onClick={() =>
          signIn("google", {
            callbackUrl: "/",
            login_hint: email || undefined,
          })
        }
        className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-border bg-white py-3 text-sm font-medium text-brand-text transition-all duration-300 hover:bg-brand-cream hover:border-brand-green/40 hover:shadow-[0_0_12px_rgba(45,106,79,0.12)] focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        aria-label="Sign up with Google"
      >
        <GoogleIcon className="h-5 w-5" />
        Sign up with Google
      </button>

      {/* Log in link */}
      <p className="text-center text-sm text-brand-muted">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-semibold text-brand-green underline underline-offset-2"
        >
          Log in
        </a>
      </p>
    </form>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}