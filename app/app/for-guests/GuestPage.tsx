"use client";

import Link from "next/link";
import { useGeo } from "@/lib/geo-context";
import SellerCard from "@/components/SellerCard";
import { Seller } from "@/lib/types";

const CONCIERGE_PROMPTS = [
  {
    icon: "🥚",
    question: "Need fresh eggs or produce for the week?",
    answer: "Several local farms on Village Market deliver to the CDA area.",
    href: "/?category=Food+%26+Farm&deliveryOnly=true",
    cta: "Browse food & farm makers",
  },
  {
    icon: "🍯",
    question: "Looking for local honey or preserves?",
    answer: "North Idaho beekeepers and food makers take pre-orders and deliver.",
    href: "/?category=Food+%26+Farm",
    cta: "Shop food & farm",
  },
  {
    icon: "🪵",
    question: "Want a custom souvenir made while you're here?",
    answer: "Several makers take rush custom orders — some can turn projects around within your stay.",
    href: "/?customOrdersOnly=true",
    cta: "Browse custom order makers",
  },
  {
    icon: "🌸",
    question: "Looking for something handmade to take home?",
    answer: "Browse makers with product ready today — no wait, no shipping.",
    href: "/?availableNow=true",
    cta: "Shop what's available now",
  },
  {
    icon: "💐",
    question: "Want to make the cabin feel like home?",
    answer: "Local candles, soaps, and art — made right here in North Idaho.",
    href: "/",
    cta: "Browse all makers",
  },
  {
    icon: "🌿",
    question: "Into natural wellness?",
    answer: "Local apothecary makers craft small-batch tinctures, salves, and herbal goods.",
    href: "/?category=Apothecary+%26+Wellness",
    cta: "Browse apothecary & wellness",
  },
];

export default function GuestPage({
  deliverySellers,
  availableSellers,
  customSellers,
}: {
  deliverySellers: Seller[];
  availableSellers: Seller[];
  customSellers: Seller[];
}) {
  const { isLocal, status, prompt } = useGeo();

  return (
    <div className="min-h-screen bg-lamp">
      {/* Hero */}
      <section className="relative bg-ember overflow-hidden">
        <div className="absolute inset-0 ember-glow opacity-70" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="text-gold text-xs font-medium tracking-[0.24em] uppercase mb-4" style={{ fontFamily: "var(--font-mono)" }}>
            A Village Collective Welcome
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-linen mb-4 leading-tight">
            These are your neighbors
            <br />
            <em className="text-gold" style={{ fontStyle: "italic" }}>for the week.</em>
          </h1>
          <p className="text-linen/65 text-lg leading-relaxed max-w-xl">
            Village Market is your local insider — connecting you with North Idaho makers, growers,
            and crafters who live here year-round. Think of it as a personal recommendation from
            your host.
          </p>
        </div>
      </section>

      {/* Geo banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {status === "checking" && (
          <div className="bg-fence rounded-2xl p-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-bark/30 border-t-gold rounded-full animate-spin shrink-0" />
            <p className="text-bark/70 text-sm">Checking your location to unlock messaging…</p>
          </div>
        )}
        {status !== "checking" && isLocal && (
          <div className="bg-gold/15 border border-gold/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-gold rounded-full flex items-center justify-center shrink-0 text-ember text-sm">✓</span>
            <div>
              <p className="font-medium text-bark text-sm">Welcome to North Idaho — full access unlocked.</p>
              <p className="text-bark/60 text-xs mt-0.5">You can message any maker directly from their page.</p>
            </div>
          </div>
        )}
        {status !== "checking" && !isLocal && (
          <div className="bg-lamp border border-fence rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-bark text-sm">Unlock direct messaging</p>
              <p className="text-bark/60 text-xs mt-0.5">
                Allow location access to contact makers once you&apos;re here.
              </p>
            </div>
            <button
              onClick={prompt}
              className="shrink-0 bg-flame text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-bark transition-colors"
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
                className="group bg-linen rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 block"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5 shrink-0">{p.icon}</span>
                  <div>
                    <p className="font-medium text-bark text-sm leading-snug mb-1 group-hover:text-flamelo transition-colors">
                      {p.question}
                    </p>
                    <p className="text-bark/55 text-xs leading-relaxed mb-2">{p.answer}</p>
                    <span className="text-xs text-flamelo font-medium">{p.cta} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Order before you arrive */}
        {deliverySellers.length > 0 && (
          <section className="bg-bark rounded-2xl p-8 text-cream">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Pro tip</p>
            <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-serif)" }}>
              Order before you arrive
            </h2>
            <p className="text-cream/70 leading-relaxed mb-6 max-w-lg">
              Several Village Market makers offer local delivery. Place an order a few days before
              check-in and arrive to find fresh eggs, local honey, or handmade soap already waiting
              in the cabin.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {deliverySellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
            <Link
              href="/?deliveryOnly=true"
              className="inline-block bg-lamp text-bark text-sm font-medium px-5 py-2.5 rounded-full hover:bg-fence transition-colors"
            >
              See all delivery makers
            </Link>
          </section>
        )}

        {/* Available right now */}
        {availableSellers.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-2xl text-bark" style={{ fontFamily: "var(--font-serif)" }}>
                Available right now
              </h2>
              <Link href="/?availableNow=true" className="text-xs text-flamelo font-medium hover:underline">
                See all →
              </Link>
            </div>
            <p className="text-bark/55 text-sm mb-5">Makers with product ready to go today.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {availableSellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          </section>
        )}

        {/* Custom orders / take home a memory */}
        {customSellers.length > 0 && (
          <section className="bg-lamp rounded-2xl p-8">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Take home a memory</p>
            <h2 className="text-2xl text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
              Custom made while you&apos;re here
            </h2>
            <p className="text-bark/65 leading-relaxed mb-6 max-w-lg text-sm">
              A cutting board with your family name. A ceramic mug in your favorite color. A piece of
              original art from a place you loved. Several Village Market makers take custom orders —
              some can turn projects around within your stay.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {customSellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
            <Link
              href="/?customOrdersOnly=true"
              className="inline-block bg-bark text-cream text-sm font-medium px-5 py-2.5 rounded-full hover:bg-flamelo transition-colors"
            >
              Browse custom order makers
            </Link>
          </section>
        )}

        {/* VC link */}
        <section className="bg-linen rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Need a place to stay?</p>
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
            className="shrink-0 bg-bark hover:bg-flamelo text-cream text-sm font-medium px-6 py-3 rounded-full transition-colors"
          >
            Browse rentals ↗
          </a>
        </section>
      </div>
    </div>
  );
}
