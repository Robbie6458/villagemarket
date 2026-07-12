"use client";

import { useState } from "react";
import { useGeo } from "@/lib/geo-context";
import { sendContactEmail } from "./actions";

interface ContactButtonProps {
  slug: string;
  sellerName: string;
  customOrdersOpen: boolean;
}

type FormStatus = "idle" | "submitting" | "sent" | "error";

export default function ContactButton({ slug, sellerName, customOrdersOpen }: ContactButtonProps) {
  const { isLocal, status } = useGeo();
  const [open, setOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "checking") return null;

  if (!isLocal) {
    return (
      <div className="group relative">
        <button
          disabled
          className="bg-bark/10 text-smoke text-sm font-medium px-5 py-2.5 rounded-full cursor-not-allowed"
        >
          Send a Request
        </button>
        <div className="absolute bottom-full right-0 mb-2 bg-ember text-linen text-xs rounded-lg px-3 py-2 w-52 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Visit North Idaho to unlock the ability to contact local makers.
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      await sendContactEmail(slug, {
        fromName: fd.get("name") as string,
        fromEmail: fd.get("email") as string,
        isCustomOrder: customOrdersOpen,
        message: fd.get("message") as string | undefined,
        request: fd.get("request") as string | undefined,
        timeline: fd.get("timeline") as string | undefined,
        budget: fd.get("budget") as string | undefined,
      });
      setFormStatus("sent");
    } catch (err) {
      setErrorMsg((err as Error).message || "Something went wrong. Please try again.");
      setFormStatus("error");
    }
  }

  function handleClose() {
    setOpen(false);
    setFormStatus("idle");
    setErrorMsg("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gold hover:bg-goldsoft text-ember text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
      >
        {customOrdersOpen ? "Request Custom Order" : "Send a Message"}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ember/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative bg-linen border border-fence rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            {formStatus === "sent" ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-flamelo" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg text-bark mb-2" style={{ fontFamily: "var(--font-serif)" }}>Request sent</h3>
                <p className="text-bark/60 text-sm mb-5">
                  {sellerName} will receive your request and follow up directly.
                </p>

                {process.env.NEXT_PUBLIC_STRIPE_TIP_LINK && (
                  <div className="bg-lamp rounded-xl p-4 mb-4 text-left">
                    <p className="text-bark text-xs font-medium mb-1">If this connection leads somewhere good —</p>
                    <p className="text-smoke text-xs leading-relaxed mb-3">
                      A small tip helps keep Village Market free, local, and ad-free.
                    </p>
                    <a
                      href={process.env.NEXT_PUBLIC_STRIPE_TIP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gold hover:bg-goldsoft text-ember text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                    >
                      Tip the Village ♡
                    </a>
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="text-sm text-bark/40 hover:text-bark transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-lg text-bark" style={{ fontFamily: "var(--font-serif)" }}>
                      {customOrdersOpen ? "Request a Custom Order" : "Send a Message"}
                    </h3>
                    <p className="text-bark/50 text-sm mt-0.5">to {sellerName}</p>
                  </div>
                  <button onClick={handleClose} className="text-bark/30 hover:text-bark text-xl leading-none mt-0.5">×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Your name" name="name" required />
                    <Field label="Email" name="email" type="email" required />
                  </div>

                  {customOrdersOpen && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bark mb-1.5">
                          What would you like made? <span className="text-flame">*</span>
                        </label>
                        <textarea
                          name="request"
                          required
                          rows={3}
                          placeholder="Describe what you have in mind — size, materials, style, any details…"
                          className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-bark mb-1.5">Timeline</label>
                          <select name="timeline" className="w-full px-3 py-2 border border-fence rounded-xl text-bark bg-linen focus:outline-none focus:border-gold text-sm">
                            <option value="">No preference</option>
                            <option value="As soon as possible">As soon as possible</option>
                            <option value="Within 2 weeks">Within 2 weeks</option>
                            <option value="Within a month">Within a month</option>
                            <option value="Flexible">Flexible</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-bark mb-1.5">Budget range</label>
                          <select name="budget" className="w-full px-3 py-2 border border-fence rounded-xl text-bark bg-linen focus:outline-none focus:border-gold text-sm">
                            <option value="">Not sure yet</option>
                            <option value="Under $50">Under $50</option>
                            <option value="$50 – $150">$50 – $150</option>
                            <option value="$150 – $500">$150 – $500</option>
                            <option value="$500+">$500+</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {!customOrdersOpen && (
                    <div>
                      <label className="block text-sm font-medium text-bark mb-1.5">
                        Message <span className="text-flame">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder="What would you like to ask or discuss?"
                        className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark placeholder-smoke/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm resize-none"
                      />
                    </div>
                  )}

                  {formStatus === "error" && (
                    <p className="text-flame text-sm">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full bg-gold hover:bg-goldsoft disabled:bg-gold/40 text-ember font-semibold py-3 rounded-full transition-colors text-sm"
                  >
                    {formStatus === "submitting" ? "Sending…" : "Send Request"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-bark mb-1.5">
        {label} {required && <span className="text-flame">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full px-3 py-2.5 border border-fence rounded-xl text-bark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm bg-linen"
      />
    </div>
  );
}
