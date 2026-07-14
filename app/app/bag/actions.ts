"use server";

import { createClient } from "@/lib/supabase/server";
import { subscribeToMailerLite } from "@/lib/mailerlite";
import { Resend } from "resend";
import { EMAIL_FROM } from "@/lib/email";
import { brandedEmail } from "@/lib/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RequestItem {
  title: string;
  price: number;
  priceLabel?: string;
  quantity: number;
}

interface SellerGroup {
  sellerId: string;
  items: RequestItem[];
  paymentMethod: string;
  note: string;
}

export async function submitOrderRequests(
  buyerName: string,
  buyerEmail: string,
  groups: SellerGroup[],
  vcProperty: string | null,
  marketingOptIn: boolean
): Promise<Array<{ sellerId: string; success: boolean; error?: string }>> {
  const supabase = await createClient();
  const results: Array<{ sellerId: string; success: boolean; error?: string }> = [];

  if (marketingOptIn) {
    await subscribeToMailerLite(buyerEmail, {
      name: buyerName,
      role: "buyer",
      is_vacation_guest: vcProperty ? "yes" : "no",
      vc_property: vcProperty ?? "",
    }).catch(() => ({ success: false }));
  }

  for (const group of groups) {
    const { data: seller } = await supabase
      .from("sellers")
      .select("id, name, contact_email")
      .eq("id", group.sellerId)
      .eq("is_active", true)
      .single();

    if (!seller?.contact_email) {
      results.push({ sellerId: group.sellerId, success: false, error: "Seller not found" });
      continue;
    }

    const total = group.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemsHtml = group.items
      .map(
        (i) =>
          `<li>${i.quantity}× ${i.title}${i.priceLabel ? ` (${i.priceLabel})` : ""} — $${(i.price * i.quantity).toLocaleString()}</li>`
      )
      .join("");

    const html = brandedEmail(`
      <p style="margin-top:0;">Hi ${seller.name},</p>
      <p><strong>${buyerName}</strong> would like to purchase the following from your Village Market storefront:</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total: $${total.toLocaleString()}</strong></p>
      ${group.paymentMethod ? `<p><strong>Preferred payment:</strong> ${group.paymentMethod}</p>` : ""}
      ${vcProperty ? `<p><strong>Staying at:</strong> ${vcProperty} (Village Collective guest)</p>` : ""}
      ${group.note ? `<p><strong>Note from ${buyerName}:</strong> ${group.note}</p>` : ""}
      <p style="margin-bottom:0;">Reply directly to this email (${buyerEmail}) to arrange pickup or delivery and finalize payment.</p>
    `);

    try {
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: seller.contact_email,
        replyTo: buyerEmail,
        subject: `Order request from ${buyerName} via Village Market`,
        html,
      });

      if (error) {
        results.push({ sellerId: group.sellerId, success: false, error: "Failed to send email" });
        continue;
      }

      await supabase.from("contact_requests").insert({
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        seller_id: seller.id,
        seller_name: seller.name,
        vc_property: vcProperty,
        marketing_opt_in: marketingOptIn,
      });

      results.push({ sellerId: group.sellerId, success: true });
    } catch {
      results.push({ sellerId: group.sellerId, success: false, error: "Failed to send email" });
    }
  }

  return results;
}
