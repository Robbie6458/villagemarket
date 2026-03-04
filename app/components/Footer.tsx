import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bark text-wheat mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="text-sage text-[10px] font-medium tracking-widest uppercase mb-1">
              A Village Collective Project
            </p>
            <h2 className="text-cream text-2xl mb-3" style={{ fontFamily: "var(--font-serif)" }}>
              Village Market
            </h2>
            <p className="text-sm text-wheat/70 leading-relaxed max-w-xs">
              Real people. Real goods. Right here. — A local-only marketplace
              for North Idaho makers, growers, and creators.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-widest uppercase text-sage">Navigate</p>
            <Link href="/" className="text-sm hover:text-white transition-colors">Browse Sellers</Link>
            <Link href="/apply" className="text-sm hover:text-white transition-colors">Apply to Sell</Link>
            <Link href="/for-guests" className="text-sm hover:text-white transition-colors">For VC Guests</Link>
            <a href="https://village-collective.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
              Village Collective ↗
            </a>
          </div>

          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-sage mb-3">Support the Market</p>
            <p className="text-sm text-wheat/70 leading-relaxed mb-4">
              Village Market is independently run, ad-free, and algorithm-free.
              If you&apos;d like to help keep it that way:
            </p>
            <button className="border border-sage/50 hover:border-sage text-sage text-sm px-4 py-2 rounded-full transition-colors">
              Keep the market independent ♡
            </button>
          </div>
        </div>

        <div className="border-t border-wheat/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs text-wheat/40">
          <p>© {new Date().getFullYear()} Village Market · Coeur d&apos;Alene, Idaho</p>
          <p>
            Powered by{" "}
            <a href="https://village-collective.com" target="_blank" rel="noopener noreferrer" className="hover:text-wheat/70 transition-colors">
              Village Collective
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
