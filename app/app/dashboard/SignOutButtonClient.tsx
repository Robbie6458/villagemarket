"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButtonClient() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/seller/login";
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-bark/40 hover:text-bark transition-colors"
    >
      Sign out
    </button>
  );
}
