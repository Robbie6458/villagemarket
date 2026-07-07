import { createClient } from "@/lib/supabase/server";
import { GeoBanner } from "@/components/GeoGate";
import HeroSignupForm from "@/components/HeroSignupForm";
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

  return (
    <>
      <GeoBanner />

      {/* Hero */}
      <section className="bg-cream border-b border-wheat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: headline */}
            <div>
              <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
                Coeur d&apos;Alene · North Idaho
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl text-bark leading-tight mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                Real people.
                <br /><em>Real goods.</em>
                <br />Right here.
              </h1>
              <p className="text-bark/60 text-lg mb-8 leading-relaxed">
                A local-only marketplace for North Idaho makers, growers, and creators. Every seller personally verified. No dropshipping, no algorithms.
              </p>
            </div>

            {/* Right: signup card */}
            <div className="lg:max-w-sm lg:ml-auto w-full">
              <HeroSignupForm />
            </div>
          </div>
        </div>
      </section>

      <SellerBrowser sellers={sellers} featuredSellers={featuredSellers} />
    </>
  );
}
