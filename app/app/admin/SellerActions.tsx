"use client";

import { useState } from "react";
import { resendSellerInvite } from "./actions";

export default function SellerActions({ sellerId }: { sellerId: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend() {
    setSending(true);
    try {
      await resendSellerInvite(sellerId);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (sent) return <span className="text-xs text-flamelo">Sent!</span>;

  return (
    <button
      onClick={handleResend}
      disabled={sending}
      className="text-xs text-bark/40 hover:text-bark disabled:opacity-50 transition-colors"
    >
      {sending ? "Sending…" : "Resend invite"}
    </button>
  );
}
