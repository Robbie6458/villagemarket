"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const STORAGE_KEY = "vm_bag";

export interface BagItem {
  productId: string;
  title: string;
  price: number;
  priceLabel?: string;
  photoUrl?: string;
  quantity: number;
  sellerId: string;
  sellerSlug: string;
  sellerName: string;
  sellerAcceptedPayments: string[];
}

interface BagContextValue {
  items: BagItem[];
  count: number;
  addItem: (item: Omit<BagItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearSeller: (sellerId: string) => void;
  clearAll: () => void;
}

const BagContext = createContext<BagContextValue>({
  items: [],
  count: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearSeller: () => {},
  clearAll: () => {},
});

export function BagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  function addItem(item: Omit<BagItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }

  function clearSeller(sellerId: string) {
    setItems((prev) => prev.filter((i) => i.sellerId !== sellerId));
  }

  function clearAll() {
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <BagContext.Provider
      value={{ items, count, addItem, removeItem, updateQuantity, clearSeller, clearAll }}
    >
      {children}
    </BagContext.Provider>
  );
}

export function useBag() {
  return useContext(BagContext);
}
