"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function approveApplication(id: string) {
  const admin = createAdminClient();

  const { data: app, error: fetchError } = await admin
    .from("seller_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !app) throw new Error("Application not found");

  // Create auth user + generate invite link in one step
  // The invite link redirects to /auth/callback which sets the session and sends to /dashboard
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "invite",
      email: app.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
      },
    });

  if (linkError) throw new Error(`Failed to generate invite link: ${linkError.message}`);

  const authData = { user: linkData.user };

  // Create a sellers row — inactive until they complete their storefront
  const slug = generateSlug(app.name);
  const { error: sellerError } = await admin.from("sellers").insert({
    name: app.name,
    slug,
    tagline: "",
    bio: "",
    location_label: app.location,
    lat: 47.6777, // CDA center — seller updates via dashboard
    lng: -116.7805,
    categories: app.categories,
    accepted_payments: app.payment_methods,
    delivery_available: app.delivery_available,
    delivery_radius_miles: app.delivery_radius_miles,
    contact_email: app.email,
    auth_user_id: authData.user.id,
    verified: true,
    is_active: false,
    approved_at: new Date().toISOString(),
  });

  if (sellerError) throw new Error(`Failed to create seller: ${sellerError.message}`);

  // Update application status
  await admin
    .from("seller_applications")
    .update({ status: "approved" })
    .eq("id", id);

  // Send approval email
  const firstName = app.name.split(" ")[0];
  await resend.emails.send({
    from: "Village Market <onboarding@resend.dev>",
    to: app.email,
    subject: "You've been approved — welcome to Village Market",
    html: `
      <p>Hi ${firstName},</p>
      <p>Great news — your application to sell on Village Market has been approved.</p>
      <p>Click the link below to set your password and access your seller dashboard, where you can set up your storefront, add products, and go live.</p>
      <p><a href="${linkData.properties.action_link}">Set up your account →</a></p>
      <p>This link expires in 24 hours. If you need a new one, just reply to this email.</p>
      <p>Welcome to the market.</p>
      <p>— The Village Market team</p>
    `,
  });

  revalidatePath("/admin");
}

export async function resendSellerInvite(sellerId: string) {
  const admin = createAdminClient();

  const { data: seller } = await admin
    .from("sellers")
    .select("name, contact_email")
    .eq("id", sellerId)
    .single();

  if (!seller?.contact_email) throw new Error("No email found for seller");

  // Use recovery (password reset) for existing users, invite for new ones
  let linkData, linkError;
  ({ data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "recovery",
      email: seller.contact_email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
      },
    }));

  if (linkError || !linkData.properties) throw new Error(linkError?.message ?? "No link generated");

  // Log for local dev — copy this into your browser to test the flow
  console.log("\n✅ Seller invite link:", linkData.properties.action_link, "\n");

  const firstName = seller.name.split(" ")[0];
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: "Village Market <onboarding@resend.dev>",
    to: seller.contact_email,
    subject: "Your Village Market seller account",
    html: `
      <p>Hi ${firstName},</p>
      <p>Here's your link to set up your Village Market seller account and access your dashboard.</p>
      <p><a href="${linkData.properties.action_link}">Set up your account →</a></p>
      <p>This link expires in 24 hours.</p>
      <p>— The Village Market team</p>
    `,
  });

  if (emailError) throw new Error(`Resend error: ${JSON.stringify(emailError)}`);
  console.log("Resend sent:", emailData);

  revalidatePath("/admin");
}

export async function toggleOnboardingPaid(sellerId: string, paid: boolean) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("sellers")
    .update({ onboarding_paid: paid })
    .eq("id", sellerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleSellerFeatured(sellerId: string, featured: boolean) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("sellers")
    .update({ featured })
    .eq("id", sellerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleFoundingMaker(sellerId: string, value: boolean) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("sellers")
    .update({ founding_maker: value })
    .eq("id", sellerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleMonthlySupporter(sellerId: string, value: boolean) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("sellers")
    .update({ monthly_supporter: value })
    .eq("id", sellerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function rejectApplication(id: string) {
  const admin = createAdminClient();

  const { data: app } = await admin
    .from("seller_applications")
    .select("name, email")
    .eq("id", id)
    .single();

  await admin
    .from("seller_applications")
    .update({ status: "rejected" })
    .eq("id", id);

  if (app) {
    const firstName = app.name.split(" ")[0];
    await resend.emails.send({
      from: "Village Market <onboarding@resend.dev>",
      to: app.email,
      subject: "Your Village Market application",
      html: `
        <p>Hi ${firstName},</p>
        <p>Thank you for applying to Village Market. After reviewing your application, we're not able to move forward at this time.</p>
        <p>Village Market is a small, curated community — we're selective by design, and this isn't a reflection of the quality of your work.</p>
        <p>You're welcome to apply again in the future.</p>
        <p>— The Village Market team</p>
      `,
    });
  }

  revalidatePath("/admin");
}
