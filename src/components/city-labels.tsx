"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { flatPosition, spherePosition } from "@/utils/projections";
import type { VisitorLocation } from "@/lib/types";

interface CityLabelsProps {
  morphRef: React.MutableRefObject<number>;
  visitors: VisitorLocation[];
  morph: number;
}

function CityLabel({
  visitor,
  morph,
}: {
  visitor: VisitorLocation;
  morph: number;
}) {
  const position = useMemo(() => {
    const [fx, fy, fz] = flatPosition(visitor.lat, visitor.lon);
    const [sx, sy, sz] = spherePosition(visitor.lat, visitor.lon, 1.04);
    return new THREE.Vector3(
      THREE.MathUtils.lerp(fx, sx, morph),
      THREE.MathUtils.lerp(fy, sy, morph),
      THREE.MathUtils.lerp(fz, sz, morph),
    );
  }, [visitor.lat, visitor.lon, morph]);

  return (
    <Html
      position={position}
      center
      style={{ pointerEvents: "none" }}
      zIndexRange={[10, 0]}
      occlude={false}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          color: "#fff",
          padding: "3px 8px",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 500,
          whiteSpace: "nowrap",
          transform: "translateY(-20px)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          letterSpacing: "0.01em",
        }}
      >
        {visitor.city}
      </div>
    </Html>
  );
}

export function CityLabels({ visitors, morph }: CityLabelsProps) {
  const topVisitors = useMemo(() => visitors.slice(0, 8), [visitors]);

  return (
    <>
      {topVisitors.map((v) => (
        <CityLabel key={`${v.city}-${v.country}`} visitor={v} morph={morph} />
      ))}
    </>
  );
}
