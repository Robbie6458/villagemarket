import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const sellerId = session.client_reference_id;

    // sellerId is passed via ?client_reference_id=SELLER_ID on the payment link URL
    if (sellerId) {
      const admin = createAdminClient();
      const { error } = await admin
        .from("sellers")
        .update({ onboarding_paid: true })
        .eq("id", sellerId);

      if (error) {
        console.error("Webhook: failed to mark seller as paid", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      console.log(`Webhook: marked seller ${sellerId} as onboarding_paid`);
    }
  }

  return NextResponse.json({ received: true });
}
