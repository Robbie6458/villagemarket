import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Village Market",
  description: "How Village Market handles your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-lamp">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-gold text-xs font-medium tracking-[0.24em] uppercase mb-3" style={{ fontFamily: "var(--font-mono)" }}>
          Village Market
        </p>
        <h1 className="font-display text-4xl text-bark mb-2">Privacy Policy</h1>
        <p className="text-smoke text-sm mb-10" style={{ fontFamily: "var(--font-mono)" }}>Last updated: July 2026</p>

        <div className="prose-vm space-y-6 text-bark/80 text-[15px] leading-relaxed">
          <p>
            Village Market is a small, local marketplace run by Village Collective in Coeur d&apos;Alene, Idaho.
            We think privacy should be as plain and neighborly as the market itself, so here is exactly what we
            collect, why, and what we do with it — in ordinary language.
          </p>

          <Section title="The short version">
            <p>
              We collect only what we need to connect local makers and buyers, we never sell your information, and
              we don&apos;t run ads or tracking. Village Market does not handle money between buyers and makers —
              those transactions happen directly between neighbors.
            </p>
          </Section>

          <Section title="What we collect">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>If you join the waitlist or newsletter:</strong> your name and email.</li>
              <li><strong>If you apply to sell:</strong> your name, email, phone (optional), neighborhood, what you make, experience, accepted payment methods, and any links you share.</li>
              <li><strong>If you contact a maker or send an order request:</strong> your name, email, and the message or items you send.</li>
              <li><strong>Location:</strong> with your permission, your device shares its approximate location so we can tell whether you&apos;re in the North Idaho area. We use it only to unlock local access and show distances. It&apos;s stored in your browser for about 24 hours and is never sent to makers or third parties.</li>
              <li><strong>Basic technical data:</strong> standard server logs (like IP address and browser type) needed to run and secure the site.</li>
            </ul>
          </Section>

          <Section title="How we use it">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To run the marketplace and connect you with local makers.</li>
              <li>To personally review and verify every maker who applies.</li>
              <li>To send you transactional email (application updates, order requests, account links).</li>
              <li>To send occasional updates <em>only</em> if you opted in — you can unsubscribe anytime.</li>
            </ul>
          </Section>

          <Section title="Payments">
            <p>
              Village Market does <strong>not</strong> process payments between buyers and makers. When you buy from a
              maker, you pay them directly using whatever method you both agree on (cash, Venmo, PayPal, barter, and so
              on). We never see or store your card or bank details. The only payment we handle is a one-time onboarding
              fee some makers pay to join, which is processed securely by <strong>Stripe</strong> — we don&apos;t store
              those card details either.
            </p>
          </Section>

          <Section title="Who we share it with">
            <p>We don&apos;t sell your personal information. We share it only with the services that help us run the market:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Supabase</strong> — our database and account sign-in.</li>
              <li><strong>Resend</strong> — sends our email.</li>
              <li><strong>MailerLite</strong> — our newsletter, if you opted in.</li>
              <li><strong>Stripe</strong> — maker onboarding fees only.</li>
              <li><strong>Render</strong> — hosts the site. <strong>OpenStreetMap / CARTO</strong> — the map tiles.</li>
            </ul>
            <p>When you message or buy from a maker, the maker naturally receives the name, email, and details you chose to send them.</p>
          </Section>

          <Section title="Your choices">
            <p>
              You can ask to see, correct, or delete the information we hold about you at any time — just email us.
              You can unsubscribe from the newsletter with one click, and you can decline or revoke location access in
              your browser settings (you&apos;ll simply browse in view-only mode).
            </p>
          </Section>

          <Section title="Children">
            <p>Village Market isn&apos;t directed at children, and we don&apos;t knowingly collect information from anyone under 13.</p>
          </Section>

          <Section title="Changes & contact">
            <p>
              If we update this policy, we&apos;ll change the date above. Questions, requests, or concerns? Email us at{" "}
              <a href="mailto:info@village-collective.com" className="text-flamelo hover:underline">info@village-collective.com</a>.
            </p>
          </Section>

          <p className="text-smoke text-sm pt-2">
            This policy is written to be clear and honest, not as legal advice. See also our{" "}
            <Link href="/terms" className="text-flamelo hover:underline">Terms of Use</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-bark mb-2">{title}</h2>
      {children}
    </section>
  );
}
