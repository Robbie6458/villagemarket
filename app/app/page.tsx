"use client";

import { useState, useMemo } from "react";
import SellerCard from "@/components/SellerCard";
import CategoryFilter from "@/components/CategoryFilter";
import { GeoBanner } from "@/components/GeoGate";
import { SELLERS, FEATURED_SELLERS } from "@/lib/seed-data";

const FRESH_SPOTLIGHT = {
  heading: "What's Fresh Right Now",
  body: "Spring is arriving on Rathdrum Prairie. Painted Hills Garden has their first tomato and herb starts ready for the season, and Lost Creek Honey just opened pre-orders for this summer's clover harvest.",
  cta: "Browse Food & Farm →",
  ctaCategory: "Food & Farm",
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [contributorOnly, setContributorOnly] = useState(false);

  const filtered = useMemo(() => {
    return SELLERS.filter((s) => {
      if (contributorOnly && !s.community_contributor) return false;
      if (category && !s.categories.includes(category)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.bio.toLowerCase().includes(q) ||
          s.location_label.toLowerCase().includes(q) ||
          s.categories.some((c) => c.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, category, contributorOnly]);

  return (
    <>
      <GeoBanner />

      {/* Hero */}
      <section className="bg-cream border-b border-wheat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
              Coeur d&apos;Alene · North Idaho
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl text-bark leading-tight mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Real people.
              <br />
              <em>Real goods.</em>
              <br />
              Right here.
            </h1>
            <p className="text-bark/60 text-lg mb-8 leading-relaxed">
              A local-only marketplace for North Idaho makers, growers, and
              creators. Every seller personally verified. No dropshipping, no
              algorithms.
            </p>

            {/* Search */}
            <div className="relative max-w-lg">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bark/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search makers, goods, or neighborhoods…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-wheat rounded-2xl text-bark placeholder-bark/35 focus:outline-none focus:border-moss focus:ring-1 focus:ring-moss text-sm shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Featured sellers */}
        {!search && !category && !contributorOnly && (
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-5">
              <h2
                className="text-xl text-bark"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Featured Makers
              </h2>
              <span className="text-xs text-bark/40">Personally selected</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURED_SELLERS.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          </section>
        )}

        {/* Fresh spotlight */}
        {!search && !category && !contributorOnly && (
          <section className="bg-moss rounded-2xl p-6 md:p-8 mb-12 text-white">
            <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">
              Seasonal
            </p>
            <h2
              className="text-2xl md:text-3xl mb-3"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {FRESH_SPOTLIGHT.heading}
            </h2>
            <p className="text-white/75 leading-relaxed mb-5 max-w-2xl">
              {FRESH_SPOTLIGHT.body}
            </p>
            <button
              onClick={() => setCategory(FRESH_SPOTLIGHT.ctaCategory)}
              className="text-sm font-medium text-white border border-white/30 hover:border-white px-4 py-2 rounded-full transition-colors"
            >
              {FRESH_SPOTLIGHT.cta}
            </button>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <CategoryFilter selected={category} onChange={setCategory} />
          </div>
          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
            <div
              onClick={() => setContributorOnly(!contributorOnly)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                contributorOnly ? "bg-moss" : "bg-wheat"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  contributorOnly ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <span className="text-sm text-bark/70 whitespace-nowrap">
              Contributors only
            </span>
          </label>
        </div>

        {/* Seller grid */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2
              className="text-xl text-bark"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {category ?? "All Makers"}
            </h2>
            <span className="text-sm text-bark/40">
              {filtered.length} {filtered.length === 1 ? "maker" : "makers"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-bark/40">
              <p className="text-lg mb-2">No makers found</p>
              <p className="text-sm">Try a different search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </section>

        {/* VC promo */}
        <section className="mt-16 bg-cream rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">
              Visiting North Idaho?
            </p>
            <h2
              className="text-2xl text-bark mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Stay with Village Collective
            </h2>
            <p className="text-bark/60 text-sm leading-relaxed">
              Premium vacation rentals across Coeur d&apos;Alene and the surrounding
              area — curated by the same team behind Village Market.
            </p>
          </div>
          <a
            href="https://village-collective.com"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-bark hover:bg-moss text-cream text-sm font-medium px-6 py-3 rounded-full transition-colors"
          >
            Browse rentals ↗
          </a>
        </section>
      </div>
    </>
  );
}
