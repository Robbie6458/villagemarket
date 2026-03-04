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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
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

interface GeoCache {
  status: "local" | "visitor";
  expiry: number;
}

interface GeoContextValue {
  status: GeoStatus;
  isLocal: boolean;
  prompt: () => void;
}

const GeoContext = createContext<GeoContextValue>({
  status: "checking",
  isLocal: false,
  prompt: () => {},
});

export function GeoProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GeoStatus>("checking");

  const resolve = (result: "local" | "visitor") => {
    const cache: GeoCache = { status: result, expiry: Date.now() + TTL_MS };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {}
    setStatus(result);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("visitor");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const km = haversineKm(
          pos.coords.latitude,
          pos.coords.longitude,
          CDA_LAT,
          CDA_LNG
        );
        resolve(km <= RADIUS_KM ? "local" : "visitor");
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
          setStatus(cache.status);
          return;
        }
      }
    } catch {}
    requestLocation();
  }, []);

  return (
    <GeoContext.Provider
      value={{ status, isLocal: status === "local", prompt: requestLocation }}
    >
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  return useContext(GeoContext);
}
