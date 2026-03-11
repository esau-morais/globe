"use server";

import { headers } from "next/headers";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

const DEV_FALLBACK_API = "http://ip-api.com/json/?fields=lat,lon,city,country";

function hash(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return "v" + Math.abs(h).toString(36);
}

interface GeoResult {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

export async function heartbeat(): Promise<GeoResult | null> {
  const hdrs = await headers();

  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const ipHash = hash(ip);

  let geo: GeoResult | null = null;

  const lat = hdrs.get("x-vercel-ip-latitude");
  const lon = hdrs.get("x-vercel-ip-longitude");
  const city = hdrs.get("x-vercel-ip-city");
  const country = hdrs.get("x-vercel-ip-country");

  if (lat && lon) {
    geo = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      city: city ? decodeURIComponent(city) : "Unknown",
      country: country ?? "Unknown",
    };
  }

  if (!geo) {
    try {
      const res = await fetch(DEV_FALLBACK_API, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as GeoResult;
        geo = {
          lat: data.lat,
          lon: data.lon,
          city: data.city ?? "Unknown",
          country: data.country ?? "Unknown",
        };
      }
    } catch {
      // fallback unavailable
    }
  }

  if (!geo) return null;

  await fetchMutation(api.visitors.heartbeat, {
    ipHash,
    lat: geo.lat,
    lon: geo.lon,
    city: geo.city,
    country: geo.country,
  });

  return geo;
}
