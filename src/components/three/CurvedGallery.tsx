"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { explorations } from "@/data/explorations";

/**
 * A12 — the curved screenshot arc (frames 193–243).
 *
 * Tiles sit on a bent plane that sweeps horizontally as the pinned scene is
 * scrubbed. Curvature rises through the sweep so the centre tiles read almost
 * flat and full-size, then falls to zero as the tiles settle into a flat
 * two-row grid at the end of the scene.
 */

const COLS = 5;
const TILE_W = 3.1;
const TILE_H = TILE_W * (488 / 714);
const GAP = 0.32;

function placeholderTexture(tint: string, title: string) {
  const c = document.createElement("canvas");
  c.width = 714;
  c.height = 488;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, c.width / 2, c.height / 2);
  return new THREE.CanvasTexture(c);
}

function Tiles({ progress }: { progress: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  const textures = useMemo(
    () =>
      explorations.map((e) =>
        e.image ? new THREE.TextureLoader().load(e.image) : placeholderTexture(e.tint, e.title),
      ),
    [],
  );

  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame(() => {
    const p = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    // Sweep across the scene, then hold while the tiles flatten.
    const sweep = THREE.MathUtils.clamp(p / 0.78, 0, 1);
    const flatten = THREE.MathUtils.clamp((p - 0.72) / 0.28, 0, 1);
    // Curvature rises then falls (frames 205–222 are the flattest, largest read).
    const bend = Math.sin(sweep * Math.PI) * 0.9 * (1 - flatten);

    const span = explorations.length * (TILE_W + GAP);
    const offset = THREE.MathUtils.lerp(span * 0.55, -span * 0.55, sweep);

    explorations.forEach((_, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;

      // Arc layout
      const ax = i * (TILE_W + GAP) + offset;
      const az = -bend * ax * ax * 0.06;
      const ay = -bend * 0.14 * ax;
      const aRotY = bend * ax * 0.09;

      // Final grid layout (2 rows × COLS)
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const gx = (col - (COLS - 1) / 2) * (TILE_W + GAP);
      const gy = (0.5 - row) * (TILE_H + GAP);

      mesh.position.set(
        THREE.MathUtils.lerp(ax, gx, flatten),
        THREE.MathUtils.lerp(ay, gy, flatten),
        THREE.MathUtils.lerp(az, 0, flatten),
      );
      mesh.rotation.y = THREE.MathUtils.lerp(aRotY, 0, flatten);
      mesh.rotation.z = THREE.MathUtils.lerp(-bend * 0.08, 0, flatten);
    });

    if (group.current) group.current.position.y = THREE.MathUtils.lerp(0, 0, p);
  });

  return (
    <group ref={group}>
      {explorations.map((e, i) => (
        <mesh
          key={e.title}
          ref={(m) => {
            meshes.current[i] = m;
          }}
        >
          <planeGeometry args={[TILE_W, TILE_H]} />
          <meshBasicMaterial map={textures[i]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export function CurvedGallery({ progress }: { progress: React.RefObject<number> }) {
  return (
    <Canvas camera={{ position: [0, 0, 7.6], fov: 42 }} dpr={[1, 1.75]} gl={{ alpha: true }}>
      <Tiles progress={progress} />
    </Canvas>
  );
}
