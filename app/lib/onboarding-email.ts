import { Resend } from "resend";
import { EMAIL_FROM } from "@/lib/email";
import { brandedEmail, emailButton } from "@/lib/email-template";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://village-market-app.onrender.com";

/**
 * Sent once, when a seller's onboarding fee is settled — whether they paid
 * through Stripe or an admin marked/waived it (founding makers). This is the
 * "you're all set, go live" nudge, separate from Stripe's own payment receipt.
 * Callers should only fire this on a false -> true transition.
 */
export async function sendOnboardingPaidEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("sendOnboardingPaidEmail: RESEND_API_KEY not set, skipping");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const firstName = name.split(" ")[0];

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "You're all set — your Village Market storefront can go live",
    html: brandedEmail(`
      <p style="margin-top:0;">Hi ${firstName},</p>
      <p>Good news — your one-time market setup is complete. Your account is fully unlocked, and your storefront is ready to go live whenever you are.</p>
      <p>Two quick things before you flip the switch:</p>
      <ul>
        <li>Add a tagline, a short bio, and at least one product.</li>
        <li>Then hit <strong>Go Live</strong> to appear in the market.</li>
      </ul>
      ${emailButton("Open your dashboard", `${APP_URL}/dashboard`)}
      <p style="margin-bottom:0;">Welcome to the market.<br>— The Village Market team</p>
    `),
  });
}
