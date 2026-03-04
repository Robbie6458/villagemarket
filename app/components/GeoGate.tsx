"use client";

import { useGeo } from "@/lib/geo-context";
import { ReactNode } from "react";

interface GeoGateProps {
  children: ReactNode;
  tooltip?: string;
}

export default function GeoGate({
  children,
  tooltip = "Visit North Idaho to unlock full access and connect with local makers.",
}: GeoGateProps) {
  const { isLocal, status } = useGeo();

  if (status === "checking") return null;
  if (isLocal) return <>{children}</>;

  return (
    <div className="relative group inline-block w-full">
      <div className="opacity-50 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-bark/90 text-white text-xs rounded-lg px-3 py-2 max-w-xs text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {tooltip}
        </div>
      </div>
    </div>
  );
}

export function GeoBanner() {
  const { status, isLocal, prompt } = useGeo();

  if (status === "checking" || isLocal) return null;

  return (
    <div className="bg-wheat border-b border-clay/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-bark text-center sm:text-left">
          <span className="font-medium">You&apos;re browsing from outside the area.</span>{" "}
          Visit North Idaho to unlock the ability to connect with local makers.
        </p>
        <button
          onClick={prompt}
          className="shrink-0 text-xs font-medium text-moss border border-moss px-3 py-1.5 rounded-full hover:bg-moss hover:text-white transition-colors"
        >
          Re-check location
        </button>
      </div>
    </div>
  );
}
