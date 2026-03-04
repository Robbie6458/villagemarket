import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSeller, SELLERS } from "@/lib/seed-data";
import { AvailabilityStatus } from "@/lib/types";
import ContactButton from "./ContactButton";

export function generateStaticParams() {
  return SELLERS.map((s) => ({ slug: s.slug }));
}

const STATUS_LABELS: Record<AvailabilityStatus, { label: string; color: string }> = {
  available:     { label: "Available Now",   color: "bg-moss/10 text-moss" },
  seasonal:      { label: "Seasonal",        color: "bg-clay/10 text-clay" },
  made_to_order: { label: "Made to Order",   color: "bg-wheat text-bark/60" },
};

const PAYMENT_LABELS: Record<string, string> = {
  Cash: "💵 Cash", Venmo: "Venmo", PayPal: "PayPal",
  "Cash App": "Cash App", Crypto: "₿ Crypto", Barter: "🤝 Barter",
};

export default async function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seller = getSeller(slug);
  if (!seller) notFound();

  return (
    <div className="min-h-screen bg-mist">
      {/* Cover photo */}
      <div className="relative h-56 md:h-72 lg:h-80 w-full bg-wheat">
        <Image
          src={seller.cover_photo_url}
          alt={seller.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bark/60 to-transparent" />
        <Link
          href="/"
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
        >
          ← All Makers
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Profile photo */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
              <Image
                src={seller.profile_photo_url}
                alt={seller.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl text-bark" style={{ fontFamily: "var(--font-serif)" }}>
                  {seller.name}
                </h1>
                {seller.community_contributor && (
                  <span className="bg-moss text-white text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5">
                    Community Contributor
                  </span>
                )}
              </div>
              <p className="text-bark/60 text-sm mb-2">{seller.tagline}</p>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-sage font-medium bg-cream px-2 py-0.5 rounded-full">
                  📍 {seller.location_label}
                </span>
                {seller.categories.map((cat) => (
                  <span key={cat} className="text-xs text-moss bg-moss/10 px-2 py-0.5 rounded-full font-medium">
                    {cat}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-xs text-sage font-medium">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Local Maker
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="shrink-0">
              <ContactButton sellerName={seller.name} contactEmail={seller.contact_email} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col: bio + products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                About {seller.name}
              </h2>
              <p className="text-bark/70 leading-relaxed text-sm">{seller.bio}</p>
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg text-bark mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                What I Make
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {seller.products.map((product) => {
                  const status = STATUS_LABELS[product.availability_status];
                  return (
                    <div key={product.id} className="border border-wheat rounded-xl overflow-hidden">
                      <div className="relative h-40 bg-cream">
                        <Image
                          src={product.photo_url}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-bark text-sm leading-tight">{product.title}</h3>
                          <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-bark/55 text-xs leading-snug mb-2">{product.description}</p>
                        <p className="text-bark font-semibold text-sm">
                          ${product.price.toLocaleString()}
                          {product.price_label && (
                            <span className="text-bark/40 font-normal text-xs ml-1">{product.price_label}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right col: details */}
          <div className="space-y-4">
            {/* Payment methods */}
            <div className="bg-white rounded-2xl p-5">
              <h3 className="text-sm font-medium text-bark mb-3">Accepted Payments</h3>
              <div className="flex flex-wrap gap-2">
                {seller.accepted_payments.map((method) => (
                  <span key={method} className="text-xs bg-cream text-bark px-3 py-1 rounded-full">
                    {PAYMENT_LABELS[method] ?? method}
                  </span>
                ))}
              </div>
            </div>

            {/* Custom orders */}
            <div className="bg-white rounded-2xl p-5">
              <h3 className="text-sm font-medium text-bark mb-2">Custom Orders</h3>
              <div className={`flex items-center gap-2 text-sm ${seller.custom_orders_open ? "text-moss" : "text-bark/40"}`}>
                <span className={`w-2 h-2 rounded-full ${seller.custom_orders_open ? "bg-moss" : "bg-bark/20"}`} />
                {seller.custom_orders_open ? "Open for custom orders" : "Not currently taking custom orders"}
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl p-5">
              <h3 className="text-sm font-medium text-bark mb-2">Delivery</h3>
              {seller.delivery_available ? (
                <p className="text-sm text-bark/70">
                  Delivers within{" "}
                  <span className="font-medium text-bark">{seller.delivery_radius_miles} miles</span>{" "}
                  of {seller.location_label}
                </p>
              ) : (
                <p className="text-sm text-bark/40">Pickup only — no delivery</p>
              )}
            </div>

            {/* Barter */}
            {seller.barter_accepts && (
              <div className="bg-cream rounded-2xl p-5">
                <h3 className="text-sm font-medium text-bark mb-2">🤝 Open to Barter</h3>
                <p className="text-sm text-bark/70 leading-relaxed">
                  <em>I&apos;ll trade for:</em> {seller.barter_accepts}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
