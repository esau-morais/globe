import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - ACTIVE_WINDOW_MS;
    const rows = await ctx.db
      .query("visitors")
      .filter((q) => q.gte(q.field("lastSeen"), cutoff))
      .collect();

    const buckets = new Map<
      string,
      { lat: number; lon: number; city: string; country: string; count: number }
    >();

    for (const row of rows) {
      const key = `${Math.round(row.lat * 10) / 10},${Math.round(row.lon * 10) / 10}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        buckets.set(key, {
          lat: row.lat,
          lon: row.lon,
          city: row.city,
          country: row.country,
          count: 1,
        });
      }
    }

    return {
      locations: Array.from(buckets.values()),
      total: rows.length,
    };
  },
});

export const heartbeat = mutation({
  args: {
    ipHash: v.string(),
    lat: v.number(),
    lon: v.number(),
    city: v.string(),
    country: v.string(),
  },
  handler: async (ctx, { ipHash, lat, lon, city, country }) => {
    const existing = await ctx.db
      .query("visitors")
      .withIndex("by_ipHash", (q) => q.eq("ipHash", ipHash))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lat, lon, city, country, lastSeen: Date.now() });
    } else {
      await ctx.db.insert("visitors", { ipHash, lat, lon, city, country, lastSeen: Date.now() });
    }
  },
});
