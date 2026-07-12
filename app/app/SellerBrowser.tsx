"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SellerCard from "@/components/SellerCard";
import CategoryFilter from "@/components/CategoryFilter";
import Campfire from "@/components/Campfire";
import MakerMap from "@/components/MakerMap";
import { Seller } from "@/lib/types";

type SortOption = "default" | "available" | "delivery" | "contributors" | "az";
type ViewMode = "grid" | "map";

const FRESH_SPOTLIGHT = {
  heading: "What's Fresh Right Now",
  body: "Spring is arriving on Rathdrum Prairie. Painted Hills Garden has their first tomato and herb starts ready for the season, and Lost Creek Honey just opened pre-orders for this summer's clover harvest.",
  cta: "Browse Food & Farm",
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
  const [view, setView] = useState<ViewMode>("grid");

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
    <div id="makers" className="bg-lamp scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Featured + spotlight — hidden when actively filtering */}
        {!isFiltering && featuredSellers.length > 0 && (
          <>
            <section className="mb-14">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <p className="text-gold text-[11px] font-medium tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                    Personally selected
                  </p>
                  <h2 className="font-display text-2xl text-bark">Featured Makers</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredSellers.map((seller) => (
                  <SellerCard key={seller.id} seller={seller} />
                ))}
              </div>
            </section>

            {/* Seasonal — a lit panel against the night */}
            <section className="relative bg-ember rounded-2xl p-7 md:p-9 mb-14 overflow-hidden">
              <div className="absolute inset-0 ember-glow opacity-70" />
              <div className="relative max-w-2xl">
                <p className="text-gold text-[11px] font-medium tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                  Seasonal
                </p>
                <h2 className="font-display text-2xl md:text-3xl text-linen mb-3">
                  {FRESH_SPOTLIGHT.heading}
                </h2>
                <p className="text-linen/65 leading-relaxed mb-5">{FRESH_SPOTLIGHT.body}</p>
                <button
                  onClick={() => setCategory(FRESH_SPOTLIGHT.ctaCategory)}
                  className="text-sm font-medium text-gold border border-gold/40 hover:bg-gold hover:text-ember px-4 py-2 rounded-full transition-colors"
                >
                  {FRESH_SPOTLIGHT.cta}
                </button>
              </div>
            </section>
          </>
        )}

        {/* Search */}
        <div className="relative w-full max-w-lg mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-smoke" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search makers, goods, or neighborhoods…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-linen border border-fence rounded-xl text-bark placeholder-smoke/70 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="mb-4">
          <CategoryFilter selected={category} onChange={setCategory} />
        </div>

        {/* Filter toggles + sort */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Toggle label="Available now" active={availableNow} onChange={setAvailableNow} />
            <Toggle label="Delivers locally" active={deliveryOnly} onChange={setDeliveryOnly} />
            <Toggle label="Custom orders" active={customOrdersOnly} onChange={setCustomOrdersOnly} />
            <Toggle label="Open to barter" active={barterOnly} onChange={setBarterOnly} />
            <Toggle label="Contributors" active={contributorOnly} onChange={setContributorOnly} />
          </div>
          <div className="flex items-center justify-between gap-3">
            {/* Grid / Map segmented toggle */}
            <div className="inline-flex bg-linen border border-fence rounded-full p-0.5" style={{ fontFamily: "var(--font-mono)" }}>
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${view === "grid" ? "bg-ember text-gold" : "text-smoke hover:text-bark"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h6v6H4zM14 6h6v6h-6zM4 16h6v2H4zM14 16h6v2h-6z" /></svg>
                Grid
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${view === "map" ? "bg-ember text-gold" : "text-smoke hover:text-bark"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Map
              </button>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-sm text-bark border border-fence rounded-full px-3 py-1.5 bg-linen focus:outline-none focus:border-gold cursor-pointer disabled:opacity-40"
              style={{ fontFamily: "var(--font-mono)" }}
              disabled={view === "map"}
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
            <p className="text-sm text-smoke" style={{ fontFamily: "var(--font-mono)" }}>
              {filtered.length} {filtered.length === 1 ? "maker" : "makers"} match
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
              className="text-xs text-flamelo hover:text-bark transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Seller grid */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-2xl text-bark">
              {category ?? "All Makers"}
            </h2>
            {!activeFilterCount && !category && (
              <span className="text-sm text-smoke" style={{ fontFamily: "var(--font-mono)" }}>{filtered.length} makers</span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-smoke">
              <p className="font-display text-xl text-bark mb-2">No makers found</p>
              <p className="text-sm">Try adjusting your filters — the market&apos;s bigger than it looks.</p>
            </div>
          ) : view === "map" ? (
            <MakerMap sellers={filtered} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </section>

        {/* VC parent band — the fire everyone gathers around */}
        <section className="relative mt-16 bg-ember rounded-2xl p-8 md:p-10 overflow-hidden flex flex-col md:flex-row items-center gap-6">
          <div className="absolute inset-0 ember-glow opacity-60" />
          <Campfire className="relative w-12 h-12 shrink-0" />
          <div className="relative flex-1 text-center md:text-left">
            <p className="text-gold text-[11px] font-medium tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "var(--font-mono)" }}>Visiting North Idaho?</p>
            <h2 className="font-display text-2xl text-linen mb-1.5">Stay with Village Collective</h2>
            <p className="text-linen/60 text-sm leading-relaxed max-w-lg">
              Premium vacation rentals across Coeur d&apos;Alene, from the same team behind the market. The market and the stay, one village.
            </p>
          </div>
          <a
            href="https://village-collective.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative shrink-0 bg-gold hover:bg-goldsoft text-ember text-sm font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Browse rentals ↗
          </a>
        </section>
      </div>
    </div>
  );
}

function Toggle({
  label, active, onChange,
}: {
  label: string; active: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-ember text-gold border-ember"
          : "bg-linen text-smoke border-fence hover:border-gold/50"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-gold" : "bg-smoke/40"}`} />
      {label}
    </button>
  );
}
