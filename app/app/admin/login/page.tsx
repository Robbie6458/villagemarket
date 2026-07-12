"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);

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

    window.location.href = "/admin";
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
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
      <div className="min-h-screen bg-lamp flex items-center justify-center px-4">
        <div className="bg-linen rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
          <h2 className="text-xl text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            Check your email
          </h2>
          <p className="text-bark/60 text-sm leading-relaxed mb-5">
            Sign-in link sent to <strong>{email}</strong>.
          </p>
          <button
            onClick={() => { setMagicSent(false); setEmail(""); }}
            className="text-xs text-bark/40 hover:text-bark"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lamp flex items-center justify-center px-4">
      <div className="bg-linen rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>
          Admin
        </h1>
        <p className="text-bark/50 text-sm mb-6">Village Market dashboard</p>

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
              className="w-full bg-bark hover:bg-flamelo disabled:bg-bark/40 text-cream font-medium py-2.5 rounded-full transition-colors text-sm"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
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
              className="w-full bg-bark hover:bg-flamelo disabled:bg-bark/40 text-cream font-medium py-2.5 rounded-full transition-colors text-sm"
            >
              {loading ? "Sending…" : "Send sign-in link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
