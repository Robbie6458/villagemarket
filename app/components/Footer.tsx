import Link from "next/link";
import Campfire from "./Campfire";

export default function Footer() {
  return (
    <footer className="relative bg-ember text-linen/80 mt-20 overflow-hidden border-t border-ash/70">
      <div className="absolute inset-x-0 bottom-0 h-40 ember-glow opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Campfire className="w-9 h-9" />
              <div className="flex flex-col leading-none">
                <span className="text-gold/70 text-[9px] font-medium tracking-[0.22em] uppercase mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                  A Village Collective Project
                </span>
                <span className="text-linen text-xl font-display leading-none">
                  Village <span className="text-gold">Market</span>
                </span>
              </div>
            </div>
            <p className="text-sm text-linen/55 leading-relaxed max-w-xs">
              Real people. Real goods. Right here. A local-only market for North
              Idaho makers, growers, and creators.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold" style={{ fontFamily: "var(--font-mono)" }}>Navigate</p>
            <Link href="/" className="text-sm text-linen/70 hover:text-gold transition-colors">Browse Makers</Link>
            <Link href="/how-it-works" className="text-sm text-linen/70 hover:text-gold transition-colors">How It Works</Link>
            <Link href="/apply" className="text-sm text-linen/70 hover:text-gold transition-colors">Apply to Sell</Link>
            <Link href="/for-guests" className="text-sm text-linen/70 hover:text-gold transition-colors">For VC Guests</Link>
            <Link href="/barter" className="text-sm text-linen/70 hover:text-gold transition-colors">Barter Board</Link>
            <a href="https://village-collective.com" target="_blank" rel="noopener noreferrer" className="text-sm text-linen/70 hover:text-gold transition-colors">
              Village Collective ↗
            </a>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold mb-3" style={{ fontFamily: "var(--font-mono)" }}>Keep the fire lit</p>
            <p className="text-sm text-linen/55 leading-relaxed mb-4">
              Village Market is independently run, ad-free, and algorithm-free.
              If you&apos;d like to help keep it that way:
            </p>
            {process.env.NEXT_PUBLIC_STRIPE_TIP_LINK ? (
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_TIP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-gold/40 hover:bg-gold hover:text-ember text-gold text-sm px-4 py-2 rounded-full transition-colors"
              >
                Tip the Village ♡
              </a>
            ) : (
              <Link
                href="/how-it-works"
                className="inline-block border border-gold/40 hover:bg-gold hover:text-ember text-gold text-sm px-4 py-2 rounded-full transition-colors"
              >
                Tip the Village ♡
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-ash/60 mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs text-linen/35" style={{ fontFamily: "var(--font-mono)" }}>
          <p>© {new Date().getFullYear()} Village Market · Coeur d&apos;Alene, Idaho</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <span>
              Powered by{" "}
              <a href="https://village-collective.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                Village Collective
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
