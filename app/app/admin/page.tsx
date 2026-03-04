"use client";

import { useState } from "react";
import { SELLERS } from "@/lib/seed-data";

const MOCK_APPLICATIONS = [
  { id: "a1", name: "Rachel Nguyen", location: "Coeur d'Alene", categories: ["Fiber & Textile"], description: "Hand-dyed silk scarves and botanical print textiles.", submitted: "2 hours ago", status: "pending" },
  { id: "a2", name: "Tom Braddock", location: "Post Falls", categories: ["Wood & Craft"], description: "Rustic furniture and reclaimed wood decor.", submitted: "1 day ago", status: "pending" },
  { id: "a3", name: "Clearwater Organics", location: "Rathdrum", categories: ["Food & Farm"], description: "Certified organic vegetables and microgreens.", submitted: "3 days ago", status: "pending" },
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [apps, setApps] = useState(MOCK_APPLICATIONS);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    // TODO: validate against ADMIN_PASSWORD env var via server action
    if (password === "admin" || password === process.env.NEXT_PUBLIC_ADMIN_PREVIEW_PW) {
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-2xl text-bark mb-1" style={{ fontFamily: "var(--font-serif)" }}>Admin</h1>
          <p className="text-bark/50 text-sm mb-6">Village Market dashboard</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-wheat rounded-xl text-bark placeholder-bark/35 focus:outline-none focus:border-moss focus:ring-1 focus:ring-moss text-sm"
            />
            {authError && <p className="text-clay text-sm">Incorrect password</p>}
            <button
              type="submit"
              className="w-full bg-bark hover:bg-moss text-cream font-medium py-2.5 rounded-full transition-colors text-sm"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  const approveApp = (id: string) =>
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
  const rejectApp = (id: string) =>
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a));

  const pending = apps.filter((a) => a.status === "pending");
  const featured = SELLERS.filter((s) => s.featured);

  return (
    <div className="min-h-screen bg-mist">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-bark" style={{ fontFamily: "var(--font-serif)" }}>Admin Dashboard</h1>
            <p className="text-bark/50 text-sm mt-1">Village Market — internal</p>
          </div>
          <button onClick={() => setAuthed(false)} className="text-sm text-bark/40 hover:text-bark transition-colors">
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Sellers", value: SELLERS.length },
            { label: "Pending Applications", value: pending.length },
            { label: "Contributors", value: SELLERS.filter((s) => s.community_contributor).length },
            { label: "Tip Jar Total", value: "$0.00" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5">
              <p className="text-2xl font-semibold text-bark mb-1">{stat.value}</p>
              <p className="text-bark/50 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Applications queue */}
        <section className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-lg text-bark mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Pending Applications ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-bark/40 text-sm py-4">No pending applications</p>
          ) : (
            <div className="divide-y divide-wheat">
              {pending.map((app) => (
                <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-bark text-sm">{app.name}</span>
                      <span className="text-xs text-sage bg-cream px-2 py-0.5 rounded-full">{app.location}</span>
                      {app.categories.map((c) => (
                        <span key={c} className="text-xs text-moss bg-moss/10 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                    <p className="text-bark/60 text-xs leading-relaxed">{app.description}</p>
                    <p className="text-bark/30 text-xs mt-1">Submitted {app.submitted}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approveApp(app.id)}
                      className="bg-moss text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-bark transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectApp(app.id)}
                      className="border border-wheat text-bark/60 text-xs font-medium px-3 py-1.5 rounded-full hover:border-clay hover:text-clay transition-colors"
                    >
                      Reject
                    </button>
                    <button className="border border-wheat text-bark/60 text-xs font-medium px-3 py-1.5 rounded-full hover:border-bark transition-colors">
                      Request Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Featured placement */}
        <section className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-lg text-bark mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Featured Placements (3 slots)
          </h2>
          <div className="space-y-3">
            {featured.map((seller) => (
              <div key={seller.id} className="flex items-center justify-between gap-3 p-3 bg-cream rounded-xl">
                <div>
                  <p className="font-medium text-bark text-sm">{seller.name}</p>
                  <p className="text-bark/50 text-xs">{seller.location_label} · {seller.categories.join(", ")}</p>
                </div>
                <button className="text-xs text-clay hover:text-bark transition-colors">Remove</button>
              </div>
            ))}
            {featured.length < 3 && (
              <div className="border-2 border-dashed border-wheat rounded-xl p-4 text-center">
                <p className="text-bark/40 text-xs">+ Add featured seller ({3 - featured.length} slot{3 - featured.length !== 1 ? "s" : ""} available)</p>
              </div>
            )}
          </div>
        </section>

        {/* Active sellers */}
        <section className="bg-white rounded-2xl p-6">
          <h2 className="text-lg text-bark mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Active Sellers ({SELLERS.length})
          </h2>
          <div className="divide-y divide-wheat">
            {SELLERS.map((seller) => (
              <div key={seller.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-bark text-sm">{seller.name}</span>
                    {seller.community_contributor && (
                      <span className="text-[10px] text-moss bg-moss/10 px-2 py-0.5 rounded-full">Contributor</span>
                    )}
                    {seller.featured && (
                      <span className="text-[10px] text-clay bg-clay/10 px-2 py-0.5 rounded-full">Featured</span>
                    )}
                  </div>
                  <p className="text-bark/40 text-xs mt-0.5">{seller.location_label} · {seller.categories.join(", ")}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`/sellers/${seller.slug}`} target="_blank" className="text-xs text-moss hover:underline">View</a>
                  <span className="text-bark/20">·</span>
                  <button className="text-xs text-bark/40 hover:text-bark">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
