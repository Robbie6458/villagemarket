import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { EMAIL_FROM } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Find contact requests from 48–96 hours ago that haven't had a tip email yet
  const now = new Date();
  const cutoffOld = new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(); // 96h ago
  const cutoffNew = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(); // 48h ago

  const { data: contacts, error } = await admin
    .from("contact_requests")
    .select("*")
    .gt("created_at", cutoffOld)
    .lt("created_at", cutoffNew)
    .is("tip_email_sent_at", null);

  if (error) {
    console.error("Cron: failed to fetch contacts", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!contacts?.length) {
    return NextResponse.json({ sent: 0, message: "No pending tip emails" });
  }

  const tipLink = process.env.NEXT_PUBLIC_STRIPE_TIP_LINK;
  let sent = 0;

  for (const contact of contacts) {
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: contact.buyer_email,
        subject: `Did it work out with ${contact.seller_name}?`,
        html: `
          <p>Hi ${contact.buyer_name},</p>
          <p>You reached out to <strong>${contact.seller_name}</strong> on Village Market a couple days ago.</p>
          <p>If your conversation led somewhere — a sale, a trade, a new local connection — we'd love to know. And if you'd like to tip the Village for the introduction, it goes directly to keeping this marketplace free, local, and ad-free.</p>
          ${tipLink ? `<p><a href="${tipLink}" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:99px;text-decoration:none;font-size:14px;display:inline-block;">Tip the Village ♡</a></p>` : ""}
          <p>Either way, we hope you found what you were looking for.</p>
          <p>— Village Market<br><span style="color:#999;font-size:12px;">Coeur d'Alene, North Idaho</span></p>
          <p style="margin-top:24px;color:#aaa;font-size:11px;">You're receiving this because you sent a message through Village Market. We won't email you again about this.</p>
        `,
      });

      await admin
        .from("contact_requests")
        .update({ tip_email_sent_at: new Date().toISOString() })
        .eq("id", contact.id);

      sent++;
    } catch (e) {
      console.error(`Cron: failed to send tip email to ${contact.buyer_email}`, e);
    }
  }

  return NextResponse.json({ sent, total: contacts.length });
}
