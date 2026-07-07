"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(
  slug: string,
  data: {
    fromName: string;
    fromEmail: string;
    isCustomOrder: boolean;
    message?: string;
    request?: string;
    timeline?: string;
    budget?: string;
  }
) {
  const supabase = await createClient();
  const { data: seller } = await supabase
    .from("sellers")
    .select("id, name, contact_email")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!seller?.contact_email) throw new Error("Seller not found");

  const subject = data.isCustomOrder
    ? `Custom order request from ${data.fromName}`
    : `Message from ${data.fromName} via Village Market`;

  const html = data.isCustomOrder
    ? `
      <p>Hi ${seller.name},</p>
      <p>You have a new custom order request from <strong>${data.fromName}</strong> via Village Market.</p>
      <p><strong>What they'd like made:</strong><br>${data.request}</p>
      ${data.timeline ? `<p><strong>Timeline:</strong> ${data.timeline}</p>` : ""}
      ${data.budget ? `<p><strong>Budget:</strong> ${data.budget}</p>` : ""}
      <p>Reply directly to this email to follow up with them.</p>
      <p style="margin-top:16px;color:#888;font-size:12px;">Sent via Village Market · market.village-collective.com</p>
    `
    : `
      <p>Hi ${seller.name},</p>
      <p>You have a new message from <strong>${data.fromName}</strong> via Village Market.</p>
      <blockquote style="border-left:3px solid #ccc;margin:12px 0;padding:8px 16px;color:#555;">${data.message}</blockquote>
      <p>Reply directly to this email to respond.</p>
      <p style="margin-top:16px;color:#888;font-size:12px;">Sent via Village Market · market.village-collective.com</p>
    `;

  const { error } = await resend.emails.send({
    from: "Village Market <onboarding@resend.dev>",
    to: seller.contact_email,
    replyTo: data.fromEmail,
    subject,
    html,
  });

  if (error) throw new Error("Failed to send message. Please try again.");

  // Store contact request for 48h tip follow-up email (fire and forget)
  await supabase.from("contact_requests").insert({
    buyer_name: data.fromName,
    buyer_email: data.fromEmail,
    seller_id: seller.id,
    seller_name: seller.name,
  });
}
