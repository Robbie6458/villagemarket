"use client";

import { useState } from "react";
import { useGeo } from "@/lib/geo-context";
import { useBag } from "@/lib/bag-context";

interface AddToBagButtonProps {
  productId: string;
  title: string;
  price: number;
  priceLabel?: string;
  photoUrl?: string;
  sellerId: string;
  sellerSlug: string;
  sellerName: string;
  sellerAcceptedPayments: string[];
}

export default function AddToBagButton(props: AddToBagButtonProps) {
  const { isLocal, status } = useGeo();
  const { items, addItem, updateQuantity } = useBag();
  const [justAdded, setJustAdded] = useState(false);

  const inBag = items.find((i) => i.productId === props.productId);

  if (status === "checking") return null;

  if (!isLocal) {
    return (
      <div className="group relative">
        <button
          disabled
          className="w-full bg-bark/10 text-bark/40 text-xs font-medium py-2 rounded-full cursor-not-allowed"
        >
          Add to Bag
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-bark text-white text-xs rounded-lg px-3 py-2 w-48 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Visit North Idaho to unlock buying from local makers.
        </div>
      </div>
    );
  }

  if (inBag) {
    return (
      <div className="flex items-center justify-between gap-2 bg-cream rounded-full px-1 py-1">
        <button
          onClick={() => updateQuantity(props.productId, inBag.quantity - 1)}
          className="w-6 h-6 rounded-full bg-white text-bark text-sm flex items-center justify-center hover:bg-wheat transition-colors"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="text-xs font-medium text-bark">{inBag.quantity} in bag</span>
        <button
          onClick={() => updateQuantity(props.productId, inBag.quantity + 1)}
          className="w-6 h-6 rounded-full bg-white text-bark text-sm flex items-center justify-center hover:bg-wheat transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        addItem({
          productId: props.productId,
          title: props.title,
          price: props.price,
          priceLabel: props.priceLabel,
          photoUrl: props.photoUrl,
          sellerId: props.sellerId,
          sellerSlug: props.sellerSlug,
          sellerName: props.sellerName,
          sellerAcceptedPayments: props.sellerAcceptedPayments,
        });
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1200);
      }}
      className="w-full bg-bark hover:bg-moss text-cream text-xs font-medium py-2 rounded-full transition-colors"
    >
      {justAdded ? "Added ✓" : "Add to Bag"}
    </button>
  );
}
