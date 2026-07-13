// Single source of truth for the transactional from-address.
// Resend sandbox (onboarding@resend.dev) can ONLY deliver to the Resend
// account owner's email — before real makers can receive anything, verify
// a domain at resend.com/domains and set EMAIL_FROM, e.g.:
//   EMAIL_FROM="Village Market <hello@market.village-collective.com>"
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Village Market <onboarding@resend.dev>";
