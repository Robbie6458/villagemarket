"use client";

import { useState } from "react";
import { toggleSellerFeatured } from "./actions";

type Seller = {
  id: string;
  name: string;
  slug: string;
  location_label: string;
  categories: string[];
  featured: boolean;
  is_active: boolean;
};

const MAX_FEATURED = 3;

export default function FeaturedManager({ sellers }: { sellers: Seller[] }) {
  const featured = sellers.filter((s) => s.featured);
  const eligible = sellers.filter((s) => s.is_active && !s.featured);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setLoadingId(id);
    try {
      await toggleSellerFeatured(id, false);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAdd(id: string) {
    setAddingId(id);
    try {
      await toggleSellerFeatured(id, true);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <section className="bg-linen rounded-2xl p-6 mb-6">
      <h2 className="text-lg text-bark mb-4" style={{ fontFamily: "var(--font-serif)" }}>
        Featured Placements ({featured.length}/{MAX_FEATURED} slots)
      </h2>

      {featured.length === 0 ? (
        <p className="text-bark/40 text-sm py-2">No featured sellers yet</p>
      ) : (
        <div className="space-y-3 mb-4">
          {featured.map((seller) => (
            <div key={seller.id} className="flex items-center justify-between gap-3 p-3 bg-lamp rounded-xl">
              <div>
                <p className="font-medium text-bark text-sm">{seller.name}</p>
                <p className="text-bark/50 text-xs">{seller.location_label} · {seller.categories.join(", ")}</p>
              </div>
              <button
                onClick={() => handleRemove(seller.id)}
                disabled={loadingId === seller.id}
                className="text-xs text-flame hover:text-bark disabled:opacity-50 transition-colors"
              >
                {loadingId === seller.id ? "…" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}

      {featured.length < MAX_FEATURED && eligible.length > 0 && (
        <div className="border-t border-fence pt-4">
          <p className="text-xs font-medium text-bark/50 mb-3 uppercase tracking-wide">
            Add a featured seller ({MAX_FEATURED - featured.length} slot{MAX_FEATURED - featured.length !== 1 ? "s" : ""} open)
          </p>
          <div className="space-y-2">
            {eligible.map((seller) => (
              <div key={seller.id} className="flex items-center justify-between gap-3 p-3 border border-fence rounded-xl">
                <div>
                  <p className="font-medium text-bark text-sm">{seller.name}</p>
                  <p className="text-bark/50 text-xs">{seller.location_label} · {seller.categories.join(", ")}</p>
                </div>
                <button
                  onClick={() => handleAdd(seller.id)}
                  disabled={addingId === seller.id}
                  className="text-xs text-flamelo hover:text-bark disabled:opacity-50 font-medium transition-colors"
                >
                  {addingId === seller.id ? "…" : "+ Feature"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {featured.length >= MAX_FEATURED && (
        <p className="text-xs text-bark/40 mt-2">All slots filled. Remove one to add another.</p>
      )}
    </section>
  );
}
