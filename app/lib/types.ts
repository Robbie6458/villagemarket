export type AvailabilityStatus = "available" | "seasonal" | "made_to_order";
export type GeoStatus = "checking" | "local" | "visitor";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  price_label?: string; // e.g. "per dozen", "per lb"
  photo_url: string;
  category: string;
  availability_status: AvailabilityStatus;
}

export interface Seller {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  bio: string;
  location_label: string;
  lat: number;
  lng: number;
  categories: string[];
  cover_photo_url: string;
  profile_photo_url: string;
  accepted_payments: string[];
  payment_other_label?: string;
  barter_accepts: string;
  delivery_available: boolean;
  delivery_radius_miles: number;
  custom_orders_open: boolean;
  community_contributor: boolean;
  featured: boolean;
  verified: boolean;
  contact_email?: string;
  products: Product[];
}

export const CATEGORIES = [
  "Food & Farm",
  "Wood & Craft",
  "Apothecary & Wellness",
  "Art & Photography",
  "Fiber & Textile",
  "Metal & Forge",
  "Garden & Plant",
  "Services",
  "Other",
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "Venmo",
  "PayPal",
  "Cash App",
  "Crypto",
  "Barter",
  "Other",
] as const;

export const NEIGHBORHOODS = [
  "Coeur d'Alene",
  "Post Falls",
  "Hayden",
  "Rathdrum",
  "Sandpoint",
  "Other North Idaho",
] as const;
