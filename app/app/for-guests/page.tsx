import { createClient } from "@/lib/supabase/server";
import { Seller } from "@/lib/types";
import GuestPage from "./GuestPage";

export default async function ForGuestsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("sellers")
    .select("*, products(*)")
    .eq("is_active", true)
    .order("name");

  const sellers = (data ?? []) as unknown as Seller[];

  const deliverySellers = sellers.filter((s) => s.delivery_available).slice(0, 3);
  const availableSellers = sellers.filter((s) => s.is_available_now).slice(0, 3);
  const customSellers = sellers.filter((s) => s.custom_orders_open).slice(0, 3);

  return (
    <GuestPage
      deliverySellers={deliverySellers}
      availableSellers={availableSellers}
      customSellers={customSellers}
    />
  );
}
