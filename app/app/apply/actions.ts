"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { EMAIL_FROM } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ApplicationInput {
  name: string;
  email: string;
  phone: string;
  location: string;
  categories: string[];
  description: string;
  experience: string;
  payment_methods: string[];
  delivery_available: boolean;
  delivery_radius_miles: number;
  social_links: string | null;
  referral_source: string | null;
}

export async function submitApplication(
  input: ApplicationInput
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase.from("seller_applications").insert(input);
  if (error) {
    console.error("Application insert failed:", error.message);
    return { success: false };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const firstName = input.name.split(" ")[0];

  // Confirmation to the applicant — a failed email never fails the application
  try {
    const { error: e1 } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.email,
      subject: "We got your application — Village Market",
      html: `
        <p>Hi ${firstName},</p>
        <p>Thanks for applying to sell on Village Market. Your application is in — and a real person (not an algorithm) is going to read it.</p>
        <p>Every maker on Village Market is personally reviewed, so give us a few days. If it's a good fit, you'll get an email with a link to set up your storefront.</p>
        <p>In the meantime, no need to do anything. We'll be in touch soon.</p>
        <p>— The Village Market team<br><span style="color:#999;font-size:12px;">Coeur d'Alene, North Idaho</span></p>
      `,
    });
    if (e1) console.error("Applicant confirmation email failed:", JSON.stringify(e1));
  } catch (e) {
    console.error("Applicant confirmation email failed:", e);
  }

  // Alert to the admin
  try {
    if (process.env.ADMIN_EMAIL) {
      const { error: e2 } = await resend.emails.send({
        from: EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        replyTo: input.email,
        subject: `New maker application: ${input.name}`,
        html: `
          <p><strong>${input.name}</strong> just applied to sell on Village Market.</p>
          <ul>
            <li><strong>Location:</strong> ${input.location}</li>
            <li><strong>Makes:</strong> ${input.categories.join(", ") || "—"}</li>
            <li><strong>Email:</strong> ${input.email}</li>
            ${input.phone ? `<li><strong>Phone:</strong> ${input.phone}</li>` : ""}
            ${input.social_links ? `<li><strong>Links:</strong> ${input.social_links}</li>` : ""}
          </ul>
          <p><strong>What they make:</strong><br>${input.description}</p>
          ${appUrl ? `<p><a href="${appUrl}/admin">Review it in the admin dashboard →</a></p>` : ""}
        `,
      });
      if (e2) console.error("Admin notification email failed:", JSON.stringify(e2));
    }
  } catch (e) {
    console.error("Admin notification email failed:", e);
  }

  return { success: true };
}
