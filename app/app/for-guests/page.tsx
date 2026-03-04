"use client";

import { useGeo } from "@/lib/geo-context";
import SellerCard from "@/components/SellerCard";
import { SELLERS } from "@/lib/seed-data";

const GUEST_PICKS = SELLERS.filter((s) => s.featured);
const GUEST_CATEGORIES = ["Food & Farm", "Art & Photography", "Apothecary & Wellness", "Garden & Plant"];

export default function ForGuestsPage() {
  const { isLocal, status, prompt } = useGeo();

  return (
    <div className="min-h-screen bg-mist">
      {/* Hero */}
      <section className="bg-moss text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
            A Village Collective Welcome
          </p>
          <h1 className="text-4xl md:text-5xl text-white mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            During your stay,
            <br />
            <em>these are your neighbors.</em>
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-xl">
            Village Market connects you with the makers, growers, and creators who live here year-round.
            Everything you find here is made locally — by real people, by hand, right here in North Idaho.
          </p>
        </div>
      </section>

      {/* Geo status */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {status === "checking" && (
          <div className="bg-wheat rounded-2xl p-5 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-bark/30 border-t-moss rounded-full animate-spin" />
            <p className="text-bark/70 text-sm">Checking your location…</p>
          </div>
        )}
        {status !== "checking" && isLocal && (
          <div className="bg-moss/10 border border-moss/20 rounded-2xl p-5 flex items-center gap-3">
            <span className="w-8 h-8 bg-moss rounded-full flex items-center justify-center shrink-0 text-white text-sm">✓</span>
            <div>
              <p className="font-medium text-bark text-sm">You&apos;re in! Full access unlocked.</p>
              <p className="text-bark/60 text-xs mt-0.5">Welcome to North Idaho — you can message any maker directly.</p>
            </div>
          </div>
        )}
        {status !== "checking" && !isLocal && (
          <div className="bg-cream border border-wheat rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-bark text-sm">Location not confirmed yet</p>
              <p className="text-bark/60 text-xs mt-0.5">
                Allow location access to unlock the ability to message and connect with local makers during your stay.
              </p>
            </div>
            <button
              onClick={prompt}
              className="shrink-0 bg-moss text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-bark transition-colors"
            >
              Allow location
            </button>
          </div>
        )}
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        {/* Guest picks */}
        <section>
          <h2 className="text-2xl text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            Guest Picks
          </h2>
          <p className="text-bark/60 text-sm mb-5">Personally selected by the Village Collective team</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUEST_PICKS.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        </section>

        {/* Order before you arrive */}
        <section className="bg-bark rounded-2xl p-8 text-cream">
          <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Pro tip</p>
          <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Order before you arrive
          </h2>
          <p className="text-cream/70 leading-relaxed mb-5 max-w-lg">
            Several Village Market makers offer local delivery. Order a few days before your check-in
            and arrive to fresh eggs, local honey, or handmade soap already waiting in the cabin.
          </p>
          <a
            href="/?delivery=true"
            className="inline-block bg-cream text-bark text-sm font-medium px-5 py-2.5 rounded-full hover:bg-wheat transition-colors"
          >
            Browse delivery sellers
          </a>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            Shop by category
          </h2>
          <p className="text-bark/60 text-sm mb-5">Most popular categories for visitors</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GUEST_CATEGORIES.map((cat) => {
              const catSellers = SELLERS.filter((s) => s.categories.includes(cat));
              return (
                <a
                  key={cat}
                  href={`/?category=${encodeURIComponent(cat)}`}
                  className="bg-white rounded-2xl p-5 text-center hover:shadow-md transition-all hover:-translate-y-0.5 group"
                >
                  <p className="font-medium text-bark text-sm group-hover:text-moss transition-colors leading-tight mb-1">
                    {cat}
                  </p>
                  <p className="text-bark/40 text-xs">{catSellers.length} makers</p>
                </a>
              );
            })}
          </div>
        </section>

        {/* VC link back */}
        <section className="bg-cream rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Need a place to stay?</p>
            <h2 className="text-xl text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>
              Village Collective Rentals
            </h2>
            <p className="text-bark/60 text-sm leading-relaxed">
              Premium vacation rentals across Coeur d&apos;Alene and North Idaho, curated by the same team behind Village Market.
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
    </div>
  );
}
