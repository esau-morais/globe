"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { heartbeat as serverHeartbeat } from "@/app/actions";
import { DotCloud } from "./dot-cloud";
import { Markers } from "./markers";
import { ViewToggle } from "./view-toggle";
import { atmosphereVertexShader } from "@/shaders/atmosphere-vertex";
import { atmosphereFragmentShader } from "@/shaders/atmosphere-fragment";
import type { VisitorLocation, VisitorGeo } from "@/lib/types";

const FLAT_CAM_POS = new THREE.Vector3(0, 0, 6);
const ORIGIN = new THREE.Vector3(0, 0, 0);
const LERP_SPEED = 6;
const FLAT_DIST = 6;
const GLOBE_DIST = 3;
const _dir = new THREE.Vector3();
const BG_COLOR = new THREE.Color("#000000");

const HEARTBEAT_INTERVAL = 30_000;

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
        enablePan={false}
        enableZoom
        minDistance={1.5}
        maxDistance={10}
        enableDamping
        dampingFactor={0.1}
        enableRotate={targetMorph > 0.5}
        autoRotate={autoRotate && targetMorph > 0.5}
        autoRotateSpeed={0.4}
      />
    </>
  );
}

function useVisitors() {
  const data = useQuery(api.visitors.get);
  const [selfGeo, setSelfGeo] = useState<VisitorGeo | null>(null);

  useEffect(() => {
    const send = async () => {
      try {
        const geo = await serverHeartbeat();
        if (geo) setSelfGeo(geo);
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

  return { visitors, total, selfGeo };
}

function OnlineBadge({ count }: { count: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        padding: "6px 14px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#22c55e",
          boxShadow: "0 0 6px #22c55e",
          animation: "pulse-dot 2s ease-in-out infinite",
        }}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.02em",
        }}
      >
        {count} online
      </span>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export function GlobeClient() {
  const [view, setView] = useState<"flat" | "globe">("globe");
  const targetMorph = view === "globe" ? 1 : 0;
  const morphRef = useRef(view === "globe" ? 1 : 0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [ready, setReady] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { visitors, total } = useVisitors();

  const handleReady = useCallback(() => setReady(true), []);

  const handleInteractionStart = useCallback(() => {
    setIsDragging(true);
    setAutoRotate(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
    idleTimer.current = setTimeout(() => setAutoRotate(true), 5000);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <OnlineBadge count={total} />

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
          camera={{
            position: [0, 0, view === "globe" ? 3 : 6],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#000" }}
          onPointerDown={handleInteractionStart}
          onPointerUp={handleInteractionEnd}
          onPointerLeave={handleInteractionEnd}
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
