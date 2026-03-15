"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [sendUpdates, setSendUpdates] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      fullName,
      password,
      phone,
      sendUpdates,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      {/* Full Name - static label */}
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

      {/* Password - static label + show/hide */}
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
            onClick={() => setShowPassword(!showPassword)}
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

      {/* Phone - static label + country prefix */}
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-semibold text-brand-muted"
        >
          Phone Number
        </label>
        <div className="flex rounded-lg border border-brand-border bg-white transition-all duration-300 focus-within:border-brand-yellow focus-within:ring-2 focus-within:ring-brand-yellow/30 hover:bg-gray-50/80">
          <span
            className="flex items-center gap-1.5 border-r border-brand-border px-3 text-sm text-brand-muted"
            aria-hidden
          >
            <span className="text-base" role="img" aria-hidden>
              🇺🇸
            </span>
            +1
          </span>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full border-0 bg-transparent px-3 py-2.5 text-brand-text outline-none placeholder:text-brand-muted"
            aria-label="Phone number"
            autoComplete="tel-national"
          />
        </div>
      </div>

      {/* Single opt-in checkbox: Send me product updates and news */}
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

      {/* Sign Up button - keep shimmer */}
      <button
        type="submit"
        className="btn-cta-shimmer w-full rounded-full bg-brand-yellow py-3 font-bold text-brand-green transition-colors hover:bg-brand-yellowHover focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-brand-cream"
      >
        Sign Up
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

      {/* Sign in with Google - keep border glow on hover */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-border bg-white py-3 text-sm font-medium text-brand-text transition-all duration-300 hover:bg-brand-cream hover:border-brand-green/40 hover:shadow-[0_0_12px_rgba(45,106,79,0.12)] focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        aria-label="Sign in with Google"
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