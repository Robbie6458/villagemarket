"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { EMAIL_FROM } from "@/lib/email";
import { brandedEmail } from "@/lib/email-template";

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
    ? brandedEmail(`
      <p style="margin-top:0;">Hi ${seller.name},</p>
      <p>You have a new custom order request from <strong>${data.fromName}</strong> via Village Market.</p>
      <p><strong>What they'd like made:</strong><br>${data.request}</p>
      ${data.timeline ? `<p><strong>Timeline:</strong> ${data.timeline}</p>` : ""}
      ${data.budget ? `<p><strong>Budget:</strong> ${data.budget}</p>` : ""}
      <p style="margin-bottom:0;">Reply directly to this email to follow up with them.</p>
    `)
    : brandedEmail(`
      <p style="margin-top:0;">Hi ${seller.name},</p>
      <p>You have a new message from <strong>${data.fromName}</strong> via Village Market.</p>
      <blockquote style="border-left:3px solid #E8A020;margin:12px 0;padding:8px 16px;color:#555;">${data.message}</blockquote>
      <p style="margin-bottom:0;">Reply directly to this email to respond.</p>
    `);

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
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
