"use client";

import { useState } from "react";
import { toggleOnboardingPaid, toggleFoundingMaker, toggleMonthlySupporter } from "./actions";
import SellerActions from "./SellerActions";

type Seller = {
  id: string;
  name: string;
  slug: string;
  location_label: string;
  categories: string[];
  is_active: boolean;
  onboarding_paid: boolean;
  community_contributor: boolean;
  founding_maker: boolean;
  monthly_supporter: boolean;
  featured: boolean;
};

type SellerStats = {
  productCount: number;
  contactCount: number;
  lastOnline: string | null;
  lastOnlineLabel: string | null;
};

export default function AdminSellerRow({ seller, stats }: { seller: Seller; stats?: SellerStats }) {
  const [togglingPaid, setTogglingPaid] = useState(false);
  const [togglingFounding, setTogglingFounding] = useState(false);
  const [togglingSupporter, setTogglingSupporter] = useState(false);

  async function handleTogglePaid() {
    setTogglingPaid(true);
    try { await toggleOnboardingPaid(seller.id, !seller.onboarding_paid); }
    finally { setTogglingPaid(false); }
  }

  async function handleToggleFounding() {
    setTogglingFounding(true);
    try { await toggleFoundingMaker(seller.id, !seller.founding_maker); }
    finally { setTogglingFounding(false); }
  }

  async function handleToggleSupporter() {
    setTogglingSupporter(true);
    try { await toggleMonthlySupporter(seller.id, !seller.monthly_supporter); }
    finally { setTogglingSupporter(false); }
  }

  return (
    <div className="py-3 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="font-medium text-bark text-sm">{seller.name}</span>
          {!seller.is_active && (
            <span className="text-[10px] text-bark/40 bg-fence px-2 py-0.5 rounded-full">
              Setup pending
            </span>
          )}
          {seller.founding_maker && (
            <span className="text-[10px] text-white bg-flame px-2 py-0.5 rounded-full">
              🌱 Founding
            </span>
          )}
          {seller.monthly_supporter && (
            <span className="text-[10px] text-ember bg-gold px-2 py-0.5 rounded-full">
              ♡ Supporter
            </span>
          )}
          {seller.community_contributor && (
            <span className="text-[10px] text-flamelo bg-gold/15 px-2 py-0.5 rounded-full">
              Contributor
            </span>
          )}
          {seller.featured && (
            <span className="text-[10px] text-flame bg-flame/10 px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {seller.onboarding_paid ? (
            <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full">
              ✓ Paid
            </span>
          ) : (
            <span className="text-[10px] text-flame/80 bg-flame/10 px-2 py-0.5 rounded-full">
              Unpaid
            </span>
          )}
        </div>
        <p className="text-bark/40 text-xs">
          {seller.location_label} · {seller.categories.join(", ")}
        </p>
        {stats && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-smoke" style={{ fontFamily: "var(--font-mono)" }}>
            <span>{stats.productCount} products</span>
            <span>{stats.contactCount} order request{stats.contactCount !== 1 ? "s" : ""}</span>
            <span>{stats.lastOnlineLabel ? `online ${stats.lastOnlineLabel}` : "never signed in"}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
        {seller.is_active && (
          <a href={`/sellers/${seller.slug}`} target="_blank" className="text-xs text-flamelo hover:underline">
            View
          </a>
        )}
        {!seller.is_active && <SellerActions sellerId={seller.id} />}
        <button
          onClick={handleToggleFounding}
          disabled={togglingFounding}
          className="text-xs text-bark/40 hover:text-flame disabled:opacity-50 transition-colors"
        >
          {togglingFounding ? "…" : seller.founding_maker ? "Remove founding" : "Mark founding"}
        </button>
        <button
          onClick={handleToggleSupporter}
          disabled={togglingSupporter}
          className="text-xs text-bark/40 hover:text-gold disabled:opacity-50 transition-colors"
        >
          {togglingSupporter ? "…" : seller.monthly_supporter ? "Remove supporter" : "Mark supporter"}
        </button>
        <button
          onClick={handleTogglePaid}
          disabled={togglingPaid}
          className="text-xs text-bark/40 hover:text-bark disabled:opacity-50 transition-colors"
        >
          {togglingPaid ? "…" : seller.onboarding_paid ? "Mark unpaid" : "Mark paid"}
        </button>
      </div>
    </div>
  );
}
