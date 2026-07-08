"use client";

import { useState } from "react";
import { subscribeToMailerLite } from "@/lib/mailerlite";

type FormStatus = "idle" | "submitting" | "sent" | "error";

export default function HeroSignupForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [role, setRole] = useState<"buyer" | "maker">("buyer");
  const [isGuest, setIsGuest] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const name  = (form.elements.namedItem("name")  as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();

    const { success } = await subscribeToMailerLite(email, {
      name,
      role,
      is_vacation_guest: isGuest ? "yes" : "no",
    });
    setStatus(success ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-7 text-center">
        <div className="w-12 h-12 bg-moss/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-moss" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>
          You&apos;re in the loop.
        </h3>
        <p className="text-bark/55 text-sm leading-relaxed">
          We&apos;ll send you a weekly digest of new makers, seasonal arrivals, and North Idaho finds.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-7">
      <p className="text-sage text-[10px] font-medium tracking-widest uppercase mb-1">Stay in the loop</p>
      <h2 className="text-xl text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>
        New makers, weekly.
      </h2>
      <p className="text-bark/55 text-sm leading-relaxed mb-5">
        Get a curated digest of new listings, seasonal finds, and North Idaho maker stories — straight to your inbox.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-bark mb-1.5">First Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Sarah"
              className="w-full px-3 py-2.5 border border-wheat rounded-xl text-bark placeholder-bark/35 focus:outline-none focus:border-moss focus:ring-1 focus:ring-moss text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-bark mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@email.com"
              className="w-full px-3 py-2.5 border border-wheat rounded-xl text-bark placeholder-bark/35 focus:outline-none focus:border-moss focus:ring-1 focus:ring-moss text-sm bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-bark mb-2">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {(["buyer", "maker"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                  role === r
                    ? "bg-bark text-cream border-bark"
                    : "bg-white text-bark/70 border-wheat hover:border-bark/30"
                }`}
              >
                {r === "buyer" ? "Buyer / Visitor" : "Local Maker"}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isGuest}
            onChange={(e) => setIsGuest(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-wheat accent-moss cursor-pointer shrink-0"
          />
          <span className="text-sm text-bark/70 group-hover:text-bark transition-colors leading-snug">
            I&apos;m staying at a Village Collective rental
          </span>
        </label>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-moss hover:bg-bark disabled:bg-moss/40 text-white font-medium py-3 rounded-full transition-colors text-sm"
        >
          {status === "submitting" ? "Signing up…" : "Get weekly updates"}
        </button>

        {status === "error" && (
          <p className="text-clay text-xs text-center">
            Something went wrong — please try again.
          </p>
        )}

        <p className="text-bark/40 text-xs text-center">
          No spam. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
