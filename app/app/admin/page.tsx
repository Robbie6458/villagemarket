import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import ApplicationsQueue from "./ApplicationsQueue";
import SignOutButton from "./SignOutButton";
import FeaturedManager from "./FeaturedManager";
import AdminSellerRow from "./AdminSellerRow";

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

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
    { data: productRows },
    { data: contactRows },
    usersRes,
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
    admin.from("contact_requests").select("vc_property, seller_id"),
    admin.from("products").select("seller_id").eq("is_active", true),
    admin.from("contact_requests").select("seller_id"),
    admin.auth.admin.listUsers(),
  ]);

  const pending = applications?.filter((a) => a.status === "pending") ?? [];
  const activeSellers = sellers?.filter((s) => s.is_active) ?? [];
  const contributors = sellers?.filter((s) => s.community_contributor) ?? [];

  const propertyCounts = (guestRequests ?? []).reduce((acc, r) => {
    if (r.vc_property) acc[r.vc_property] = (acc[r.vc_property] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topProperties = Object.entries(propertyCounts).sort((a, b) => b[1] - a[1]);

  // Per-seller operational stats for the control hub
  const productCounts = (productRows ?? []).reduce((acc, r) => {
    if (r.seller_id) acc[r.seller_id] = (acc[r.seller_id] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const contactCounts = (contactRows ?? []).reduce((acc, r) => {
    if (r.seller_id) acc[r.seller_id] = (acc[r.seller_id] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const lastOnlineByAuthId = (usersRes.data?.users ?? []).reduce((acc, u) => {
    if (u.last_sign_in_at) acc[u.id] = u.last_sign_in_at;
    return acc;
  }, {} as Record<string, string>);

  const statsFor = (seller: { id: string; auth_user_id: string | null }) => ({
    productCount: productCounts[seller.id] ?? 0,
    contactCount: contactCounts[seller.id] ?? 0,
    lastOnline: seller.auth_user_id ? lastOnlineByAuthId[seller.auth_user_id] ?? null : null,
  });

  // Makers who've been approved but haven't finished getting live
  const inSetup = (sellers ?? []).filter((s) => !s.is_active);

  return (
    <div className="min-h-screen bg-lamp">
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
            <div key={stat.label} className="bg-linen rounded-2xl p-5">
              <p className="text-2xl font-semibold text-bark mb-1">{stat.value}</p>
              <p className="text-bark/50 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Applications queue — client component for interactivity */}
        <ApplicationsQueue applications={pending} />

        {/* Makers in setup — approved but not yet live */}
        {inSetup.length > 0 && (
          <section className="bg-linen rounded-2xl p-6 mb-6 border border-flame/30">
            <h2 className="text-lg text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>
              Makers in Setup ({inSetup.length})
            </h2>
            <p className="text-bark/50 text-sm mb-4">
              Approved makers who haven&apos;t gone live yet. Nudge them through the last steps.
            </p>
            <div className="divide-y divide-fence">
              {inSetup.map((s) => {
                const st = statsFor(s);
                return (
                  <div key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-bark">{s.name}</span>
                      <div className="flex flex-wrap gap-1.5 mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.onboarding_paid ? "text-gold bg-gold/10" : "text-flame bg-flame/10"}`}>
                          {s.onboarding_paid ? "fee paid" : "fee unpaid"}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.productCount > 0 ? "text-gold bg-gold/10" : "text-flame bg-flame/10"}`}>
                          {st.productCount} products
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full text-smoke bg-lamp">
                          {st.lastOnline ? `last seen ${relTime(st.lastOnline)}` : "never signed in"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <FeaturedManager sellers={sellers ?? []} />

        {/* Rentals driving sales */}
        {topProperties.length > 0 && (
          <section className="bg-linen rounded-2xl p-6 mb-8">
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
                  <span className="text-sm font-medium text-bark/60 bg-lamp px-2.5 py-0.5 rounded-full">
                    {count} request{count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All sellers */}
        <section className="bg-linen rounded-2xl p-6">
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
            <div className="divide-y divide-fence">
              {sellers.map((seller) => (
                <AdminSellerRow
                  key={seller.id}
                  seller={seller}
                  stats={{ ...statsFor(seller), lastOnlineLabel: statsFor(seller).lastOnline ? relTime(statsFor(seller).lastOnline!) : null }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
