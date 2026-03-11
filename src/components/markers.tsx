"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flatPosition, spherePosition } from "@/utils/projections";
import { markerVertexShader } from "@/shaders/marker-vertex";
import { markerFragmentShader } from "@/shaders/marker-fragment";
import type { VisitorLocation } from "@/lib/types";

interface MarkersProps {
  morphRef: React.MutableRefObject<number>;
  visitors: VisitorLocation[];
  totalVisitors: number;
}

export function Markers({ morphRef, visitors, totalVisitors }: MarkersProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    if (visitors.length === 0) return null;

    const count = visitors.length;
    const flatPositions = new Float32Array(count * 3);
    const spherePositions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const v = visitors[i]!;
      const [fx, fy, fz] = flatPosition(v.lat, v.lon);
      flatPositions[i * 3] = fx;
      flatPositions[i * 3 + 1] = fy;
      flatPositions[i * 3 + 2] = fz;

      const [sx, sy, sz] = spherePosition(v.lat, v.lon, 1.01);
      spherePositions[i * 3] = sx;
      spherePositions[i * 3 + 1] = sy;
      spherePositions[i * 3 + 2] = sz;

      const ratio = totalVisitors > 0 ? v.count / totalVisitors : 0.5;
      sizes[i] = 4.0 + ratio * 20.0;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "aFlatPosition",
      new THREE.BufferAttribute(flatPositions, 3),
    );
    geo.setAttribute(
      "aSpherePosition",
      new THREE.BufferAttribute(spherePositions, 3),
    );
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(flatPositions.slice(), 3),
    );
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [visitors, totalVisitors]);

  const [uniforms] = useState(() => ({
    uMorph: { value: 0 },
    uColor: { value: new THREE.Color("#6bc5a0") },
    uSelfColor: { value: new THREE.Color("#a3e4c9") },
    uMaxDist: { value: 15.0 },
    uTime: { value: 0 },
  }));

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMorph!.value = morphRef.current;
      materialRef.current.uniforms.uTime!.value = state.clock.elapsedTime;
    }
  });

  if (!geometry) return null;

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={markerVertexShader}
        fragmentShader={markerFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
