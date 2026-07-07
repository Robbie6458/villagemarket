import { createClient } from "@supabase/supabase-js";

// Use ONLY in server-side code (Route Handlers, Server Actions)
// Uses the service role key — bypasses RLS entirely
// NEVER expose this client to the browser
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
