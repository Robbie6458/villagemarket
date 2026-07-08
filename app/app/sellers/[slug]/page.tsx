import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AvailabilityStatus } from "@/lib/types";
import ContactButton from "./ContactButton";
import DeliveryMapLoader from "@/components/DeliveryMapLoader";
import ProductPhotoGallery from "./ProductPhotoGallery";
import ShareButton from "./ShareButton";
import AddToBagButton from "@/components/AddToBagButton";

const STATUS_LABELS: Record<AvailabilityStatus, { label: string; color: string }> = {
  available:     { label: "Available Now",  color: "bg-moss/10 text-moss" },
  seasonal:      { label: "Seasonal",       color: "bg-clay/10 text-clay" },
  made_to_order: { label: "Made to Order",  color: "bg-wheat text-bark/60" },
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

  const supabase = await createClient();
  const { data: seller } = await supabase
    .from("sellers")
    .select("*, products(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!seller) notFound();

  const products = (seller.products ?? []) as Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    price_label: string | null;
    photo_urls: string[];
    availability_status: AvailabilityStatus;
    is_highlighted: boolean;
    restocking: boolean;
  }>;

  const sortedProducts = [...products].sort(
    (a, b) => Number(b.is_highlighted) - Number(a.is_highlighted)
  );

  return (
    <div className="min-h-screen bg-mist">
      {/* Cover photo */}
      <div className="relative h-56 md:h-72 lg:h-80 w-full bg-wheat">
        {seller.cover_photo_url ? (
          <Image src={seller.cover_photo_url} alt={seller.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-wheat to-cream" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-bark/60 to-transparent" />
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
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0 bg-cream">
              {seller.profile_photo_url ? (
                <Image src={seller.profile_photo_url} alt={seller.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-bark/40 text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                  {seller.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl text-bark" style={{ fontFamily: "var(--font-serif)" }}>
                  {seller.name}
                </h1>
                {seller.founding_maker && (
                  <span className="bg-clay text-white text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5">
                    🌱 Founding Maker
                  </span>
                )}
                {seller.monthly_supporter && (
                  <span className="bg-sage text-white text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5">
                    ♡ Supporter
                  </span>
                )}
                {seller.community_contributor && (
                  <span className="bg-moss text-white text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5">
                    Community Contributor
                  </span>
                )}
                {seller.local_materials && (
                  <span className="bg-bark text-cream text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5">
                    🌲 Local Materials
                  </span>
                )}
              </div>
              <p className="text-bark/60 text-sm mb-2">{seller.tagline}</p>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-sage font-medium bg-cream px-2 py-0.5 rounded-full">
                  📍 {seller.location_label}
                </span>
                {(seller.categories as string[]).map((cat) => (
                  <span key={cat} className="text-xs text-moss bg-moss/10 px-2 py-0.5 rounded-full font-medium">{cat}</span>
                ))}
                <span className={`flex items-center gap-1 text-xs font-medium ${seller.is_available_now ? "text-moss" : "text-bark/40"}`}>
                  <span className={`w-2 h-2 rounded-full ${seller.is_available_now ? "bg-green-400" : "bg-bark/20"}`} />
                  {seller.is_available_now ? "Available now" : "Made to order"}
                </span>
                {seller.instagram_url && (
                  <a href={seller.instagram_url} target="_blank" rel="noopener noreferrer" className="text-xs text-bark/50 hover:text-clay transition-colors">
                    Instagram ↗
                  </a>
                )}
                {seller.website_url && (
                  <a href={seller.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-bark/50 hover:text-clay transition-colors">
                    Website ↗
                  </a>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <ShareButton title={seller.name} />
              <ContactButton slug={seller.slug} sellerName={seller.name} customOrdersOpen={seller.custom_orders_open} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: bio + products */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                About {seller.name}
              </h2>
              <p className="text-bark/70 leading-relaxed text-sm">{seller.bio}</p>
            </div>

            {sortedProducts.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-lg text-bark mb-4" style={{ fontFamily: "var(--font-serif)" }}>What I Make</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedProducts.map((product) => {
                    const status = STATUS_LABELS[product.availability_status] ?? STATUS_LABELS.available;
                    return (
                      <div key={product.id} className="border border-wheat rounded-xl overflow-hidden">
                        <div className="relative h-40 bg-cream">
                          <ProductPhotoGallery photos={product.photo_urls} alt={product.title} />
                          {product.is_highlighted && (
                            <span className="absolute top-2 left-2 bg-clay text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                              ⭐ Best Seller
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-medium text-bark text-sm leading-tight">{product.title}</h3>
                            <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${product.restocking ? "bg-clay/10 text-clay" : status.color}`}>
                              {product.restocking ? "Restocking Soon" : status.label}
                            </span>
                          </div>
                          <p className="text-bark/55 text-xs leading-snug mb-2">{product.description}</p>
                          <p className="text-bark font-semibold text-sm mb-2">
                            ${Number(product.price).toLocaleString()}
                            {product.price_label && (
                              <span className="text-bark/40 font-normal text-xs ml-1">{product.price_label}</span>
                            )}
                          </p>
                          {product.restocking ? (
                            <p className="text-bark/40 text-xs text-center py-2">Check back soon</p>
                          ) : (
                            <AddToBagButton
                              productId={product.id}
                              title={product.title}
                              price={Number(product.price)}
                              priceLabel={product.price_label ?? undefined}
                              photoUrl={product.photo_urls[0]}
                              sellerId={seller.id}
                              sellerSlug={seller.slug}
                              sellerName={seller.name}
                              sellerAcceptedPayments={seller.accepted_payments}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5">
              <h3 className="text-sm font-medium text-bark mb-3">Accepted Payments</h3>
              <div className="flex flex-wrap gap-2">
                {(seller.accepted_payments as string[]).map((method) => (
                  <span key={method} className="text-xs bg-cream text-bark px-3 py-1 rounded-full">
                    {PAYMENT_LABELS[method] ?? method}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5">
              <h3 className="text-sm font-medium text-bark mb-2">Custom Orders</h3>
              <div className={`flex items-center gap-2 text-sm ${seller.custom_orders_open ? "text-moss" : "text-bark/40"}`}>
                <span className={`w-2 h-2 rounded-full ${seller.custom_orders_open ? "bg-moss" : "bg-bark/20"}`} />
                {seller.custom_orders_open ? "Open for custom orders" : "Not currently taking custom orders"}
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="p-5 pb-3">
                <h3 className="text-sm font-medium text-bark mb-1">Delivery</h3>
                {seller.delivery_available ? (
                  <div className="space-y-1">
                    <p className="text-sm text-bark/70">
                      Delivers within{" "}
                      <span className="font-medium text-bark">{seller.delivery_radius_miles} miles</span>{" "}
                      of {seller.location_label}
                    </p>
                    {seller.delivery_fee != null && (
                      <p className="text-sm text-bark/70">
                        <span className="font-medium text-bark">
                          {seller.delivery_fee === 0 ? "Free delivery" : `$${Number(seller.delivery_fee).toFixed(2)} delivery fee`}
                        </span>
                        {seller.delivery_fee_label && (
                          <span className="text-bark/50"> · {seller.delivery_fee_label}</span>
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-bark/40">Pickup only — no delivery</p>
                )}
              </div>
              {seller.delivery_available && (
                <DeliveryMapLoader
                  lat={seller.lat}
                  lng={seller.lng}
                  radiusMiles={seller.delivery_radius_miles}
                  label={seller.location_label}
                />
              )}
            </div>

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
