"use client";

import { useGeo } from "@/lib/geo-context";

interface ContactButtonProps {
  sellerName: string;
  contactEmail?: string;
}

export default function ContactButton({ sellerName, contactEmail }: ContactButtonProps) {
  const { isLocal, status } = useGeo();

  if (status === "checking") return null;

  if (!isLocal) {
    return (
      <div className="group relative">
        <button
          disabled
          className="bg-bark/10 text-bark/40 text-sm font-medium px-5 py-2.5 rounded-full cursor-not-allowed"
        >
          Message Maker
        </button>
        <div className="absolute bottom-full right-0 mb-2 bg-bark text-white text-xs rounded-lg px-3 py-2 w-52 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Visit North Idaho to unlock the ability to message local makers.
        </div>
      </div>
    );
  }

  const href = contactEmail
    ? `mailto:${contactEmail}?subject=Village Market inquiry — ${sellerName}`
    : `mailto:?subject=Village Market inquiry — ${sellerName}`;

  return (
    <a
      href={href}
      className="block bg-bark hover:bg-moss text-cream text-sm font-medium px-5 py-2.5 rounded-full transition-colors text-center"
    >
      Message Maker
    </a>
  );
}
