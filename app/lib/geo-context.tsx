"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { GeoStatus } from "./types";

// CDA center coordinates
const CDA_LAT = 47.6777;
const CDA_LNG = -116.7805;
const RADIUS_KM = 80;
const CACHE_KEY = "vm_geo";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface Coords {
  lat: number;
  lng: number;
}

interface GeoCache {
  status: "local" | "visitor";
  coords?: Coords;
  expiry: number;
}

interface GeoContextValue {
  status: GeoStatus;
  isLocal: boolean;
  coords: Coords | null;
  prompt: () => void;
}

const GeoContext = createContext<GeoContextValue>({
  status: "checking",
  isLocal: false,
  coords: null,
  prompt: () => {},
});

export function GeoProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GeoStatus>("checking");
  const [coords, setCoords] = useState<Coords | null>(null);

  const resolve = (result: "local" | "visitor", pos?: Coords) => {
    const cache: GeoCache = { status: result, coords: pos, expiry: Date.now() + TTL_MS };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {}
    if (pos) setCoords(pos);
    setStatus(result);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("visitor");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const km = haversineKm(here.lat, here.lng, CDA_LAT, CDA_LNG);
        resolve(km <= RADIUS_KM ? "local" : "visitor", here);
      },
      () => resolve("visitor"),
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cache: GeoCache = JSON.parse(raw);
        if (cache.expiry > Date.now()) {
          if (cache.coords) setCoords(cache.coords);
          setStatus(cache.status);
          return;
        }
      }
    } catch {}
    requestLocation();
  }, []);

  return (
    <GeoContext.Provider
      value={{ status, isLocal: status === "local", coords, prompt: requestLocation }}
    >
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  return useContext(GeoContext);
}
