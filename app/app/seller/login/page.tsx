"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SellerLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError("The sign-in link has expired or is invalid. Please try again.");
    }
  }, [searchParams]);

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicSent(true);
    setLoading(false);
  }

  if (magicSent) {
    return (
      <div className="bg-linen rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-flamelo" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
        <h2 className="text-xl text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          Check your email
        </h2>
        <p className="text-bark/60 text-sm leading-relaxed mb-5">
          We sent a sign-in link to <strong>{email}</strong>. Click it to access your dashboard.
        </p>
        <button
          onClick={() => { setMagicSent(false); setEmail(""); }}
          className="text-xs text-bark/40 hover:text-bark transition-colors"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="bg-linen rounded-2xl shadow-sm p-8 w-full max-w-sm">
      <div className="mb-6">
        <h1 className="text-2xl text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>
          Seller Sign In
        </h1>
        <p className="text-bark/50 text-sm">Access your Village Market storefront</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-lamp rounded-xl p-1 mb-5 gap-1">
        <button
          type="button"
          onClick={() => { setMode("password"); setError(""); }}
          className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
            mode === "password" ? "bg-linen text-bark shadow-sm" : "text-bark/50 hover:text-bark"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => { setMode("magic"); setError(""); }}
          className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
            mode === "magic" ? "bg-linen text-bark shadow-sm" : "text-bark/50 hover:text-bark"
          }`}
        >
          Email link
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          />
          {error && <p className="text-flame text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-goldsoft disabled:bg-gold/40 text-ember font-medium py-2.5 rounded-full transition-colors text-sm"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-xs text-bark/40">
            Forgot your password?{" "}
            <button
              type="button"
              onClick={() => { setMode("magic"); setError(""); }}
              className="text-flamelo hover:underline"
            >
              Use an email link instead
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          />
          {error && <p className="text-flame text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-goldsoft disabled:bg-gold/40 text-ember font-medium py-2.5 rounded-full transition-colors text-sm"
          >
            {loading ? "Sending link…" : "Send sign-in link"}
          </button>
          <p className="text-center text-xs text-bark/40">
            We&apos;ll email you a one-click link — no password needed.
          </p>
        </form>
      )}

      <p className="text-center text-xs text-bark/40 mt-6">
        Not a seller yet?{" "}
        <a href="/apply" className="text-flamelo hover:underline">
          Apply to join
        </a>
      </p>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <div className="min-h-screen bg-lamp flex items-center justify-center px-4">
      <Suspense fallback={<div className="bg-linen rounded-2xl shadow-sm p-8 w-full max-w-sm h-64" />}>
        <SellerLoginForm />
      </Suspense>
    </div>
  );
}
