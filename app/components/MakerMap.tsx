"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Map as LMap, LayerGroup, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Seller } from "@/lib/types";
import { useGeo, haversineKm } from "@/lib/geo-context";

const miles = (km: number) => km * 0.621371;

function emberHtml(isNearest: boolean, isSelected: boolean) {
  const size = isNearest ? 14 : 10;
  const color = isNearest ? "#F26B21" : "#E8A020";
  const glow = isNearest
    ? "0 0 20px 7px rgba(242,107,33,0.6), 0 0 6px 2px rgba(242,107,33,0.9)"
    : "0 0 12px 3px rgba(232,160,32,0.5), 0 0 4px 1px rgba(232,160,32,0.85)";
  const ring = isSelected
    ? `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:9999px;border:1.5px solid rgba(232,160,32,0.75)"></span>`
    : "";
  return `<div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center">
    ${ring}
    <span class="flicker" style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};box-shadow:${glow}"></span>
  </div>`;
}

export default function MakerMap({ sellers }: { sellers: Seller[] }) {
  const { coords } = useGeo();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const outerRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef<Record<string, { marker: Marker; isNearest: boolean }>>({});
  const LRef = useRef<typeof import("leaflet") | null>(null);

  const valid = useMemo(() => sellers.filter((s) => s.lat && s.lng), [sellers]);

  const nearestId = useMemo(() => {
    if (!coords) return null;
    let best: { id: string; d: number } | null = null;
    for (const s of valid) {
      const d = haversineKm(coords.lat, coords.lng, s.lat, s.lng);
      if (!best || d < best.d) best = { id: s.id, d };
    }
    return best?.id ?? null;
  }, [valid, coords]);

  const selected = valid.find((s) => s.id === selectedId) ?? null;
  const selectedDistMi =
    selected && coords ? miles(haversineKm(coords.lat, coords.lng, selected.lat, selected.lng)) : null;

  // Init the Leaflet map once.
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapElRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(mapElRef.current, {
        center: [47.9, -116.8],
        zoom: 9,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false, // don't hijack page scroll
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);

      map.attributionControl.setPrefix(false);
      map.on("click", () => setSelectedId(null));

      layerRef.current = L.layerGroup().addTo(map);
      syncMarkers();
      // absolute-positioned containers can mis-measure on first paint
      setTimeout(() => map.invalidateSize(), 60);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Re)draw markers when the maker set, nearest, or user location changes.
  function syncMarkers() {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    markersRef.current = {};

    if (valid.length === 0) return;

    valid.forEach((s) => {
      const isNearest = s.id === nearestId;
      const icon = L.divIcon({
        html: emberHtml(isNearest, s.id === selectedId),
        className: "",
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
      const marker = L.marker([s.lat, s.lng], { icon }).addTo(layer);
      marker.on("click", () => setSelectedId((cur) => (cur === s.id ? null : s.id)));
      markersRef.current[s.id] = { marker, isNearest };
    });

    const bounds = L.latLngBounds(valid.map((s) => [s.lat, s.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  }

  useEffect(() => {
    syncMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, nearestId]);

  // Update ember icons when selection changes (adds the ring).
  useEffect(() => {
    const L = LRef.current;
    if (!L) return;
    Object.entries(markersRef.current).forEach(([id, { marker, isNearest }]) => {
      marker.setIcon(
        L.divIcon({
          html: emberHtml(isNearest, id === selectedId),
          className: "",
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        })
      );
    });
  }, [selectedId]);

  return (
    <div
      ref={outerRef}
      className="relative w-full h-[70vh] min-h-[440px] max-h-[640px] rounded-2xl overflow-hidden border border-ash/70 bg-ember"
    >
      {/* Real map lives here */}
      <div ref={mapElRef} className="absolute inset-0 z-0" />

      {/* Firelight over the terrain — subtle so the map still reads through */}
      <div className="absolute inset-0 z-[450] pointer-events-none ember-glow opacity-40" />
      <div
        className="absolute inset-0 z-[450] pointer-events-none"
        style={{ boxShadow: "inset 0 0 120px 40px rgba(23,18,14,0.85)" }}
      />

      {/* Hint */}
      {!selected && (
        <div className="absolute top-3 left-3 right-3 z-[500] flex items-center justify-between pointer-events-none">
          <span className="text-[11px] text-linen/70 bg-ember/60 backdrop-blur-sm px-2 py-1 rounded" style={{ fontFamily: "var(--font-mono)" }}>
            Tap a fire to meet the maker
          </span>
          {nearestId && (
            <span className="text-[11px] text-flame bg-ember/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-flame" /> nearest you
            </span>
          )}
        </div>
      )}

      {/* Selected maker — bottom sheet */}
      {selected && (
        <div className="absolute inset-x-3 bottom-3 z-[500]">
          <div className="relative bg-char/95 backdrop-blur-sm border border-ash rounded-xl p-3 pr-10 flex items-center gap-3 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)]">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-ember">
              {selected.cover_photo_url && (
                <Image src={selected.cover_photo_url} alt={selected.name} fill className="object-cover" sizes="64px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-linen text-lg leading-tight truncate">{selected.name}</h3>
              <p className="text-[11px] text-gold flex items-center gap-1.5 mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                {selected.location_label}
                {selectedDistMi != null && <span className="text-linen/50">· {selectedDistMi < 1 ? "under 1" : Math.round(selectedDistMi)} mi away</span>}
              </p>
              <p className="text-xs text-linen/55 leading-snug line-clamp-1">{selected.tagline}</p>
            </div>
            <Link
              href={`/sellers/${selected.slug}`}
              className="shrink-0 bg-gold hover:bg-goldsoft text-ember text-xs font-semibold px-3 py-2 rounded-full transition-colors"
            >
              Visit stall
            </Link>
            <button
              onClick={() => setSelectedId(null)}
              aria-label="Close"
              className="absolute top-2 right-2 text-linen/40 hover:text-linen text-lg leading-none w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
