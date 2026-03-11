import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  visitors: defineTable({
    ipHash: v.string(),
    lat: v.number(),
    lon: v.number(),
    city: v.string(),
    country: v.string(),
    lastSeen: v.number(),
  }).index("by_ipHash", ["ipHash"]),
});
