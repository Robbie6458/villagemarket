import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function BarterPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sellers")
    .select("id, slug, name, tagline, location_label, barter_accepts")
    .eq("is_active", true)
    .neq("barter_accepts", "")
    .order("name");

  const barterSellers = data ?? [];

  return (
    <div className="min-h-screen bg-mist">
      {/* Hero */}
      <section className="bg-cream border-b border-wheat">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">
          <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">Community Exchange</p>
          <h1
            className="text-4xl md:text-5xl text-bark mb-4 leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Trade what you make
            <br />
            <em>for what you need.</em>
          </h1>
          <p className="text-bark/60 text-lg leading-relaxed max-w-xl">
            Several Village Market makers are open to barter — trading their goods for yours.
            No cash required. Just two local people making a fair exchange.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* How it works */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Find a maker", body: "Browse the sellers below who are open to barter and see what they're looking to trade for." },
            { step: "2", title: "Send a proposal", body: "Visit their page and use the message form to propose a trade — tell them what you make and what you have in mind." },
            { step: "3", title: "Make it happen", body: "Work out the details directly. Village Market facilitates the connection but stays out of the way." },
          ].map(({ step, title, body }) => (
            <div key={step} className="bg-white rounded-2xl p-5">
              <div className="w-8 h-8 bg-bark rounded-full flex items-center justify-center text-cream text-sm font-bold mb-3">
                {step}
              </div>
              <h3 className="font-medium text-bark mb-1.5 text-sm">{title}</h3>
              <p className="text-bark/55 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </section>

        {/* Barter-open sellers */}
        <section>
          <h2 className="text-2xl text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>
            Open to Barter
          </h2>
          <p className="text-bark/55 text-sm mb-6">{barterSellers.length} maker{barterSellers.length !== 1 ? "s" : ""} currently open to trade</p>

          {barterSellers.length > 0 ? (
            <div className="space-y-3">
              {barterSellers.map((seller) => (
                <Link
                  key={seller.id}
                  href={`/sellers/${seller.slug}`}
                  className="group flex items-start gap-4 bg-white rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 bg-wheat rounded-full flex items-center justify-center shrink-0 text-lg">
                    🤝
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium text-bark group-hover:text-moss transition-colors text-sm">
                        {seller.name}
                      </h3>
                      <span className="text-[10px] text-sage bg-cream px-2 py-0.5 rounded-full font-medium shrink-0">
                        {seller.location_label}
                      </span>
                    </div>
                    <p className="text-bark/55 text-xs mb-1.5">{seller.tagline}</p>
                    <p className="text-bark/70 text-xs">
                      <span className="font-medium text-bark">Will trade for:</span>{" "}
                      {seller.barter_accepts}
                    </p>
                  </div>
                  <span className="text-bark/30 group-hover:text-moss transition-colors text-sm shrink-0 mt-0.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center text-bark/40">
              <p className="text-lg mb-1">No barter listings yet</p>
              <p className="text-sm">Check back soon — sellers can flag this on their profile.</p>
            </div>
          )}
        </section>

        {/* Are you a seller? */}
        <section className="bg-moss rounded-2xl p-8 text-white">
          <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Sellers</p>
          <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Open to trading your work?
          </h2>
          <p className="text-white/75 text-sm leading-relaxed mb-5 max-w-lg">
            If you&apos;re a verified Village Market seller, you can flag your profile as open to barter
            and list what you&apos;re looking to trade for. It shows up here and on your storefront.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-moss text-sm font-medium px-5 py-2.5 rounded-full hover:bg-cream transition-colors"
          >
            Go to your dashboard →
          </Link>
        </section>

        {/* Coming features teaser */}
        <section className="bg-cream rounded-2xl p-8">
          <p className="text-sage text-xs font-medium tracking-widest uppercase mb-2">Coming Soon</p>
          <h2 className="text-xl text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Barter Matching
          </h2>
          <p className="text-bark/60 text-sm leading-relaxed max-w-lg">
            When a seller lists what they&apos;ll trade for, we&apos;ll quietly surface other sellers who
            make exactly those things. <em>&ldquo;You said you&apos;d trade for fresh produce — there are 3 farms
            on Village Market. Want an introduction?&rdquo;</em> Only a small, curated community can do
            this. National platforms never will.
          </p>
        </section>
      </div>
    </div>
  );
}
