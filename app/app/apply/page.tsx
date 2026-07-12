"use client";

import { useState } from "react";
import { CATEGORIES, PAYMENT_METHODS, NEIGHBORHOODS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ApplyPage() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const togglePayment = (method: string) =>
    setSelectedPayments((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const data = new FormData(e.currentTarget);
    const fname = data.get("fname") as string;
    const lname = data.get("lname") as string;

    const supabase = createClient();
    const { error } = await supabase.from("seller_applications").insert({
      name: `${fname} ${lname}`.trim(),
      email: data.get("email") as string,
      phone: (data.get("phone") as string) || "",
      location: data.get("location") as string,
      categories: selectedCategories,
      description: data.get("description") as string,
      experience: (data.get("experience") as string) || "",
      payment_methods: selectedPayments,
      delivery_available: deliveryAvailable,
      delivery_radius_miles: deliveryAvailable
        ? parseInt(data.get("delivery_radius") as string) || 0
        : 0,
      social_links: (data.get("social_links") as string) || null,
      referral_source: (data.get("referral_source") as string) || null,
    });

    if (error) {
      console.error("Application submission error:", error);
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-lamp flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Something went wrong
          </h1>
          <p className="text-bark/60 leading-relaxed mb-6">
            We couldn&apos;t submit your application. Please try again or email us directly.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="text-flamelo font-medium hover:underline text-sm"
          >
            ← Try again
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-lamp flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-flamelo" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Application received
          </h1>
          <p className="text-bark/60 leading-relaxed mb-6">
            Thank you for applying to Village Market. Every application is reviewed personally — you&apos;ll hear back within a few days.
          </p>
          <a href="/" className="text-flamelo font-medium hover:underline text-sm">
            ← Back to the market
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lamp">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-2">Join Village Market</p>
          <h1 className="text-4xl text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Apply to Sell
          </h1>
          <p className="text-bark/60 leading-relaxed">
            Every seller on Village Market is personally reviewed and approved. We&apos;re looking for real
            local makers, growers, and creators who are part of the North Idaho community.
          </p>
        </div>

        {/* Founding Maker callout */}
        <div className="bg-flame/10 border border-flame/20 rounded-2xl p-5 mb-8">
          <p className="text-flame font-medium text-sm mb-1">🌟 Founding Maker Offer</p>
          <p className="text-bark/70 text-sm leading-relaxed">
            The first 5 approved sellers join as Founding Makers — the $50 onboarding fee is waived and
            you receive a permanent Founding Maker badge on your storefront.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal info */}
          <div className="bg-linen rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-medium text-bark">About You</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First name" name="fname" required />
              <Field label="Last name" name="lname" required />
            </div>
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" type="tel" />

            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">
                Neighborhood <span className="text-flame">*</span>
              </label>
              <select
                name="location"
                required
                className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark bg-linen focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
              >
                <option value="">Select your area</option>
                {NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* What you make */}
          <div className="bg-linen rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-medium text-bark">What You Make</h2>

            <div>
              <label className="block text-sm font-medium text-bark mb-2">
                Categories <span className="text-flame">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(cat)
                        ? "bg-flame text-white"
                        : "bg-lamp text-bark hover:border-gold border border-fence"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">
                Tell us about what you make <span className="text-flame">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="What do you make or grow? What makes it special? What's your process?"
                className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">Experience</label>
              <select
                name="experience"
                className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark bg-linen focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
              >
                <option value="">How long have you been making this?</option>
                <option value="less-than-1">Less than a year</option>
                <option value="1-3">1–3 years</option>
                <option value="3-5">3–5 years</option>
                <option value="5-10">5–10 years</option>
                <option value="10+">More than 10 years</option>
              </select>
            </div>

            <Field
              label="Website or social media links (optional)"
              name="social_links"
              placeholder="Instagram, Etsy, personal site, etc."
            />
          </div>

          {/* Selling details */}
          <div className="bg-linen rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-medium text-bark">Selling Details</h2>

            <div>
              <label className="block text-sm font-medium text-bark mb-2">Accepted payment methods</label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => togglePayment(method)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedPayments.includes(method)
                        ? "bg-flame text-white"
                        : "bg-lamp text-bark border border-fence hover:border-gold"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setDeliveryAvailable(!deliveryAvailable)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    deliveryAvailable ? "bg-gold" : "bg-fence"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-linen shadow transition-transform ${deliveryAvailable ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm text-bark">I offer local delivery</span>
              </label>

              {deliveryAvailable && (
                <div className="mt-3">
                  <Field
                    label="Delivery radius (miles)"
                    name="delivery_radius"
                    type="number"
                    placeholder="e.g. 20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Referral */}
          <div className="bg-linen rounded-2xl p-6">
            <Field
              label="How did you hear about Village Market?"
              name="referral_source"
              placeholder="A friend, Village Collective, social media, etc."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-bark hover:bg-flamelo disabled:bg-bark/40 text-cream font-medium py-3.5 rounded-full transition-colors text-sm"
          >
            {status === "submitting" ? "Submitting…" : "Submit Application"}
          </button>

          <p className="text-center text-xs text-bark/40 leading-relaxed">
            Every application is reviewed personally. If approved, you&apos;ll receive an email with next steps
            and a link to complete your onboarding.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, name, type = "text", required, placeholder,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-bark mb-1.5">
        {label} {required && <span className="text-flame">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm bg-linen"
      />
    </div>
  );
}
