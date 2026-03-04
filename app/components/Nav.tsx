"use client";

import Link from "next/link";
import { useState } from "react";
import { useGeo } from "@/lib/geo-context";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLocal, status } = useGeo();

  return (
    <header className="sticky top-0 z-50 bg-bark shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-sage text-[10px] font-medium tracking-widest uppercase">
              A Village Collective Project
            </span>
            <span className="text-cream text-xl tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
              Village Market
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-wheat hover:text-white text-sm font-medium transition-colors">Browse</Link>
            <Link href="/for-guests" className="text-wheat hover:text-white text-sm font-medium transition-colors">For Guests</Link>
            <Link href="/apply" className="text-wheat hover:text-white text-sm font-medium transition-colors">Sell Here</Link>
            <Link href="/apply" className="bg-clay hover:bg-clay-lt text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
              Apply to Sell
            </Link>
            {status !== "checking" && (
              <span className="flex items-center gap-1.5 text-xs text-sage">
                <span className={`w-2 h-2 rounded-full ${isLocal ? "bg-sage" : "bg-clay"}`} />
                {isLocal ? "Local access" : "Browse only"}
              </span>
            )}
          </nav>

          <button className="md:hidden text-wheat p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-bark border-t border-moss/30 px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-wheat text-base font-medium" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/for-guests" className="text-wheat text-base font-medium" onClick={() => setMenuOpen(false)}>For Guests</Link>
          <Link href="/apply" className="text-wheat text-base font-medium" onClick={() => setMenuOpen(false)}>Sell Here</Link>
          <Link href="/apply" className="bg-clay text-white text-sm font-medium px-4 py-2 rounded-full text-center" onClick={() => setMenuOpen(false)}>
            Apply to Sell
          </Link>
        </div>
      )}
    </header>
  );
}
