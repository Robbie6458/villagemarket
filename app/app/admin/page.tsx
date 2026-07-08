import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import ApplicationsQueue from "./ApplicationsQueue";
import SignOutButton from "./SignOutButton";
import FeaturedManager from "./FeaturedManager";
import AdminSellerRow from "./AdminSellerRow";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  const admin = createAdminClient();

  const [
    { data: applications },
    { data: sellers },
    { count: pendingCount },
    { data: guestRequests },
  ] = await Promise.all([
    admin
      .from("seller_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("sellers").select("*").order("created_at", { ascending: false }),
    admin
      .from("seller_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("contact_requests")
      .select("vc_property")
      .not("vc_property", "is", null),
  ]);

  const pending = applications?.filter((a) => a.status === "pending") ?? [];
  const activeSellers = sellers?.filter((s) => s.is_active) ?? [];
  const contributors = sellers?.filter((s) => s.community_contributor) ?? [];

  const propertyCounts = (guestRequests ?? []).reduce((acc, r) => {
    if (r.vc_property) acc[r.vc_property] = (acc[r.vc_property] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topProperties = Object.entries(propertyCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-mist">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-bark" style={{ fontFamily: "var(--font-serif)" }}>
              Admin Dashboard
            </h1>
            <p className="text-bark/50 text-sm mt-1">Village Market — internal</p>
          </div>
          <SignOutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Sellers", value: activeSellers.length },
            { label: "Pending Applications", value: pendingCount ?? 0 },
            { label: "Contributors", value: contributors.length },
            { label: "Tip Jar Total", value: "$0.00" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5">
              <p className="text-2xl font-semibold text-bark mb-1">{stat.value}</p>
              <p className="text-bark/50 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Applications queue — client component for interactivity */}
        <ApplicationsQueue applications={pending} />

        <FeaturedManager sellers={sellers ?? []} />

        {/* Rentals driving sales */}
        {topProperties.length > 0 && (
          <section className="bg-white rounded-2xl p-6 mb-8">
            <h2 className="text-lg text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>
              Rentals Driving Sales
            </h2>
            <p className="text-bark/50 text-sm mb-4">
              Order requests from guests who identified their Village Collective property at checkout.
            </p>
            <div className="space-y-2">
              {topProperties.map(([property, count]) => (
                <div key={property} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-bark">{property}</span>
                  <span className="text-sm font-medium text-bark/60 bg-cream px-2.5 py-0.5 rounded-full">
                    {count} request{count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All sellers */}
        <section className="bg-white rounded-2xl p-6">
          <h2
            className="text-lg text-bark mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Sellers ({sellers?.length ?? 0})
          </h2>
          {!sellers?.length ? (
            <p className="text-bark/40 text-sm py-4">
              No sellers yet. Approve applications above to get started.
            </p>
          ) : (
            <div className="divide-y divide-wheat">
              {sellers.map((seller) => (
                <AdminSellerRow key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
