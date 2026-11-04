"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSmokeTexture, createStoneTextures } from "./stoneTexture";
import { seeded, SERVICES_P1_P4_SCALE } from "@/lib/utils";
import { site } from "@/data/site";

/**
 * A10 P2–P5 — the stone monolith in volumetric smoke.
 *
 * `progress` is the pinned scene's scrubbed 0…1 value: the boulder drops in and
 * tumbles through the first third, settles square-on by ~0.45, then holds while
 * the service labels cycle. Smoke fades up with the background darkening.
 *
 * The 0.45 above is in ServicesScene's ORIGINAL 0.5-of-400svh P1–P4 scale.
 * ServicesScene's own section has since grown (to give the P5 label cards
 * room to be scroll-scrubbed instead of snapping through in a few px), and
 * P1–P4 now occupies a smaller fraction of that taller whole — same
 * absolute scroll distance, different fraction. `progress` is that same
 * fraction-of-the-whole number, so this threshold has to shrink by the
 * same SERVICES_P1_P4_SCALE factor ServicesScene applies to its own P1–P4
 * keyframes, or the settle would still be reaching for 0.45 long after P5
 * has already started.
 */
function Monolith({ progress }: { progress: React.RefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const textures = useMemo(() => createStoneTextures(512, site.monogram), []);

  useEffect(
    () => () => {
      textures.map.dispose();
      textures.bumpMap.dispose();
    },
    [textures],
  );

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const p = progress.current ?? 0;
    // P2 drop → P3 tumble → P4 settle
    const settle = THREE.MathUtils.clamp(
      (p - 0.12 * SERVICES_P1_P4_SCALE) / (0.33 * SERVICES_P1_P4_SCALE),
      0,
      1,
    );
    const eased = 1 - Math.pow(1 - settle, 3);

    m.position.y = THREE.MathUtils.lerp(4.6, 0, eased);
    m.rotation.z = THREE.MathUtils.lerp(-1.15, 0, eased);
    m.rotation.x = THREE.MathUtils.lerp(0.6, 0, eased);
    m.rotation.y =
      THREE.MathUtils.lerp(1.4, 0, eased) +
      Math.sin(state.clock.elapsedTime * 0.18) * 0.03 * eased;
    const s = THREE.MathUtils.lerp(0.35, 1, eased);
    m.scale.setScalar(s);
    (m.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.clamp(p * 6, 0, 1);
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[2.9, 3.0, 0.6]} />
      <meshStandardMaterial
        map={textures.map}
        bumpMap={textures.bumpMap}
        bumpScale={0.9}
        roughness={0.95}
        metalness={0.02}
        transparent
      />
    </mesh>
  );
}

function Smoke({ progress }: { progress: React.RefObject<number> }) {
  const texture = useMemo(() => createSmokeTexture(), []);
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        pos: [
          (seeded(i + 3) - 0.5) * 12,
          (seeded(i + 23) - 0.5) * 7,
          -5.5 + seeded(i + 43) * 3.2,
        ] as [number, number, number],
        scale: 4 + seeded(i + 63) * 6,
        spin: (seeded(i + 83) - 0.5) * 0.06,
      })),
    [],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      child.rotation.z += puffs[i].spin * delta;
    });
    const p = progress.current ?? 0;
    g.visible = p > 0.04;
    g.position.x = Math.sin(state.clock.elapsedTime * 0.04) * 0.6;
  });

  return (
    <group ref={group}>
      {puffs.map((puff, i) => (
        <mesh key={i} position={puff.pos} scale={puff.scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            opacity={0.5}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

export function MonolithScene({ progress }: { progress: React.RefObject<number> }) {
  return (
    <Canvas camera={{ position: [0, 0, 6.4], fov: 42 }} dpr={[1, 1.75]} gl={{ alpha: true }}>
      <ambientLight intensity={0.28} />
      <directionalLight position={[-5, 6, 5]} intensity={1.5} color="#e8ecff" />
      <directionalLight position={[4, -2, 3]} intensity={0.5} color="#b9a695" />
      <Smoke progress={progress} />
      <Monolith progress={progress} />
    </Canvas>
  );
}
