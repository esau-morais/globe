"use client";

import dynamic from "next/dynamic";

const GlobeClient = dynamic(
  () =>
    import("@/components/globe-client").then((m) => ({
      default: m.GlobeClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: "100%", height: "100vh", background: "#000" }} />
    ),
  },
);

export function GlobeLoader() {
  return <GlobeClient />;
}
