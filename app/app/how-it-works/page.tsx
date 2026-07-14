import Link from "next/link";
import type { Metadata } from "next";
import Campfire from "@/components/Campfire";

export const metadata: Metadata = {
  title: "How Village Market Works",
  description: "The ethos behind Village Market and how to make your first purchase from a local maker.",
};

const STEPS = [
  {
    n: "1",
    title: "Find a maker",
    body: "Browse the market or open the map to see makers glowing near you. Every one is a real, verified local — a grower, baker, woodworker, or crafter who lives right here.",
  },
  {
    n: "2",
    title: "Add to your bag",
    body: "Gather what you'd like from one maker or several. Nothing is charged — your bag is just a list of what you want to ask for.",
  },
  {
    n: "3",
    title: "Send a request",
    body: "Send your bag to the makers. They'll reach out directly to work out pickup or delivery and how you'd like to pay — cash, Venmo, PayPal, a trade, whatever suits you both.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-lamp">
      {/* Fireside intro */}
      <section className="relative bg-ember overflow-hidden">
        <div className="absolute inset-0 ember-glow opacity-70" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <Campfire flicker className="w-12 h-12 mx-auto mb-6" />
          <p className="text-gold text-xs font-medium tracking-[0.24em] uppercase mb-4" style={{ fontFamily: "var(--font-mono)" }}>
            How it works
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-linen leading-tight mb-5">
            A digital market that
            <br />
            <em className="text-gold" style={{ fontStyle: "italic" }}>works like a real one.</em>
          </h1>
          <p className="text-linen/65 text-lg leading-relaxed max-w-xl mx-auto">
            Village Market isn&apos;t a shipping warehouse or a feed of ads. It&apos;s a year-round farmers market you
            can carry in your pocket — real neighbors selling real goods, and an introduction handled with care.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Ethos */}
        <section className="mb-14">
          <h2 className="font-display text-2xl text-bark mb-4">Why we do it this way</h2>
          <div className="space-y-4 text-bark/80 text-[15px] leading-relaxed">
            <p>
              Every maker on Village Market is personally known to us — no dropshippers, no resellers, no algorithms
              deciding what you see. Full access is for people who are actually here in North Idaho, because this
              market is about supporting the people in your own community.
            </p>
            <p>
              We don&apos;t process your payment or take a cut of the sale. The exchange happens directly between you and
              the maker, the way it would at a stall on a Saturday morning. We&apos;re just the introduction — and we
              keep the whole thing ad-free and independent.
            </p>
          </div>
        </section>

        {/* 3 steps */}
        <section className="mb-14">
          <p className="text-gold text-[11px] font-medium tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            Your first purchase
          </p>
          <h2 className="font-display text-2xl text-bark mb-6">Three steps, start to finish</h2>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4 bg-linen border border-fence rounded-2xl p-5">
                <div className="shrink-0 w-9 h-9 rounded-full bg-ember text-gold flex items-center justify-center font-display text-lg">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-display text-lg text-bark mb-1">{s.title}</h3>
                  <p className="text-smoke text-sm leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-smoke text-sm mt-5 leading-relaxed">
            That&apos;s it — no checkout, no card on file, no shipping labels. Just a neighborly hello that leads to
            something good.
          </p>
        </section>

        {/* CTA */}
        <section className="relative bg-ember rounded-2xl p-8 md:p-10 overflow-hidden text-center">
          <div className="absolute inset-0 ember-glow opacity-60" />
          <div className="relative">
            <h2 className="font-display text-2xl md:text-3xl text-linen mb-3">Ready to meet your neighbors?</h2>
            <p className="text-linen/65 text-sm leading-relaxed mb-6 max-w-md mx-auto">
              The makers are waiting by the fire. Come see what North Idaho is making this season.
            </p>
            <Link
              href="/"
              className="inline-block bg-gold hover:bg-goldsoft text-ember font-semibold px-7 py-3 rounded-full transition-colors"
            >
              Meet the makers
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
