import Link from "next/link";
import Image from "next/image";
import { Seller } from "@/lib/types";

const PAYMENT_ICONS: Record<string, string> = {
  Cash: "💵",
  Venmo: "V",
  PayPal: "P",
  "Cash App": "$",
  Barter: "🤝",
  Crypto: "₿",
};

export default function SellerCard({ seller }: { seller: Seller }) {
  return (
    <Link
      href={`/sellers/${seller.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Cover photo */}
      <div className="relative h-48 bg-wheat overflow-hidden">
        <Image
          src={seller.cover_photo_url}
          alt={seller.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {seller.community_contributor && (
            <span className="bg-moss text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Community Contributor
            </span>
          )}
          {seller.featured && (
            <span className="bg-clay text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>
        {seller.delivery_available && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
              Delivers {seller.delivery_radius_miles}mi
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="text-bark font-semibold text-base leading-tight group-hover:text-moss transition-colors"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {seller.name}
          </h3>
          <span className="shrink-0 text-[10px] text-sage font-medium bg-cream px-2 py-0.5 rounded-full whitespace-nowrap">
            {seller.location_label}
          </span>
        </div>

        <p className="text-bark/60 text-sm leading-snug mb-3 line-clamp-2">{seller.tagline}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {seller.categories.map((cat) => (
            <span key={cat} className="text-[10px] font-medium text-moss bg-moss/10 px-2 py-0.5 rounded-full">
              {cat}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-wheat">
          <div className="flex gap-1.5 items-center">
            {seller.accepted_payments.slice(0, 4).map((method) => (
              <span
                key={method}
                title={method}
                className="w-6 h-6 bg-cream rounded-full flex items-center justify-center text-[10px] font-bold text-bark"
              >
                {PAYMENT_ICONS[method] ?? method[0]}
              </span>
            ))}
            {seller.accepted_payments.length > 4 && (
              <span className="text-[10px] text-bark/50">+{seller.accepted_payments.length - 4}</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[10px] text-sage font-medium">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Local Maker
          </span>
        </div>
      </div>
    </Link>
  );
}
