"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Preloaded } from "convex/react";
import type { api } from "../../convex/_generated/api";
import type { GlobeClientProps } from "@/components/globe-client";
import { OnlineBadge, useVisitors } from "@/components/online-badge";
import { ViewToggle } from "@/components/view-toggle";

const GlobeClient = dynamic<GlobeClientProps>(
  () =>
    import("@/components/globe-client").then((m) => ({
      default: m.GlobeClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: "100%", height: "100vh", background: "#010302" }} />
    ),
  },
);

interface GlobeLoaderProps {
  preloadedVisitors: Preloaded<typeof api.visitors.get>;
}

export function GlobeLoader({ preloadedVisitors }: GlobeLoaderProps) {
  const { visitors, total } = useVisitors(preloadedVisitors);
  const [view, setView] = useState<"flat" | "globe">("globe");

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <OnlineBadge preloadedVisitors={preloadedVisitors} />
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <ViewToggle view={view} onToggle={setView} />
      </div>
      <GlobeClient visitors={visitors} total={total} view={view} />
    </div>
  );
}
