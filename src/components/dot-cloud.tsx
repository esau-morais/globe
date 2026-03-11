"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { generateLandDots, type DotData } from "@/utils/generateDots";
import { flatPosition, spherePosition } from "@/utils/projections";
import { dotVertexShader } from "@/shaders/dot-vertex";
import { dotFragmentShader } from "@/shaders/dot-fragment";

interface DotCloudProps {
  morphRef: React.MutableRefObject<number>;
  dotDensity?: number;
}

function buildGeometry(data: DotData) {
  const { latLons, count } = data;
  const flatPositions = new Float32Array(count * 3);
  const spherePositions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const lat = latLons[i * 2]!;
    const lon = latLons[i * 2 + 1]!;

    const [fx, fy, fz] = flatPosition(lat, lon);
    flatPositions[i * 3] = fx;
    flatPositions[i * 3 + 1] = fy;
    flatPositions[i * 3 + 2] = fz;

    const [sx, sy, sz] = spherePosition(lat, lon);
    spherePositions[i * 3] = sx;
    spherePositions[i * 3 + 1] = sy;
    spherePositions[i * 3 + 2] = sz;
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
  return geo;
}

export function DotCloud({ morphRef, dotDensity = 0.3 }: DotCloudProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateLandDots(dotDensity).then((data) => {
      if (!cancelled) setGeometry(buildGeometry(data));
    });
    return () => {
      cancelled = true;
    };
  }, [dotDensity]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  const [uniforms] = useState(() => ({
    uMorph: { value: 0 },
    uColor: { value: new THREE.Color("#6bc5a0") },
    uPointSize: { value: 3.0 },
    uMaxDist: { value: 10.0 },
    uDpr: { value: 1.0 },
  }));

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMorph!.value = morphRef.current;
      materialRef.current.uniforms.uDpr!.value = gl.getPixelRatio();
    }
  });

  if (!geometry) return null;

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={dotVertexShader}
        fragmentShader={dotFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
