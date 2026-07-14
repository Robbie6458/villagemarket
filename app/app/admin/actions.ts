"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { EMAIL_FROM } from "@/lib/email";
import { brandedEmail, emailButton } from "@/lib/email-template";
import { sendOnboardingPaidEmail } from "@/lib/onboarding-email";

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

  // Generate the account-setup link. A brand-new email gets an invite; an email
  // that already has an auth user (re-approval, or a repeat applicant) gets a
  // set-password link instead — so approval never fails on "already registered".
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`;
  let userId: string;
  let actionLink: string;

  const invite = await admin.auth.admin.generateLink({
    type: "invite",
    email: app.email,
    options: { redirectTo },
  });

  if (invite.error) {
    if (!/already.*regist/i.test(invite.error.message)) {
      throw new Error(`Failed to generate invite link: ${invite.error.message}`);
    }
    // Email already has an account — find it and send a set-password link.
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
    const existing = list?.users.find(
      (u) => u.email?.toLowerCase() === app.email.toLowerCase()
    );
    if (!existing) throw new Error("Account exists but could not be located to re-send setup.");
    userId = existing.id;

    const recovery = await admin.auth.admin.generateLink({
      type: "recovery",
      email: app.email,
      options: { redirectTo },
    });
    if (recovery.error || !recovery.data.properties) {
      throw new Error(`Failed to generate setup link: ${recovery.error?.message ?? "unknown"}`);
    }
    actionLink = recovery.data.properties.action_link;
  } else {
    userId = invite.data.user.id;
    actionLink = invite.data.properties.action_link;
  }

  // Create a sellers row only if this user doesn't already have one (idempotent).
  const { data: existingSeller } = await admin
    .from("sellers")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!existingSeller) {
    // Dedupe the slug so two makers with the same name don't collide.
    const baseSlug = generateSlug(app.name);
    let slug = baseSlug;
    for (let n = 2; n < 50; n++) {
      const { data: clash } = await admin
        .from("sellers")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash) break;
      slug = `${baseSlug}-${n}`;
    }

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
      auth_user_id: userId,
      verified: true,
      is_active: false,
      approved_at: new Date().toISOString(),
    });
    if (sellerError) throw new Error(`Failed to create seller: ${sellerError.message}`);
  }

  // Update application status
  await admin
    .from("seller_applications")
    .update({ status: "approved" })
    .eq("id", id);

  // Send approval email
  const firstName = app.name.split(" ")[0];
  await resend.emails.send({
    from: EMAIL_FROM,
    to: app.email,
    subject: "You've been approved — welcome to Village Market",
    html: brandedEmail(`
      <p style="margin-top:0;">Hi ${firstName},</p>
      <p>Great news — your application to sell on Village Market has been approved.</p>
      <p>Click the button below to open your seller dashboard, where you can set up your storefront, add products, and go live. No password to create — the link signs you in.</p>
      ${emailButton("Set up your storefront", actionLink)}
      <p>This link expires in 24 hours. To sign in again later, just go to the sign-in page and request a one-time email link — no password needed.</p>
      <p style="margin-bottom:0;">Welcome to the market.<br>— The Village Market team</p>
    `),
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
    from: EMAIL_FROM,
    to: seller.contact_email,
    subject: "Your Village Market seller account",
    html: brandedEmail(`
      <p style="margin-top:0;">Hi ${firstName},</p>
      <p>Here's your link to open your Village Market seller dashboard. No password needed — the link signs you in.</p>
      ${emailButton("Open your dashboard", linkData.properties.action_link)}
      <p style="margin-bottom:0;">This link expires in 24 hours. To sign in again later, request a one-time email link from the sign-in page.</p>
    `),
  });

  if (emailError) throw new Error(`Resend error: ${JSON.stringify(emailError)}`);
  console.log("Resend sent:", emailData);

  revalidatePath("/admin");
}

export async function toggleOnboardingPaid(sellerId: string, paid: boolean) {
  const admin = createAdminClient();

  // Grab the prior state + contact so we can notify on the first transition.
  const { data: before } = await admin
    .from("sellers")
    .select("onboarding_paid, contact_email, name")
    .eq("id", sellerId)
    .single();

  const { error } = await admin
    .from("sellers")
    .update({ onboarding_paid: paid })
    .eq("id", sellerId);
  if (error) throw new Error(error.message);

  // Only email on a genuine false -> true change, never on toggling back off.
  if (paid && before && !before.onboarding_paid && before.contact_email) {
    await sendOnboardingPaidEmail(before.contact_email, before.name).catch((e) =>
      console.error("Onboarding-paid email failed:", e)
    );
  }

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
      from: EMAIL_FROM,
      to: app.email,
      subject: "Your Village Market application",
      html: brandedEmail(`
        <p style="margin-top:0;">Hi ${firstName},</p>
        <p>Thank you for applying to Village Market. After reviewing your application, we're not able to move forward at this time.</p>
        <p>Village Market is a small, curated community — we're selective by design, and this isn't a reflection of the quality of your work.</p>
        <p>You're welcome to apply again in the future.</p>
        <p style="margin-bottom:0;">— The Village Market team</p>
      `),
    });
  }

  revalidatePath("/admin");
}
