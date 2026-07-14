"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCurrentSellerId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!seller) throw new Error("No seller record found");
  return seller.id;
}

export async function updateStorefront(data: {
  tagline: string;
  bio: string;
  location_label: string;
  barter_accepts: string;
  accepted_payments: string[];
  delivery_available: boolean;
  delivery_radius_miles: number;
  delivery_fee: number | null;
  delivery_fee_label: string;
  custom_orders_open: boolean;
  is_available_now: boolean;
  cover_photo_url?: string;
  profile_photo_url?: string;
  instagram_url?: string;
  website_url?: string;
  fulfillment_preferences?: string;
}) {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("sellers")
    .update(data)
    .eq("id", sellerId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function updateSellerPhoto(which: "cover" | "profile", url: string) {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();

  const column = which === "cover" ? "cover_photo_url" : "profile_photo_url";
  const { error } = await supabase
    .from("sellers")
    .update({ [column]: url })
    .eq("id", sellerId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function goLive() {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("sellers")
    .update({ is_active: true })
    .eq("id", sellerId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function markOnboardingPaid() {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({ onboarding_paid: true })
    .eq("id", sellerId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function goOffline() {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("sellers")
    .update({ is_active: false })
    .eq("id", sellerId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function createProduct(data: {
  title: string;
  description: string;
  price: number;
  price_label: string;
  photo_urls: string[];
  category: string;
  availability_status: string;
  is_custom_order: boolean;
  is_highlighted: boolean;
  restocking: boolean;
}) {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();

  const { error } = await supabase.from("products").insert({
    ...data,
    seller_id: sellerId,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function updateProduct(
  productId: string,
  data: {
    title: string;
    description: string;
    price: number;
    price_label: string;
    photo_urls: string[];
    category: string;
    availability_status: string;
    is_custom_order: boolean;
    is_highlighted: boolean;
    restocking: boolean;
  }
) {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();

  // RLS ensures the product belongs to this seller, but we double-check via seller_id
  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", productId)
    .eq("seller_id", sellerId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .eq("seller_id", sellerId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function deleteProduct(productId: string) {
  const sellerId = await getCurrentSellerId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("seller_id", sellerId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
