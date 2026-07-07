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

export default function AdminSellerRow({ seller }: { seller: Seller }) {
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
            <span className="text-[10px] text-bark/40 bg-wheat px-2 py-0.5 rounded-full">
              Setup pending
            </span>
          )}
          {seller.founding_maker && (
            <span className="text-[10px] text-white bg-clay px-2 py-0.5 rounded-full">
              🌱 Founding
            </span>
          )}
          {seller.monthly_supporter && (
            <span className="text-[10px] text-white bg-sage px-2 py-0.5 rounded-full">
              ♡ Supporter
            </span>
          )}
          {seller.community_contributor && (
            <span className="text-[10px] text-moss bg-moss/10 px-2 py-0.5 rounded-full">
              Contributor
            </span>
          )}
          {seller.featured && (
            <span className="text-[10px] text-clay bg-clay/10 px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {seller.onboarding_paid ? (
            <span className="text-[10px] text-sage bg-sage/10 px-2 py-0.5 rounded-full">
              ✓ Paid
            </span>
          ) : (
            <span className="text-[10px] text-clay/80 bg-clay/10 px-2 py-0.5 rounded-full">
              Unpaid
            </span>
          )}
        </div>
        <p className="text-bark/40 text-xs">
          {seller.location_label} · {seller.categories.join(", ")}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
        {seller.is_active && (
          <a href={`/sellers/${seller.slug}`} target="_blank" className="text-xs text-moss hover:underline">
            View
          </a>
        )}
        {!seller.is_active && <SellerActions sellerId={seller.id} />}
        <button
          onClick={handleToggleFounding}
          disabled={togglingFounding}
          className="text-xs text-bark/40 hover:text-clay disabled:opacity-50 transition-colors"
        >
          {togglingFounding ? "…" : seller.founding_maker ? "Remove founding" : "Mark founding"}
        </button>
        <button
          onClick={handleToggleSupporter}
          disabled={togglingSupporter}
          className="text-xs text-bark/40 hover:text-sage disabled:opacity-50 transition-colors"
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
