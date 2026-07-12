import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StorefrontEditor from "./StorefrontEditor";
import ProductManager from "./ProductManager";
import SignOutButtonClient from "./SignOutButtonClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/seller/login");

  // Load their seller record
  const { data: seller } = await supabase
    .from("sellers")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!seller) {
    return (
      <div className="min-h-screen bg-lamp">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-gold text-xs font-medium tracking-widest uppercase mb-1">
                Seller Dashboard
              </p>
              <p className="text-bark/50 text-sm">{user.email}</p>
            </div>
            <SignOutButtonClient />
          </div>
          <div className="bg-linen rounded-2xl p-8 text-center">
            <h1
              className="text-2xl text-bark mb-3"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Account setup in progress
            </h1>
            <p className="text-bark/60 text-sm leading-relaxed">
              Your seller account is being set up. If you just approved your application,
              this may take a moment. Try refreshing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Load their products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-lamp">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-1">
              Seller Dashboard
            </p>
            <h1
              className="text-3xl text-bark"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {seller.name}
            </h1>
          </div>
          <SignOutButtonClient />
        </div>

        <StorefrontEditor seller={seller} />

        <div className="mt-6">
          <ProductManager products={products ?? []} sellerId={seller.id} />
        </div>
      </div>
    </div>
  );
}

