"use client";

import { useState, useMemo } from "react";
import SellerCard from "@/components/SellerCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Seller } from "@/lib/types";

type SortOption = "default" | "available" | "delivery" | "contributors" | "az";

const FRESH_SPOTLIGHT = {
  heading: "What's Fresh Right Now",
  body: "Spring is arriving on Rathdrum Prairie. Painted Hills Garden has their first tomato and herb starts ready for the season, and Lost Creek Honey just opened pre-orders for this summer's clover harvest.",
  cta: "Browse Food & Farm →",
  ctaCategory: "Food & Farm",
};

export default function SellerBrowser({
  sellers,
  featuredSellers,
}: {
  sellers: Seller[];
  featuredSellers: Seller[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [contributorOnly, setContributorOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [customOrdersOnly, setCustomOrdersOnly] = useState(false);
  const [barterOnly, setBarterOnly] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");

  const activeFilterCount = [contributorOnly, deliveryOnly, customOrdersOnly, barterOnly, availableNow].filter(Boolean).length;

  const filtered = useMemo(() => {
    let results = sellers.filter((s) => {
      if (contributorOnly && !s.community_contributor) return false;
      if (deliveryOnly && !s.delivery_available) return false;
      if (customOrdersOnly && !s.custom_orders_open) return false;
      if (barterOnly && !s.barter_accepts) return false;
      if (availableNow && !s.is_available_now) return false;
      if (category && !s.categories.includes(category)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.bio.toLowerCase().includes(q) ||
          s.location_label.toLowerCase().includes(q) ||
          s.categories.some((c) => c.toLowerCase().includes(q)) ||
          s.products.some((p) => p.title.toLowerCase().includes(q))
        );
      }
      return true;
    });

    switch (sort) {
      case "available":
        results = [...results].sort((a, b) => Number(b.is_available_now) - Number(a.is_available_now));
        break;
      case "delivery":
        results = [...results].sort((a, b) => Number(b.delivery_available) - Number(a.delivery_available));
        break;
      case "contributors":
        results = [...results].sort((a, b) => Number(b.community_contributor) - Number(a.community_contributor));
        break;
      case "az":
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return results;
  }, [search, category, contributorOnly, deliveryOnly, customOrdersOnly, barterOnly, availableNow, sort, sellers]);

  const isFiltering = search || category || activeFilterCount > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Featured + spotlight — hidden when actively filtering */}
      {!isFiltering && featuredSellers.length > 0 && (
        <>
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-xl text-bark" style={{ fontFamily: "var(--font-serif)" }}>Featured Makers</h2>
              <span className="text-xs text-bark/40">Personally selected</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredSellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          </section>

          <section className="bg-moss rounded-2xl p-6 md:p-8 mb-12 text-white">
            <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Seasonal</p>
            <h2 className="text-2xl md:text-3xl mb-3" style={{ fontFamily: "var(--font-serif)" }}>
              {FRESH_SPOTLIGHT.heading}
            </h2>
            <p className="text-white/75 leading-relaxed mb-5 max-w-2xl">{FRESH_SPOTLIGHT.body}</p>
            <button
              onClick={() => setCategory(FRESH_SPOTLIGHT.ctaCategory)}
              className="text-sm font-medium text-white border border-white/30 hover:border-white px-4 py-2 rounded-full transition-colors"
            >
              {FRESH_SPOTLIGHT.cta}
            </button>
          </section>
        </>
      )}

      {/* Search */}
      <div className="relative w-full max-w-lg mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bark/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search makers, goods, or neighborhoods…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-wheat rounded-2xl text-bark placeholder-bark/35 focus:outline-none focus:border-moss focus:ring-1 focus:ring-moss text-sm shadow-sm"
        />
      </div>

      {/* Category filter */}
      <div className="mb-4">
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {/* Filter toggles + sort */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Toggle label="Available now" active={availableNow} onChange={setAvailableNow} dot="bg-green-400" />
          <Toggle label="Delivers locally" active={deliveryOnly} onChange={setDeliveryOnly} />
          <Toggle label="Custom orders" active={customOrdersOnly} onChange={setCustomOrdersOnly} />
          <Toggle label="Open to barter" active={barterOnly} onChange={setBarterOnly} />
          <Toggle label="Contributors" active={contributorOnly} onChange={setContributorOnly} dot="bg-moss" />
        </div>
        <div className="flex items-center justify-between">
          <div /> {/* spacer */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm text-bark/70 border border-wheat rounded-full px-3 py-1.5 bg-white focus:outline-none focus:border-moss cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="available">Available now first</option>
            <option value="delivery">Delivery first</option>
            <option value="contributors">Contributors first</option>
            <option value="az">A → Z</option>
          </select>
        </div>
      </div>

      {/* Active filter summary */}
      {(activeFilterCount > 0 || category) && (
        <div className="flex items-center gap-3 mb-5">
          <p className="text-sm text-bark/50">
            {filtered.length} {filtered.length === 1 ? "maker" : "makers"} match your filters
          </p>
          <button
            onClick={() => {
              setContributorOnly(false);
              setDeliveryOnly(false);
              setCustomOrdersOnly(false);
              setBarterOnly(false);
              setAvailableNow(false);
              setCategory(null);
              setSearch("");
            }}
            className="text-xs text-clay hover:text-bark transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Seller grid */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl text-bark" style={{ fontFamily: "var(--font-serif)" }}>
            {category ?? "All Makers"}
          </h2>
          {!activeFilterCount && !category && (
            <span className="text-sm text-bark/40">{filtered.length} makers</span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-bark/40">
            <p className="text-lg mb-2">No makers found</p>
            <p className="text-sm">Try adjusting your filters</p>
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
          <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Visiting North Idaho?</p>
          <h2 className="text-2xl text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>Stay with Village Collective</h2>
          <p className="text-bark/60 text-sm leading-relaxed">
            Premium vacation rentals across Coeur d&apos;Alene and the surrounding area — curated by the same team behind Village Market.
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
  );
}

function Toggle({
  label, active, onChange, dot,
}: {
  label: string; active: boolean; onChange: (v: boolean) => void; dot?: string;
}) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-bark text-cream border-bark"
          : "bg-white text-bark/70 border-wheat hover:border-bark/30"
      }`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${active ? dot : "bg-bark/30"}`} />}
      {label}
    </button>
  );
}
