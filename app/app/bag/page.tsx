"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBag, BagItem } from "@/lib/bag-context";
import { useGeo } from "@/lib/geo-context";
import { VC_PROPERTIES } from "@/lib/types";
import { submitOrderRequests } from "./actions";

type Status = "idle" | "submitting" | "sent" | "error";

interface SellerGroup {
  sellerId: string;
  sellerSlug: string;
  sellerName: string;
  sellerAcceptedPayments: string[];
  items: BagItem[];
}

export default function BagPage() {
  const { items, updateQuantity, removeItem, clearSeller } = useBag();
  const { isLocal, status: geoStatus, prompt } = useGeo();

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isGuest, setIsGuest] = useState(false);
  const [vcProperty, setVcProperty] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sentTo, setSentTo] = useState<string[]>([]);

  const groups: SellerGroup[] = Object.values(
    items.reduce((acc, item) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = {
          sellerId: item.sellerId,
          sellerSlug: item.sellerSlug,
          sellerName: item.sellerName,
          sellerAcceptedPayments: item.sellerAcceptedPayments,
          items: [],
        };
      }
      acc[item.sellerId].items.push(item);
      return acc;
    }, {} as Record<string, SellerGroup>)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const payload = groups.map((g) => ({
      sellerId: g.sellerId,
      items: g.items.map((i) => ({ title: i.title, price: i.price, priceLabel: i.priceLabel, quantity: i.quantity })),
      paymentMethod: paymentMethods[g.sellerId] ?? "",
      note: notes[g.sellerId] ?? "",
    }));

    try {
      const results = await submitOrderRequests(
        buyerName,
        buyerEmail,
        payload,
        isGuest && vcProperty ? vcProperty : null,
        marketingOptIn
      );
      const succeeded = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      succeeded.forEach((r) => clearSeller(r.sellerId));
      setSentTo(succeeded.map((r) => groups.find((g) => g.sellerId === r.sellerId)?.sellerName ?? "a seller"));

      if (failed.length > 0 && succeeded.length === 0) {
        setStatus("error");
        setErrorMsg("Something went wrong sending your request. Please try again.");
      } else {
        setStatus("sent");
        if (failed.length > 0) {
          setErrorMsg(`Heads up — ${failed.length} of your requests couldn't be sent. Try reaching those makers directly from their storefront.`);
        }
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong sending your request. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-moss/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-moss" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Requests sent
          </h1>
          <p className="text-bark/60 leading-relaxed mb-6">
            {sentTo.join(", ")} will get back to you directly to work out pickup, delivery, and payment.
          </p>
          {errorMsg && <p className="text-clay text-sm mb-6">{errorMsg}</p>}
          {process.env.NEXT_PUBLIC_STRIPE_TIP_LINK && (
            <div className="bg-cream rounded-xl p-4 mb-6 text-left">
              <p className="text-bark text-xs font-medium mb-1">If this leads somewhere good —</p>
              <p className="text-bark/60 text-xs leading-relaxed mb-3">
                A small tip helps keep Village Market free, local, and ad-free.
              </p>
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_TIP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-bark hover:bg-moss text-cream text-xs font-medium px-4 py-2 rounded-full transition-colors"
              >
                Tip the Village ♡
              </a>
            </div>
          )}
          <Link href="/" className="text-moss font-medium hover:underline text-sm">
            ← Back to the market
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl text-bark mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Your bag is empty
          </h1>
          <p className="text-bark/60 leading-relaxed mb-6">
            Browse the market and add anything you'd like to request from local makers.
          </p>
          <Link href="/" className="text-moss font-medium hover:underline text-sm">
            ← Browse makers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          Your Bag
        </h1>
        <p className="text-bark/55 text-sm mb-6">
          Nothing is charged here. Sending a request lets each maker know exactly what you want so you can work out pickup and payment directly.
        </p>

        {geoStatus !== "checking" && !isLocal && (
          <div className="bg-wheat border border-clay/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-bark">
              You&apos;ll need to be in the area to send requests to makers.
            </p>
            <button
              onClick={prompt}
              className="shrink-0 text-xs font-medium text-moss border border-moss px-3 py-1.5 rounded-full hover:bg-moss hover:text-white transition-colors"
            >
              Check my location
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {groups.map((group) => {
            const subtotal = group.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            return (
              <section key={group.sellerId} className="bg-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <Link href={`/sellers/${group.sellerSlug}`} className="font-medium text-bark hover:text-moss transition-colors">
                    {group.sellerName}
                  </Link>
                  <button
                    type="button"
                    onClick={() => clearSeller(group.sellerId)}
                    className="text-xs text-bark/30 hover:text-clay"
                  >
                    Remove all
                  </button>
                </div>

                <div className="divide-y divide-wheat mb-4">
                  {group.items.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center gap-3">
                      {item.photoUrl && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-cream">
                          <Image src={item.photoUrl} alt={item.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-bark truncate">{item.title}</p>
                        <p className="text-xs text-bark/50">
                          ${item.price.toLocaleString()}{item.priceLabel ? ` ${item.priceLabel}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-cream text-bark text-sm flex items-center justify-center hover:bg-wheat transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm text-bark w-4 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-cream text-bark text-sm flex items-center justify-center hover:bg-wheat transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-bark/30 hover:text-clay text-sm shrink-0"
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-bark font-medium mb-4">
                  Subtotal: ${subtotal.toLocaleString()}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-bark mb-1.5">Preferred payment</label>
                    <select
                      value={paymentMethods[group.sellerId] ?? ""}
                      onChange={(e) => setPaymentMethods((p) => ({ ...p, [group.sellerId]: e.target.value }))}
                      className="w-full px-3 py-2 border border-wheat rounded-xl text-bark bg-white text-sm focus:outline-none focus:border-moss"
                    >
                      <option value="">No preference</option>
                      {group.sellerAcceptedPayments.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-bark mb-1.5">
                      Note <span className="font-normal text-bark/40">(pickup time, delivery, etc.)</span>
                    </label>
                    <input
                      value={notes[group.sellerId] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [group.sellerId]: e.target.value }))}
                      placeholder="e.g. Can pick up Saturday morning"
                      className="w-full px-3 py-2 border border-wheat rounded-xl text-bark placeholder-bark/35 text-sm focus:outline-none focus:border-moss"
                    />
                  </div>
                </div>
              </section>
            );
          })}

          <section className="bg-white rounded-2xl p-5">
            <h2 className="text-sm font-medium text-bark mb-3">Your contact info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-bark mb-1.5">Your name</label>
                <input
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-wheat rounded-xl text-bark text-sm focus:outline-none focus:border-moss"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bark mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-wheat rounded-xl text-bark text-sm focus:outline-none focus:border-moss"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-wheat space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isGuest}
                  onChange={(e) => setIsGuest(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-wheat accent-moss cursor-pointer shrink-0"
                />
                <span className="text-sm text-bark/70 group-hover:text-bark transition-colors leading-snug">
                  I&apos;m staying at a Village Collective rental
                </span>
              </label>

              {isGuest && (
                <select
                  required
                  value={vcProperty}
                  onChange={(e) => setVcProperty(e.target.value)}
                  className="w-full px-3 py-2.5 border border-wheat rounded-xl text-bark bg-white text-sm focus:outline-none focus:border-moss"
                >
                  <option value="">Select your property…</option>
                  {VC_PROPERTIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-wheat accent-moss cursor-pointer shrink-0"
                />
                <span className="text-sm text-bark/70 group-hover:text-bark transition-colors leading-snug">
                  Want occasional updates from the Village? We&apos;ll send new makers and seasonal finds — no spam, unsubscribe anytime.
                </span>
              </label>
            </div>
          </section>

          {status === "error" && <p className="text-clay text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "submitting" || !isLocal}
            className="w-full bg-bark hover:bg-moss disabled:bg-bark/40 disabled:cursor-not-allowed text-cream font-medium py-3.5 rounded-full text-sm transition-colors"
          >
            {status === "submitting"
              ? "Sending…"
              : `Send Request${groups.length > 1 ? "s" : ""} to ${groups.length} Maker${groups.length > 1 ? "s" : ""}`}
          </button>
        </form>
      </div>
    </div>
  );
}
