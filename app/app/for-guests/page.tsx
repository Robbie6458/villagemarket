"use client";

import Link from "next/link";
import { useGeo } from "@/lib/geo-context";
import SellerCard from "@/components/SellerCard";
import { SELLERS } from "@/lib/seed-data";

// Sellers with delivery enabled — show up to 3
const DELIVERY_SELLERS = SELLERS.filter((s) => s.delivery_available).slice(0, 3);
// Sellers open for custom orders — show up to 3
const CUSTOM_SELLERS = SELLERS.filter((s) => s.custom_orders_open).slice(0, 3);
// Available right now — show up to 3
const AVAILABLE_SELLERS = SELLERS.filter((s) => s.is_available_now).slice(0, 3);

const CONCIERGE_PROMPTS = [
  {
    icon: "🥚",
    question: "Need fresh eggs for the week?",
    answer: "Holbrook Farm delivers to most of the CDA area.",
    href: "/sellers/holbrook-farm",
    cta: "See delivery area",
  },
  {
    icon: "🍯",
    question: "Looking for local honey?",
    answer: "Lost Creek Honey takes pre-orders for their clover harvest.",
    href: "/sellers/lost-creek-honey",
    cta: "Pre-order now",
  },
  {
    icon: "🪵",
    question: "Want a custom souvenir made while you're here?",
    answer: "Webb Woodworks and Cedar & Stone both take rush custom orders.",
    href: "/?customOrdersOnly=true",
    cta: "Browse custom order makers",
  },
  {
    icon: "🌸",
    question: "Looking for something handmade to take home?",
    answer: "North Country Ceramics and Blue Heron Fiber are available now.",
    href: "/?availableNow=true",
    cta: "Shop what's available now",
  },
  {
    icon: "💐",
    question: "Want to make the cabin feel like home?",
    answer: "Local candles, soaps, and art — made right here in North Idaho.",
    href: "/?category=Home+%26+Decor",
    cta: "Browse home goods",
  },
  {
    icon: "🌿",
    question: "Into natural wellness?",
    answer: "Sage & Soot makes small-batch tinctures, salves, and herbal goods.",
    href: "/sellers/sage-and-soot",
    cta: "Visit their shop",
  },
];

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
          <h1
            className="text-4xl md:text-5xl text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            These are your neighbors
            <br />
            <em>for the week.</em>
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-xl">
            Village Market is your local insider — connecting you with North Idaho makers, growers,
            and crafters who live here year-round. Think of it as a personal recommendation from
            your host.
          </p>
        </div>
      </section>

      {/* Geo banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {status === "checking" && (
          <div className="bg-wheat rounded-2xl p-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-bark/30 border-t-moss rounded-full animate-spin shrink-0" />
            <p className="text-bark/70 text-sm">Checking your location to unlock messaging…</p>
          </div>
        )}
        {status !== "checking" && isLocal && (
          <div className="bg-moss/10 border border-moss/20 rounded-2xl p-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-moss rounded-full flex items-center justify-center shrink-0 text-white text-sm">✓</span>
            <div>
              <p className="font-medium text-bark text-sm">Welcome to North Idaho — full access unlocked.</p>
              <p className="text-bark/60 text-xs mt-0.5">You can message any maker directly from their page.</p>
            </div>
          </div>
        )}
        {status !== "checking" && !isLocal && (
          <div className="bg-cream border border-wheat rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-bark text-sm">Unlock direct messaging</p>
              <p className="text-bark/60 text-xs mt-0.5">
                Allow location access to contact makers once you&apos;re here.
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-14">

        {/* Ask a Local prompts */}
        <section>
          <h2 className="text-2xl text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>
            Ask a Local
          </h2>
          <p className="text-bark/55 text-sm mb-6">Common questions guests ask — answered by local makers.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONCIERGE_PROMPTS.map((p) => (
              <Link
                key={p.question}
                href={p.href}
                className="group bg-white rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 block"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5 shrink-0">{p.icon}</span>
                  <div>
                    <p className="font-medium text-bark text-sm leading-snug mb-1 group-hover:text-moss transition-colors">
                      {p.question}
                    </p>
                    <p className="text-bark/55 text-xs leading-relaxed mb-2">{p.answer}</p>
                    <span className="text-xs text-moss font-medium">{p.cta} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Order before you arrive */}
        <section className="bg-bark rounded-2xl p-8 text-cream">
          <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Pro tip</p>
          <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Order before you arrive
          </h2>
          <p className="text-cream/70 leading-relaxed mb-6 max-w-lg">
            Several Village Market makers offer local delivery. Place an order a few days before
            check-in and arrive to find fresh eggs, local honey, or handmade soap already waiting
            in the cabin.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {DELIVERY_SELLERS.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
          <Link
            href="/?deliveryOnly=true"
            className="inline-block bg-cream text-bark text-sm font-medium px-5 py-2.5 rounded-full hover:bg-wheat transition-colors"
          >
            See all delivery makers
          </Link>
        </section>

        {/* Available right now */}
        <section>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-2xl text-bark" style={{ fontFamily: "var(--font-serif)" }}>
              Available right now
            </h2>
            <Link href="/?availableNow=true" className="text-xs text-moss font-medium hover:underline">
              See all →
            </Link>
          </div>
          <p className="text-bark/55 text-sm mb-5">Makers with product ready to go today.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {AVAILABLE_SELLERS.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        </section>

        {/* Custom orders / take home a memory */}
        <section className="bg-cream rounded-2xl p-8">
          <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Take home a memory</p>
          <h2 className="text-2xl text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Custom made while you&apos;re here
          </h2>
          <p className="text-bark/65 leading-relaxed mb-6 max-w-lg text-sm">
            A cutting board with your family name. A ceramic mug in your favorite color. A piece of
            original art from a place you loved. Several Village Market makers take custom orders —
            some can turn projects around within your stay.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {CUSTOM_SELLERS.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
          <Link
            href="/?customOrdersOnly=true"
            className="inline-block bg-bark text-cream text-sm font-medium px-5 py-2.5 rounded-full hover:bg-moss transition-colors"
          >
            Browse custom order makers
          </Link>
        </section>

        {/* VC link */}
        <section className="bg-white rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Need a place to stay?</p>
            <h2 className="text-xl text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>
              Village Collective Rentals
            </h2>
            <p className="text-bark/60 text-sm leading-relaxed">
              Premium vacation rentals across Coeur d&apos;Alene and North Idaho — curated by the
              same team behind Village Market.
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
