"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { updateStorefront, goLive, goOffline, markOnboardingPaid } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { PAYMENT_METHODS, NEIGHBORHOODS } from "@/lib/types";

type Seller = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  bio: string;
  location_label: string;
  cover_photo_url: string;
  profile_photo_url: string;
  accepted_payments: string[];
  barter_accepts: string;
  delivery_available: boolean;
  delivery_radius_miles: number;
  delivery_fee: number | null;
  delivery_fee_label: string | null;
  custom_orders_open: boolean;
  is_available_now: boolean;
  is_active: boolean;
  onboarding_paid: boolean;
  instagram_url: string | null;
  website_url: string | null;
  fulfillment_preferences: string | null;
};

export default function StorefrontEditor({ seller }: { seller: Seller }) {
  const [tagline, setTagline] = useState(seller.tagline);
  const [bio, setBio] = useState(seller.bio);
  const [location, setLocation] = useState(seller.location_label);
  const [barter, setBarter] = useState(seller.barter_accepts);
  const [payments, setPayments] = useState<string[]>(seller.accepted_payments);
  const [delivery, setDelivery] = useState(seller.delivery_available);
  const [radius, setRadius] = useState(seller.delivery_radius_miles);
  const [deliveryFee, setDeliveryFee] = useState<string>(seller.delivery_fee != null ? String(seller.delivery_fee) : "");
  const [deliveryFeeLabel, setDeliveryFeeLabel] = useState(seller.delivery_fee_label ?? "");
  const [customOrders, setCustomOrders] = useState(seller.custom_orders_open);
  const [available, setAvailable] = useState(seller.is_available_now);
  const [coverUrl, setCoverUrl] = useState(seller.cover_photo_url);
  const [profileUrl, setProfileUrl] = useState(seller.profile_photo_url);
  const [instagram, setInstagram] = useState(seller.instagram_url ?? "");
  const [website, setWebsite] = useState(seller.website_url ?? "");
  const [fulfillment, setFulfillment] = useState(seller.fulfillment_preferences ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [goingLive, setGoingLive] = useState(false);
  const [goingOffline, setGoingOffline] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const storefrontUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/sellers/${seller.slug}`;

  useEffect(() => {
    QRCode.toDataURL(storefrontUrl, { width: 200, margin: 1, color: { dark: "#2C2417", light: "#F9F6F0" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [storefrontUrl]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — ignore, link is still visible to copy manually
    }
  }

  const togglePayment = (method: string) =>
    setPayments((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );

  async function uploadImage(
    file: File,
    path: string,
    onUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) {
    setUploading(true);
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("seller-images")
      .upload(path, file, { upsert: true });

    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("seller-images").getPublicUrl(path);
    onUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateStorefront({
        tagline,
        bio,
        location_label: location,
        barter_accepts: barter,
        accepted_payments: payments,
        delivery_available: delivery,
        delivery_radius_miles: radius,
        delivery_fee: deliveryFee !== "" ? parseFloat(deliveryFee) : null,
        delivery_fee_label: deliveryFeeLabel,
        custom_orders_open: customOrders,
        is_available_now: available,
        cover_photo_url: coverUrl,
        profile_photo_url: profileUrl,
        instagram_url: instagram,
        website_url: website,
        fulfillment_preferences: fulfillment,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleGoOffline() {
    setGoingOffline(true);
    try {
      await goOffline();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
      setGoingOffline(false);
    }
  }

  async function handleGoLive() {
    if (!seller.onboarding_paid) {
      alert("Complete your one-time market setup fee before going live.");
      return;
    }
    if (!tagline || !bio) {
      alert("Add a tagline and bio before going live.");
      return;
    }
    setGoingLive(true);
    try {
      await goLive();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
      setGoingLive(false);
    }
  }

  const onboardingPayUrl = process.env.NEXT_PUBLIC_STRIPE_ONBOARDING_LINK
    ? `${process.env.NEXT_PUBLIC_STRIPE_ONBOARDING_LINK}?client_reference_id=${seller.id}`
    : null;

  const tipUrl = process.env.NEXT_PUBLIC_STRIPE_TIP_LINK ?? null;
  const recurringUrl = process.env.NEXT_PUBLIC_STRIPE_RECURRING_LINK ?? null;

  return (
    <div className="space-y-6">
      {/* Onboarding fee gate */}
      {!seller.onboarding_paid && (
        <div className="bg-flame/10 border border-flame/30 rounded-2xl p-5">
          <p className="font-medium text-flame text-sm mb-1">One-time setup fee required</p>
          <p className="text-bark/60 text-xs leading-relaxed mb-4">
            A one-time $50 market fee unlocks your ability to go live. This keeps Village Market
            independent, ad-free, and personally curated — no ongoing charges, ever.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {onboardingPayUrl ? (
              <a
                href={onboardingPayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-flame hover:bg-flamelo text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
              >
                Pay $50 setup fee →
              </a>
            ) : (
              <span className="text-xs text-bark/40 italic">Payment link coming soon — contact us to complete setup.</span>
            )}
            <span className="text-xs text-bark/40">Secure payment via Stripe</span>
          </div>
          {/* Dev escape hatch — remove before launch */}
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={async () => { setMarkingPaid(true); await markOnboardingPaid(); setMarkingPaid(false); }}
              disabled={markingPaid}
              className="mt-3 text-xs text-bark/30 hover:text-bark underline"
            >
              {markingPaid ? "…" : "[Dev] Skip payment"}
            </button>
          )}
        </div>
      )}

      {/* Go live banner */}
      {!seller.is_active && (
        <div className="bg-flame/10 border border-flame/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-flame text-sm mb-0.5">Your storefront is not live yet</p>
            <p className="text-bark/60 text-xs">
              Fill in your tagline, bio, and at least one product, then go live to appear in the market.
            </p>
          </div>
          <button
            onClick={handleGoLive}
            disabled={goingLive || !seller.onboarding_paid}
            title={!seller.onboarding_paid ? "Complete setup fee to go live" : undefined}
            className="shrink-0 bg-gold hover:bg-goldsoft disabled:opacity-40 disabled:cursor-not-allowed text-ember font-medium px-5 py-2 rounded-full text-sm transition-colors"
          >
            {goingLive ? "Going live…" : "Go Live"}
          </button>
        </div>
      )}

      {seller.is_active && (
        <div className="bg-gold/15 border border-gold/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
            <p className="text-flamelo text-sm font-medium">
              Your storefront is live —{" "}
              <a href={`/sellers/${seller.slug}`} target="_blank" className="underline">
                view it
              </a>
            </p>
          </div>
          <button
            onClick={handleGoOffline}
            disabled={goingOffline}
            className="shrink-0 text-xs text-bark/50 hover:text-flame disabled:opacity-50 border border-bark/20 hover:border-flame/40 px-3 py-1.5 rounded-full transition-colors"
          >
            {goingOffline ? "Pausing…" : "Pause store"}
          </button>
        </div>
      )}

      {/* Share storefront */}
      {seller.is_active && (
        <section className="bg-linen rounded-2xl p-6">
          <h2 className="text-base font-medium text-bark mb-1">Share Your Storefront</h2>
          <p className="text-bark/55 text-xs mb-4">
            Print the QR code for your market booth, or share the link on your own social media.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR code linking to your storefront" className="w-28 h-28 rounded-lg border border-fence shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 bg-lamp rounded-xl px-3 py-2.5 mb-2">
                <span className="text-bark/70 text-xs truncate flex-1">{storefrontUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 text-xs font-medium text-flamelo hover:underline"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`${seller.slug}-qr-code.png`}
                  className="text-xs text-bark/50 hover:text-bark underline"
                >
                  Download QR code
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Photos */}
      <section className="bg-linen rounded-2xl p-6">
        <h2 className="text-base font-medium text-bark mb-4">Photos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cover photo */}
          <div>
            <p className="text-xs font-medium text-bark mb-2">Cover photo</p>
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative h-32 rounded-xl overflow-hidden bg-lamp border border-fence cursor-pointer hover:border-gold transition-colors"
            >
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-bark/30 text-xs">
                  Click to upload
                </div>
              )}
              {uploadingCover && (
                <div className="absolute inset-0 bg-linen/70 flex items-center justify-center text-xs text-bark/60">
                  Uploading…
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file)
                  uploadImage(
                    file,
                    `${seller.id}/cover`,
                    setCoverUrl,
                    setUploadingCover
                  );
              }}
            />
          </div>

          {/* Profile photo */}
          <div>
            <p className="text-xs font-medium text-bark mb-2">Profile photo</p>
            <div
              onClick={() => profileInputRef.current?.click()}
              className="relative h-32 rounded-xl overflow-hidden bg-lamp border border-fence cursor-pointer hover:border-gold transition-colors"
            >
              {profileUrl ? (
                <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-bark/30 text-xs">
                  Click to upload
                </div>
              )}
              {uploadingProfile && (
                <div className="absolute inset-0 bg-linen/70 flex items-center justify-center text-xs text-bark/60">
                  Uploading…
                </div>
              )}
            </div>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file)
                  uploadImage(
                    file,
                    `${seller.id}/profile`,
                    setProfileUrl,
                    setUploadingProfile
                  );
              }}
            />
          </div>
        </div>
      </section>

      {/* Storefront info */}
      <section className="bg-linen rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-medium text-bark">Your Story</h2>

        <div>
          <label className="block text-xs font-medium text-bark mb-1.5">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="One sentence that captures what you make"
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-bark mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            placeholder="Tell your story — who you are, how you got here, what makes your work special"
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-bark mb-1.5">Neighborhood</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark bg-linen focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          >
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-bark mb-1.5">
              Instagram <span className="font-normal text-bark/40">(optional)</span>
            </label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/yourshop"
              className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-bark mb-1.5">
              Website <span className="font-normal text-bark/40">(optional)</span>
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourshop.com"
              className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
            />
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="bg-linen rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-medium text-bark">Settings</h2>

        {/* Toggles */}
        <div className="space-y-3">
          {[
            { label: "Available now", value: available, set: setAvailable },
            { label: "Custom orders open", value: customOrders, set: setCustomOrders },
            { label: "Local delivery", value: delivery, set: setDelivery },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-bark">{label}</span>
              <div
                onClick={() => set(!value)}
                className={`w-10 h-6 rounded-full transition-colors relative ${value ? "bg-gold" : "bg-fence"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-linen shadow transition-transform ${value ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </label>
          ))}
        </div>

        {delivery && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-bark mb-1.5">
                Delivery radius (miles)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-bark mb-1.5">
                  Delivery fee <span className="font-normal text-bark/40">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bark/40 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-fence rounded-xl text-bark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-bark mb-1.5">
                  Fee note <span className="font-normal text-bark/40">(optional)</span>
                </label>
                <input
                  value={deliveryFeeLabel}
                  onChange={(e) => setDeliveryFeeLabel(e.target.value)}
                  placeholder="e.g. free over $50"
                  className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Order fulfillment preferences */}
        <div>
          <label className="block text-xs font-medium text-bark mb-1.5">
            How you fulfill orders <span className="font-normal text-bark/40">(shown on your storefront and in the buyer&apos;s bag)</span>
          </label>
          <textarea
            value={fulfillment}
            onChange={(e) => setFulfillment(e.target.value)}
            rows={3}
            placeholder="e.g. I prefer pickup in Post Falls, but I deliver within 15 miles on Mondays and Wednesdays. Message me to arrange a time."
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm resize-none"
          />
        </div>

        {/* Payment methods */}
        <div>
          <label className="block text-xs font-medium text-bark mb-2">Accepted payments</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => togglePayment(method)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  payments.includes(method)
                    ? "bg-flame text-white"
                    : "bg-lamp text-bark border border-fence hover:border-gold"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Barter */}
        <div>
          <label className="block text-xs font-medium text-bark mb-1.5">
            Barter — I&apos;ll trade for:
          </label>
          <input
            value={barter}
            onChange={(e) => setBarter(e.target.value)}
            placeholder="e.g. Fresh produce, quality tools, handmade goods"
            className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
          />
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-bark hover:bg-flamelo disabled:opacity-50 text-cream font-medium px-6 py-2.5 rounded-full text-sm transition-colors"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <p className="text-flamelo text-sm">Saved</p>}
      </div>

      {/* Support the Market */}
      {seller.onboarding_paid && (
        <section className="bg-lamp rounded-2xl p-6 border border-fence">
          <h2 className="text-base font-medium text-bark mb-1">Support the Market ♡</h2>
          <p className="text-bark/60 text-sm leading-relaxed mb-5">
            Village Market is ad-free, algorithm-free, and independently run.
            If it&apos;s working for you, contribute what feels right — no obligation, no pressure.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* One-time */}
            <div className="bg-linen rounded-xl p-4 border border-fence/60">
              <p className="text-xs font-medium text-bark mb-1">One-time contribution</p>
              <p className="text-xs text-bark/50 leading-relaxed mb-3">
                Pay what feels right, whenever it feels right. No strings attached.
              </p>
              {tipUrl ? (
                <a
                  href={tipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-gold/50 hover:border-gold text-gold text-xs font-medium px-4 py-1.5 rounded-full transition-colors"
                >
                  Tip the Village →
                </a>
              ) : (
                <span className="text-xs text-bark/30 italic">Coming soon</span>
              )}
            </div>

            {/* Recurring */}
            <div className="bg-linen rounded-xl p-4 border border-fence/60">
              <p className="text-xs font-medium text-bark mb-1">Monthly supporter</p>
              <p className="text-xs text-bark/50 leading-relaxed mb-3">
                A small monthly contribution to keep the lights on. Cancel anytime, no questions asked.
              </p>
              {recurringUrl ? (
                <a
                  href={recurringUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-gold/40 hover:border-gold text-flamelo text-xs font-medium px-4 py-1.5 rounded-full transition-colors"
                >
                  Become a supporter →
                </a>
              ) : (
                <span className="text-xs text-bark/30 italic">Coming soon</span>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
