"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get("next") ?? "/dashboard";
    const code = searchParams.get("code");

    async function handleCallback() {
      // PKCE flow — code in query params
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          window.location.href = next;
          return;
        }
      }

      // Implicit flow — tokens in hash fragment (from generateLink recovery/invite)
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.slice(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error) {
            window.location.href = next;
            return;
          }
        }
      }

      window.location.href = "/seller/login?error=auth";
    }

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center">
      <p className="text-bark/50 text-sm">Setting up your account…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <p className="text-bark/50 text-sm">Setting up your account…</p>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
