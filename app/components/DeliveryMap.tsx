"use client";

import { useEffect, useRef } from "react";
import type { Map } from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeliveryMapProps {
  lat: number;
  lng: number;
  radiusMiles: number;
  label: string;
}

const MILES_TO_METERS = 1609.344;

export default function DeliveryMap({ lat, lng, radiusMiles, label }: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: Map;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);

      const radiusMeters = radiusMiles * MILES_TO_METERS;

      L.circle([lat, lng], {
        radius: radiusMeters,
        color: "#E8A020",
        fillColor: "#E8A020",
        fillOpacity: 0.14,
        weight: 1.5,
      }).addTo(map);

      const pinIcon = L.divIcon({
        html: `<div style="width:10px;height:10px;border-radius:50%;background:#F26B21;box-shadow:0 0 10px 3px rgba(242,107,33,0.6),0 0 3px 1px rgba(242,107,33,0.9)"></div>`,
        className: "",
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      L.marker([lat, lng], { icon: pinIcon })
        .addTo(map)
        .bindTooltip(label, { permanent: false, className: "leaflet-tooltip-village" });

      map.fitBounds(
        L.circle([lat, lng], { radius: radiusMeters }).getBounds(),
        { padding: [12, 12] }
      );
    }

    initMap();

    return () => {
      if (map) map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="h-40 w-full" />;
}
