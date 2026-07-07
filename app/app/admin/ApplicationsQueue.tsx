"use client";

import { useState } from "react";
import { approveApplication, rejectApplication } from "./actions";

type Application = {
  id: string;
  name: string;
  email: string;
  location: string;
  categories: string[];
  description: string;
  experience: string;
  payment_methods: string[];
  delivery_available: boolean;
  delivery_radius_miles: number;
  social_links: string | null;
  referral_source: string | null;
  created_at: string;
};

export default function ApplicationsQueue({
  applications,
}: {
  applications: Application[];
}) {
  const [loading, setLoading] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoading((prev) => ({ ...prev, [id]: "approving" }));
    try {
      await approveApplication(id);
    } catch (err) {
      console.error(err);
      alert("Failed to approve application. Check the console.");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: "" }));
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this application and notify the applicant?")) return;
    setLoading((prev) => ({ ...prev, [id]: "rejecting" }));
    try {
      await rejectApplication(id);
    } catch (err) {
      console.error(err);
      alert("Failed to reject application. Check the console.");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: "" }));
    }
  }

  return (
    <section className="bg-white rounded-2xl p-6 mb-6">
      <h2 className="text-lg text-bark mb-4" style={{ fontFamily: "var(--font-serif)" }}>
        Pending Applications ({applications.length})
      </h2>

      {applications.length === 0 ? (
        <p className="text-bark/40 text-sm py-4">No pending applications</p>
      ) : (
        <div className="divide-y divide-wheat">
          {applications.map((app) => {
            const isExpanded = expanded === app.id;
            const action = loading[app.id];

            return (
              <div key={app.id} className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-bark text-sm">{app.name}</span>
                      <span className="text-xs text-sage bg-cream px-2 py-0.5 rounded-full">
                        {app.location}
                      </span>
                      {app.categories.map((c) => (
                        <span key={c} className="text-xs text-moss bg-moss/10 px-2 py-0.5 rounded-full">
                          {c}
                        </span>
                      ))}
                    </div>
                    <p className="text-bark/60 text-xs leading-relaxed line-clamp-2">
                      {app.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-bark/30 text-xs">
                        {new Date(app.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : app.id)}
                        className="text-xs text-moss hover:underline"
                      >
                        {isExpanded ? "Less" : "Full details"}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(app.id)}
                      disabled={!!action}
                      className="bg-moss text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-bark disabled:opacity-50 transition-colors"
                    >
                      {action === "approving" ? "Approving…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      disabled={!!action}
                      className="border border-wheat text-bark/60 text-xs font-medium px-3 py-1.5 rounded-full hover:border-clay hover:text-clay disabled:opacity-50 transition-colors"
                    >
                      {action === "rejecting" ? "Rejecting…" : "Reject"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 bg-cream rounded-xl p-4 text-xs space-y-2 text-bark/70">
                    <p><span className="font-medium text-bark">Email:</span> {app.email}</p>
                    {app.experience && (
                      <p><span className="font-medium text-bark">Experience:</span> {app.experience}</p>
                    )}
                    {app.payment_methods.length > 0 && (
                      <p><span className="font-medium text-bark">Accepts:</span> {app.payment_methods.join(", ")}</p>
                    )}
                    {app.delivery_available && (
                      <p><span className="font-medium text-bark">Delivery:</span> up to {app.delivery_radius_miles} miles</p>
                    )}
                    {app.social_links && (
                      <p><span className="font-medium text-bark">Links:</span> {app.social_links}</p>
                    )}
                    {app.referral_source && (
                      <p><span className="font-medium text-bark">Heard via:</span> {app.referral_source}</p>
                    )}
                    <div className="pt-1">
                      <p className="font-medium text-bark mb-1">Description:</p>
                      <p className="leading-relaxed">{app.description}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
