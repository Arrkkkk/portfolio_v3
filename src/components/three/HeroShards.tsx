"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { seeded } from "@/lib/utils";

/**
 * COMPONENTS §8 / A02 / A04 — the hero's shattered metal cluster.
 *
 * Faceted dark planes arranged into an ascending monogram-like cluster, rotating
 * slowly, lit by a cool key and a warm ember rim (#E2521F). Pointer moves the
 * camera slightly (parallax); pointer-down blasts the shards outward and they
 * spring back on release — the affordance the reference labels
 * "HOLD TO 💥 BLAST".
 */

type ShardDef = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: [number, number, number];
  dir: THREE.Vector3;
};

/**
 * The cluster is authored, not random: ~2.1 × 1.9 world units (≈ 420 × 380 css
 * at this camera) sitting just below centre, reading as an angular ascending
 * monogram of thick slabs — the silhouette the reference holds in frames 013–029.
 * A handful of small chips orbit it to catch the ember rim light.
 */
const SLABS: Array<{
  pos: [number, number, number];
  rot: [number, number, number];
  scale: [number, number, number];
}> = [
  { pos: [-0.42, 0.16, 0.0], rot: [0, 0, 0.42], scale: [0.2, 2.1, 0.42] },
  { pos: [0.42, 0.16, -0.12], rot: [0, 0, -0.42], scale: [0.2, 2.1, 0.42] },
  { pos: [0.0, -0.42, 0.18], rot: [0, 0, 0], scale: [1.5, 0.22, 0.42] },
  { pos: [-0.16, -1.02, 0.05], rot: [0, 0, 0.2], scale: [1.9, 0.24, 0.46] },
  { pos: [0.62, 0.74, 0.22], rot: [0, 0.5, -0.94], scale: [0.9, 0.18, 0.34] },
  { pos: [-0.72, 0.86, -0.2], rot: [0, -0.4, 0.86], scale: [0.7, 0.16, 0.3] },
  { pos: [0.1, 0.98, -0.35], rot: [0.2, 0.3, 0.1], scale: [0.5, 0.5, 0.2] },
];

function useShards(): ShardDef[] {
  return useMemo(() => {
    const out: ShardDef[] = SLABS.map((s) => ({
      ...s,
      dir: new THREE.Vector3(s.pos[0], s.pos[1], s.pos[2] + 0.001).normalize(),
    }));

    // Loose chips, deterministic so every reload composes identically.
    for (let i = 0; i < 8; i++) {
      const a = seeded(i + 1);
      const b = seeded(i + 31);
      const c = seeded(i + 61);
      const x = (a - 0.5) * 3.4;
      const y = (b - 0.5) * 2.6;
      const z = (c - 0.5) * 1.6;
      out.push({
        pos: [x, y, z],
        rot: [a * Math.PI, b * Math.PI, c * Math.PI],
        scale: [0.06 + a * 0.08, 0.24 + b * 0.5, 0.05 + c * 0.06],
        dir: new THREE.Vector3(x, y, z).normalize(),
      });
    }
    return out;
  }, []);
}

function Cluster({ blast }: { blast: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const shards = useShards();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Continuous slow rotation + pointer parallax.
    g.rotation.y += delta * 0.12;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.y * 0.18, 0.04);
    g.position.x = THREE.MathUtils.lerp(g.position.x, pointer.x * 0.35, 0.04);

    const t = state.clock.elapsedTime;
    const b = blast.current ?? 0;
    shards.forEach((s, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const float = Math.sin(t * 0.5 + i) * 0.04;
      mesh.position.set(
        s.pos[0] + s.dir.x * b * 2.6,
        s.pos[1] + s.dir.y * b * 2.6 + float,
        s.pos[2] + s.dir.z * b * 2.6,
      );
      mesh.rotation.z = s.rot[2] + b * 1.4;
    });
  });

  return (
    <group ref={group} position={[0, -0.27, 0]} scale={0.78}>
      {shards.map((s, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          position={s.pos}
          rotation={s.rot}
          scale={s.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#191919"
            metalness={0.85}
            roughness={0.26}
            envMapIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

/** The thin wire-lines that cross the hero (the "DARE ⚡ TO TOUCH THE LINES" layer). */
function WireLines() {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 7; i++) {
      const y = (seeded(i + 7) - 0.5) * 5;
      pts.push(-8, y, -1.5, 8, y + (seeded(i + 17) - 0.5) * 2.4, -1.5);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#3a3a3a" transparent opacity={0.5} />
    </lineSegments>
  );
}

/**
 * Owns the interaction state inside the canvas: R3F hooks are only available
 * below <Canvas>, and the component that mutates the blast value must be the
 * one that owns it.
 */
function Scene() {
  const blast = useRef(0);
  const target = useRef(0);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const el = gl.domElement;
    const down = () => {
      target.current = 1;
    };
    const up = () => {
      target.current = 0;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [gl]);

  useFrame(() => {
    blast.current = THREE.MathUtils.lerp(blast.current, target.current, 0.08);
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 5, 4]} intensity={2.6} color="#cfd8ff" />
      <directionalLight position={[3, 2, 6]} intensity={1.1} color="#ffffff" />
      <pointLight position={[2.4, -1.6, 2]} intensity={16} distance={9} color="#e2521f" />
      <pointLight position={[-2.2, 1.8, 1.4]} intensity={8} distance={8} color="#2e7bff" />
      <Cluster blast={blast} />
      <WireLines />
    </>
  );
}

export function HeroShards() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}
