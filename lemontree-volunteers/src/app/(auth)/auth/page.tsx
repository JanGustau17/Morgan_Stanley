"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { Phone, Mail, Leaf, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Step = "choose" | "phone-input" | "verify-code" | "sms-opt-in";

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [volunteerId, setVolunteerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sms/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setStep("verify-code");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sms/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setVolunteerId(data.volunteerId);
      setStep("sms-opt-in");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleOptInSubmit() {
    setLoading(true);
    try {
      if (volunteerId) {
        await fetch("/api/sms/opt-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ volunteerId, smsOptIn }),
        });
      }
      router.push(callbackUrl);
    } catch {
      router.push(callbackUrl);
    }
  }

  function handleGoogleSignIn() {
    signIn("google", { callbackUrl });
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 mb-4 shadow-lg shadow-green-600/25">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Lemontree</h1>
        <p className="text-gray-500 mt-1">
          Join the volunteer community
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-8">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === "choose" && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
            >
              <Mail className="w-5 h-5 text-gray-500" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={() => setStep("phone-input")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all shadow-md shadow-green-600/20 cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              Continue with Phone
            </button>
          </div>
        )}

        {step === "phone-input" && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Include country code (e.g. +1 for US)
              </p>
            </div>
            <button
              onClick={handleSendCode}
              disabled={!phone.trim() || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-green-600/20 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={() => {
                setStep("choose");
                setError("");
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              Back to sign in options
            </button>
          </div>
        )}

        {step === "verify-code" && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Verification code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-center text-2xl tracking-[0.3em] font-mono text-gray-900 placeholder:text-gray-300"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Enter the 6-digit code sent to {phone}
              </p>
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={code.length !== 6 || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-green-600/20 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={() => {
                setStep("phone-input");
                setCode("");
                setError("");
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              Use a different number
            </button>
          </div>
        )}

        {step === "sms-opt-in" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                You&apos;re verified!
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                One last thing before you get started
              </p>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Receive SMS notifications
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Get reminders about upcoming campaigns and team updates.
                  You can opt out anytime by replying STOP.
                </p>
              </div>
            </label>

            <button
              onClick={handleOptInSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-all shadow-md shadow-green-600/20 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        By continuing, you agree to Lemontree&apos;s Terms of Service and
        Privacy Policy.
      </p>
    </div>
  );
}
