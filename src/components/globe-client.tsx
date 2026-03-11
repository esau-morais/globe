"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

import { DotCloud } from "./dot-cloud";
import { Markers } from "./markers";
import { atmosphereVertexShader } from "@/shaders/atmosphere-vertex";
import { atmosphereFragmentShader } from "@/shaders/atmosphere-fragment";
import type { VisitorLocation } from "@/lib/types";
import { FLAT_SCALE } from "@/utils/projections";

const FLAT_CAM_POS = new THREE.Vector3(0, 0, 4);
const ORIGIN = new THREE.Vector3(0, 0, 0);
const LERP_SPEED = 6;
const FLAT_DIST = 4;
const GLOBE_DIST = 3;
const _dir = new THREE.Vector3();
const BG_COLOR = new THREE.Color("#010302");
const PAN_MAX_X = 180 * FLAT_SCALE;
const PAN_MAX_Y = 90 * FLAT_SCALE;


interface SceneProps {
  targetMorph: number;
  morphRef: React.RefObject<number>;
  visitors: VisitorLocation[];
  totalVisitors: number;
  autoRotate: boolean;
  onReady: () => void;
}

function ReadyGate({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) {
      fired.current = true;
      onReady();
    }
  });
  return null;
}

function Scene({
  targetMorph,
  morphRef,
  visitors,
  totalVisitors,
  autoRotate,
  onReady,
}: SceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const occluderRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const current = morphRef.current;
    const newMorph = THREE.MathUtils.lerp(
      current,
      targetMorph,
      1 - Math.exp(-LERP_SPEED * delta),
    );
    const settled = Math.abs(newMorph - targetMorph) < 0.001;
    morphRef.current = settled ? targetMorph : newMorph;

    if (occluderRef.current) {
      occluderRef.current.scale.setScalar(morphRef.current * 0.99);
    }
    if (atmosphereRef.current) {
      const fade = THREE.MathUtils.smoothstep(morphRef.current, 0.9, 1.0);
      atmosphereRef.current.visible = fade > 0;
      atmosphereRef.current.scale.setScalar(fade);
      const mat = atmosphereRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uIntensity!.value = 0.25 * fade;
    }

    if (!settled) {
      const alpha = 1 - Math.exp(-LERP_SPEED * delta);
      const targetDist =
        FLAT_DIST - morphRef.current * (FLAT_DIST - GLOBE_DIST);

      if (targetMorph === 0) {
        camera.position.lerp(FLAT_CAM_POS, alpha);
      } else {
        _dir.copy(camera.position).normalize();
        const newDist = THREE.MathUtils.lerp(
          camera.position.length(),
          targetDist,
          alpha,
        );
        camera.position.copy(_dir.multiplyScalar(newDist));
      }

      camera.lookAt(ORIGIN);
      if (controlsRef.current) {
        controlsRef.current.target.copy(ORIGIN);
        controlsRef.current.update();
      }
    }

    if (targetMorph < 0.5 && controlsRef.current) {
      const t = controlsRef.current.target;
      const cx = THREE.MathUtils.clamp(t.x, -PAN_MAX_X, PAN_MAX_X);
      const cy = THREE.MathUtils.clamp(t.y, -PAN_MAX_Y, PAN_MAX_Y);
      if (t.x !== cx || t.y !== cy) {
        const dx = cx - t.x;
        const dy = cy - t.y;
        t.x = cx;
        t.y = cy;
        camera.position.x += dx;
        camera.position.y += dy;
      }
    }
  });

  return (
    <>
      <ReadyGate onReady={onReady} />
      <mesh ref={occluderRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color={BG_COLOR} />
      </mesh>
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.015, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{
            uColor: { value: new THREE.Color("#6bc5a0") },
            uIntensity: { value: 0.25 },
          }}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <DotCloud morphRef={morphRef} />
      <Markers
        morphRef={morphRef}
        visitors={visitors}
        totalVisitors={totalVisitors}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={targetMorph < 0.5}
        enableZoom
        minDistance={1.5}
        maxDistance={10}
        enableDamping
        dampingFactor={0.1}
        enableRotate={targetMorph > 0.5}
        autoRotate={autoRotate && targetMorph > 0.5}
        autoRotateSpeed={0.4}
        screenSpacePanning
        mouseButtons={{
          LEFT: targetMorph < 0.5 ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />
    </>
  );
}

export interface GlobeClientProps {
  visitors: VisitorLocation[];
  total: number;
  view: "flat" | "globe";
}

export function GlobeClient({ visitors, total, view }: GlobeClientProps) {
  const targetMorph = view === "globe" ? 1 : 0;
  const morphRef = useRef(view === "globe" ? 1 : 0);
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [autoRotate, setAutoRotate] = useState(!prefersReducedMotion);
  const [ready, setReady] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dpr = useMemo<[number, number]>(() => {
    if (typeof window === "undefined") return [2, 2];
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const native = window.devicePixelRatio ?? 1;
    return isMobile ? [2, Math.min(native, 2)] : [2, Math.min(native, 3)];
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  const handleInteractionStart = useCallback(() => {
    setIsDragging(true);
    setAutoRotate(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
    if (!prefersReducedMotion) {
      idleTimer.current = setTimeout(() => setAutoRotate(true), 5000);
    }
  }, [prefersReducedMotion]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#010302",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          cursor: isDragging ? "grabbing" : "grab",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.5s ease-in",
        }}
      >
        <Canvas
          dpr={dpr}
          camera={{
            position: [0, 0, view === "globe" ? 3 : 4],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          gl={{
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true,
          }}
          style={{ background: "#010302" }}
          onPointerDown={handleInteractionStart}
          onPointerUp={handleInteractionEnd}
          onPointerLeave={handleInteractionEnd}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NoToneMapping;
          }}
        >
          <Scene
            targetMorph={targetMorph}
            morphRef={morphRef}
            visitors={visitors}
            totalVisitors={total}
            autoRotate={autoRotate}
            onReady={handleReady}
          />
        </Canvas>
      </div>
    </div>
  );
}
