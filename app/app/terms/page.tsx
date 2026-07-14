import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Village Market",
  description: "The simple ground rules for using Village Market.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-lamp">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-gold text-xs font-medium tracking-[0.24em] uppercase mb-3" style={{ fontFamily: "var(--font-mono)" }}>
          Village Market
        </p>
        <h1 className="font-display text-4xl text-bark mb-2">Terms of Use</h1>
        <p className="text-smoke text-sm mb-10" style={{ fontFamily: "var(--font-mono)" }}>Last updated: July 2026</p>

        <div className="space-y-6 text-bark/80 text-[15px] leading-relaxed">
          <p>
            Village Market is a local marketplace run by Village Collective in Coeur d&apos;Alene, Idaho. By using the
            site, you agree to these simple ground rules. We&apos;ve kept them plain on purpose.
          </p>

          <Section title="What Village Market is (and isn't)">
            <p>
              Village Market <strong>introduces</strong> verified local makers to nearby buyers. That&apos;s it. We are
              not a store, a shipper, or a payment processor. When you buy, sell, or trade here, the transaction is
              <strong> directly between you and the other person</strong> — Village Market is not a party to it. We don&apos;t
              take a cut of sales, hold funds, guarantee goods, or arrange delivery.
            </p>
          </Section>

          <Section title="Buying on Village Market">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Adding items to your bag and sending a request is an <em>introduction</em>, not a completed purchase. The maker will follow up to work out details.</li>
              <li>You arrange payment and pickup or delivery <strong>directly with the maker</strong>, using whatever method you both agree on.</li>
              <li>Full buying features are available to people in the North Idaho area. From elsewhere, you can browse in view-only mode.</li>
              <li>Treat makers like the neighbors they are — communicate honestly and follow through on what you arrange.</li>
            </ul>
          </Section>

          <Section title="Selling on Village Market">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Every maker is personally reviewed and approved. We&apos;re selective by design.</li>
              <li>You must be a real, local maker, grower, or creator. No dropshipping, reselling, or mass-produced goods.</li>
              <li>There is a one-time onboarding fee to join (waived for founding makers). It is non-refundable once your storefront is activated. There is no recurring subscription.</li>
              <li>You&apos;re responsible for your own listings, pricing, taxes, licensing, product safety, and for honoring the orders and trades you accept.</li>
              <li>We may remove a storefront that misrepresents itself, sells prohibited items, or treats neighbors poorly.</li>
            </ul>
          </Section>

          <Section title="What's not allowed">
            <p>
              No illegal goods or services, no counterfeit or stolen items, no misrepresenting who you are or what you
              make, and nothing that would put the community or other users at risk.
            </p>
          </Section>

          <Section title="Your content">
            <p>
              Makers own their photos, words, and listings. By posting them, you give Village Market permission to
              display and promote them on the site and in Village Collective materials that feature the market.
            </p>
          </Section>

          <Section title="No warranties & limits">
            <p>
              Village Market is provided &ldquo;as is.&rdquo; Because we&apos;re only the introduction and not a party to any
              transaction, we can&apos;t guarantee the quality, safety, legality, or delivery of anything bought or sold
              here, and we aren&apos;t liable for disputes between buyers and makers. To the fullest extent allowed by
              law, Village Market and Village Collective are not liable for indirect or incidental damages arising from
              your use of the site. Nothing here limits rights that can&apos;t be limited under Idaho law.
            </p>
          </Section>

          <Section title="Changes, law & contact">
            <p>
              We may update these terms; we&apos;ll change the date above when we do. These terms are governed by the
              laws of the State of Idaho. Questions? Email{" "}
              <a href="mailto:info@village-collective.com" className="text-flamelo hover:underline">info@village-collective.com</a>.
            </p>
          </Section>

          <p className="text-smoke text-sm pt-2">
            Written to be clear and fair, not as legal advice. See also our{" "}
            <Link href="/privacy" className="text-flamelo hover:underline">Privacy Policy</Link>.
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
