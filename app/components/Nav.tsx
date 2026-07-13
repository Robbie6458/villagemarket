"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useGeo } from "@/lib/geo-context";
import { useBag } from "@/lib/bag-context";
import { createClient } from "@/lib/supabase/client";
import Campfire from "./Campfire";

function BagIcon({ count, className = "" }: { count: number; className?: string }) {
  return (
    <Link
      href="/bag"
      className={`relative text-goldsoft hover:text-gold transition-colors ${className}`}
      aria-label={count > 0 ? `View bag, ${count} items` : "View bag"}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-flame text-ember text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center" style={{ fontFamily: "var(--font-mono)" }}>
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLocal, status } = useGeo();
  const { count } = useBag();
  const [sellerLoggedIn, setSellerLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSellerLoggedIn(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSellerLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const sellerLink = sellerLoggedIn
    ? { href: "/dashboard", label: "My Dashboard" }
    : { href: "/seller/login", label: "Seller Sign In" };

  return (
    <header className="sticky top-0 z-50 bg-ember border-b border-ash/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark — campfire mark ties us to Village Collective */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Campfire flicker className="w-8 h-8 shrink-0" />
            <span className="flex flex-col leading-none">
              <span className="text-gold/70 text-[9px] font-medium tracking-[0.22em] uppercase mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                A Village Collective Project
              </span>
              <span className="text-linen text-[19px] tracking-tight font-display leading-none">
                Village <span className="text-gold">Market</span>
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <Link href="/" className="text-linen/80 hover:text-gold text-sm transition-colors">Browse</Link>
            <Link href="/for-guests" className="text-linen/80 hover:text-gold text-sm transition-colors">For Guests</Link>
            <Link href="/barter" className="text-linen/80 hover:text-gold text-sm transition-colors">Barter</Link>
            <Link href={sellerLink.href} className="text-linen/45 hover:text-gold text-sm transition-colors">
              {sellerLink.label}
            </Link>
            <Link href="/apply" className="border border-gold/50 text-gold hover:bg-gold hover:text-ember text-sm font-medium px-4 py-1.5 rounded-full transition-colors">
              Apply to Sell
            </Link>
            <BagIcon count={count} />
            {status !== "checking" && (
              <span className={`flex items-center gap-1.5 text-[11px] ${isLocal ? "text-emerald-400/90" : "text-linen/40"}`} style={{ fontFamily: "var(--font-mono)" }}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLocal ? "bg-emerald-400" : "bg-flame"}`} />
                {isLocal ? "LOCAL" : "BROWSING"}
              </span>
            )}
          </nav>

          {/* Mobile: bag always visible + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            {status !== "checking" && (
              <span
                className={`w-2 h-2 rounded-full mr-1 shrink-0 ${isLocal ? "bg-emerald-400" : "bg-flame"}`}
                aria-label={isLocal ? "Browsing locally" : "Browsing from outside the area"}
                title={isLocal ? "Local access" : "Browse only"}
              />
            )}
            <BagIcon count={count} className="p-2" />
            <button className="text-linen p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-ember border-t border-ash/70 px-4 py-5 flex flex-col gap-4">
          <Link href="/" className="text-linen text-base" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/for-guests" className="text-linen text-base" onClick={() => setMenuOpen(false)}>For Guests</Link>
          <Link href="/barter" className="text-linen text-base" onClick={() => setMenuOpen(false)}>Barter</Link>
          <Link href={sellerLink.href} className="text-linen/50 text-base" onClick={() => setMenuOpen(false)}>
            {sellerLink.label}
          </Link>
          <Link href="/apply" className="border border-gold/50 text-gold text-sm font-medium px-4 py-2 rounded-full text-center" onClick={() => setMenuOpen(false)}>
            Apply to Sell
          </Link>
          {status !== "checking" && (
            <span className={`flex items-center gap-2 text-xs pt-1 ${isLocal ? "text-emerald-400/90" : "text-linen/40"}`} style={{ fontFamily: "var(--font-mono)" }}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLocal ? "bg-emerald-400" : "bg-flame"}`} />
              {isLocal ? "LOCAL ACCESS" : "BROWSE ONLY — VISIT NORTH IDAHO TO UNLOCK"}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
