"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Campfire from "./Campfire";

const SEEN_KEY = "vm_seen_intro";

// Don't interrupt seller/admin/auth flows with the welcome.
const HIDDEN_PREFIXES = ["/dashboard", "/admin", "/seller", "/auth", "/apply"];

const STEPS = [
  ["Find a maker", "Browse or open the map"],
  ["Add to your bag", "Gather from one maker or several"],
  ["Send a request", "They arrange pickup & payment with you"],
];

export default function IntroPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return;
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [pathname]);

  function dismiss() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-ember/70 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-ember border border-ash rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="absolute inset-0 ember-glow opacity-60 pointer-events-none" />
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 text-linen/40 hover:text-linen text-xl leading-none w-7 h-7 flex items-center justify-center z-10"
        >
          ×
        </button>

        <div className="relative text-center">
          <Campfire flicker className="w-11 h-11 mx-auto mb-4" />
          <p className="text-gold text-[11px] font-medium tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            New here?
          </p>
          <h2 className="font-display text-2xl text-linen mb-2">Welcome to the market</h2>
          <p className="text-linen/65 text-sm leading-relaxed mb-6">
            A local-only market of personally verified North Idaho makers. You buy directly from your neighbors — we&apos;re
            just the introduction.
          </p>

          <div className="space-y-2.5 mb-6 text-left">
            {STEPS.map(([title, sub], i) => (
              <div key={title} className="flex items-center gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-char text-gold flex items-center justify-center text-sm font-display">
                  {i + 1}
                </span>
                <span className="text-sm">
                  <span className="text-linen font-medium">{title}</span>
                  <span className="text-linen/50"> — {sub}</span>
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={dismiss}
            className="w-full bg-gold hover:bg-goldsoft text-ember font-semibold py-3 rounded-full transition-colors mb-2.5"
          >
            Start browsing
          </button>
          <Link
            href="/how-it-works"
            onClick={dismiss}
            className="inline-block text-xs text-linen/50 hover:text-gold transition-colors"
          >
            Read the full story →
          </Link>
        </div>
      </div>
    </div>
  );
}
