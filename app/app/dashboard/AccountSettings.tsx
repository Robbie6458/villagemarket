"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AccountSettings({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSetPassword() {
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setPassword("");
      setConfirm("");
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      setError((e as Error).message || "Could not set password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-linen rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-base font-medium text-bark">Account</h2>
        <p className="text-bark/55 text-xs mt-0.5">
          Signed in as <span className="text-bark/80">{email}</span>
        </p>
      </div>

      <div className="bg-lamp rounded-xl p-4">
        <p className="text-sm font-medium text-bark mb-1">Password (optional)</p>
        <p className="text-bark/55 text-xs leading-relaxed mb-3">
          By default you sign in with a one-time link we email you — no password needed.
          If you&apos;d rather also use a password, set one here.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          />
        </div>

        {error && <p className="text-flame text-xs mt-2">{error}</p>}

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleSetPassword}
            disabled={saving || !password}
            className="bg-bark hover:bg-flamelo disabled:opacity-50 text-cream font-medium px-5 py-2 rounded-full text-sm transition-colors"
          >
            {saving ? "Saving…" : "Set password"}
          </button>
          {done && <p className="text-flamelo text-sm">Password saved</p>}
        </div>
      </div>
    </section>
  );
}
