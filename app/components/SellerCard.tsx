import Link from "next/link";
import Image from "next/image";
import { Seller } from "@/lib/types";

const PAYMENT_ICONS: Record<string, string> = {
  Cash: "Cash",
  Venmo: "Venmo",
  PayPal: "PayPal",
  "Cash App": "Cash App",
  Barter: "Barter",
  Crypto: "Crypto",
};

export default function SellerCard({ seller }: { seller: Seller }) {
  return (
    <Link
      href={`/sellers/${seller.slug}`}
      className="group block bg-linen rounded-xl overflow-hidden border border-fence hover:border-gold/50 shadow-[0_1px_2px_rgba(36,28,21,0.06)] hover:shadow-[0_12px_30px_-8px_rgba(36,28,21,0.28)] transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover — the lit stall */}
      <div className="relative h-48 bg-char overflow-hidden">
        <Image
          src={seller.cover_photo_url}
          alt={seller.name}
          fill
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ember/70 via-transparent to-ember/10" />

        {/* Distinction marks (top-left) */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {seller.founding_maker && (
            <span className="bg-gold text-ember text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Founding Maker
            </span>
          )}
          {seller.community_contributor && (
            <span className="bg-ember/70 backdrop-blur-sm text-gold text-[10px] font-medium px-2 py-0.5 rounded-full border border-gold/30">
              Contributor
            </span>
          )}
          {seller.local_materials && !seller.founding_maker && (
            <span className="bg-ember/70 backdrop-blur-sm text-linen text-[10px] font-medium px-2 py-0.5 rounded-full">
              Local Materials
            </span>
          )}
        </div>

        {/* Availability + delivery (bottom, mono ledger) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between" style={{ fontFamily: "var(--font-mono)" }}>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-linen">
            <span className={`w-1.5 h-1.5 rounded-full ${seller.is_available_now ? "bg-gold" : "bg-linen/40"}`} />
            {seller.is_available_now ? "AVAILABLE NOW" : "MADE TO ORDER"}
          </span>
          {seller.delivery_available && (
            <span className="text-[10px] text-linen/80">DELIVERS {seller.delivery_radius_miles}MI</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-bark font-display text-lg leading-tight group-hover:text-flamelo transition-colors">
            {seller.name}
          </h3>
          <span className="shrink-0 text-[10px] text-smoke bg-lamp px-2 py-0.5 rounded-full whitespace-nowrap mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            {seller.location_label}
          </span>
        </div>

        <p className="text-smoke text-sm leading-snug mb-3 line-clamp-2">{seller.tagline}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {seller.categories.map((cat) => (
            <span key={cat} className="text-[10px] font-medium text-flamelo bg-flame/10 px-2 py-0.5 rounded-full">
              {cat}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-fence">
          <div className="flex gap-1 items-center flex-wrap" style={{ fontFamily: "var(--font-mono)" }}>
            {seller.accepted_payments.slice(0, 3).map((method) => (
              <span key={method} className="text-[9px] text-smoke border border-fence rounded px-1.5 py-0.5">
                {PAYMENT_ICONS[method] ?? method}
              </span>
            ))}
            {seller.accepted_payments.length > 3 && (
              <span className="text-[9px] text-smoke">+{seller.accepted_payments.length - 3}</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[10px] text-gold font-medium shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        </div>
      </div>
    </Link>
  );
}
