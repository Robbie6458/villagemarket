import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { GeoBanner } from "@/components/GeoGate";
import Campfire from "@/components/Campfire";
import SellerBrowser from "./SellerBrowser";
import { Seller } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("sellers")
    .select("*, products(*)")
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("name");

  const sellers = (data ?? []) as unknown as Seller[];
  const featuredSellers = sellers.filter((s) => s.featured);
  const makerCount = sellers.length;

  return (
    <>
      <GeoBanner />

      {/* ── Fireside hero ── the night market, lit by firelight ── */}
      <section className="relative bg-ember overflow-hidden">
        {/* Real North Idaho garden — goods glowing up out of the dark soil */}
        <Image
          src="/hero.jpg"
          alt="Young greens growing in a North Idaho garden bed"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Warm night scrim — keeps text legible, sinks the photo into firelight */}
        <div className="absolute inset-0 bg-ember/72" />
        <div className="absolute inset-0 bg-gradient-to-b from-ember/85 via-ember/55 to-ember/95" />
        <div className="absolute inset-0 ember-glow opacity-80" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <Campfire flicker className="w-14 h-14 mx-auto mb-6" />

          <p className="text-gold text-xs font-medium tracking-[0.28em] uppercase mb-6" style={{ fontFamily: "var(--font-mono)" }}>
            Coeur d&apos;Alene · North Idaho
          </p>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-linen leading-[1.05] mb-6">
            Real people.
            <br />
            <em className="text-gold not-italic" style={{ fontStyle: "italic" }}>Real goods.</em>
            <br />
            Right here.
          </h1>

          <p className="text-linen/65 text-lg leading-relaxed max-w-xl mx-auto mb-9">
            A local-only market for North Idaho makers, growers, and creators.
            Every one personally known to us. No dropshipping, no algorithms, no strangers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="#makers"
              className="w-full sm:w-auto bg-gold hover:bg-goldsoft text-ember font-semibold px-7 py-3 rounded-full transition-colors"
            >
              Meet the makers
            </Link>
            <Link
              href="/apply"
              className="w-full sm:w-auto border border-linen/25 text-linen hover:border-gold hover:text-gold font-medium px-7 py-3 rounded-full transition-colors"
            >
              Apply to sell
            </Link>
          </div>

          {/* Trust row — mono ledger voice */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-linen/45 uppercase tracking-wider"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="flex items-center gap-1.5"><span className="text-gold">✓</span> Personally verified</span>
            <span className="flex items-center gap-1.5"><span className="text-gold">✓</span> Made in North Idaho</span>
            <span className="flex items-center gap-1.5"><span className="text-gold">✓</span> {makerCount > 0 ? `${makerCount} makers` : "Neighbors, not vendors"}</span>
          </div>
        </div>
      </section>

      <SellerBrowser sellers={sellers} featuredSellers={featuredSellers} />
    </>
  );
}
