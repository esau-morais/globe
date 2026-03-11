"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { heartbeat as serverHeartbeat } from "@/app/actions";
import type { VisitorLocation } from "@/lib/types";

const HEARTBEAT_INTERVAL = 30_000;

export interface OnlineBadgeProps {
  preloadedVisitors: Preloaded<typeof api.visitors.get>;
}

export function useVisitors(preloadedVisitors: Preloaded<typeof api.visitors.get>) {
  const data = usePreloadedQuery(preloadedVisitors);

  useEffect(() => {
    const send = async () => {
      try {
        await serverHeartbeat();
      } catch {
        // offline
      }
    };
    send();
    const interval = setInterval(send, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const visitors = (data?.locations ?? []) as VisitorLocation[];
  const total = data?.total ?? 0;

  return { visitors, total };
}

export function OnlineBadge({ preloadedVisitors }: OnlineBadgeProps) {
  const data = usePreloadedQuery(preloadedVisitors);
  const count = data?.total ?? 0;

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/6 backdrop-blur-md px-4 py-2 border border-white/8">
      <span className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse [animation-duration:2s] motion-reduce:animate-none" />
      <span className="text-[13px] font-medium text-white/70 tracking-wide">
        <span className="tabular-nums">{count}</span> online
      </span>
    </div>
  );
}
