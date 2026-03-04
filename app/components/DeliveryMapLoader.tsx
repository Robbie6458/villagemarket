"use client";

import dynamic from "next/dynamic";

const DeliveryMap = dynamic(() => import("./DeliveryMap"), { ssr: false });

export default function DeliveryMapLoader(props: {
  lat: number;
  lng: number;
  radiusMiles: number;
  label: string;
}) {
  return <DeliveryMap {...props} />;
}
