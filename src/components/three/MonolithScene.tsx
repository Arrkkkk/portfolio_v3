"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSmokeTexture, createStoneTextures } from "./stoneTexture";
import { seeded, SERVICES_P1_P4_SCALE } from "@/lib/utils";

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
  const textures = useMemo(() => createStoneTextures(), []);

  /*
   * A subdivided box (not the bare 1-segment default), carved by a
   * handful of discrete craters rather than flat per-vertex jitter — gives
   * the silhouette a broken, chipped edge instead of a clean machined
   * square, closer to how the real scanned material's own
   * chipped/cracked/uneven edges (see stoneTexture.ts) read.
   *
   * Craters pull each affected vertex toward the crater's OWN centre in
   * full 3D, not along the vertex's own face normal — that distinction
   * matters a lot here. A face-normal-only displacement (tried first,
   * twice) can only ever push a front-facing vertex toward/away from the
   * camera, never sideways: the camera-facing outline is defined by the
   * front face's own edge column, and under a near-face-on view that
   * column's X/Y never moves no matter how deep the carve, so the
   * silhouette stayed a near-perfect rectangle regardless of amplitude.
   * Only the thin, nearly edge-on side faces could move in X/Y, so their
   * carving barely registered on screen. Pulling toward the crater centre
   * instead moves every affected vertex — front face included — in
   * whichever direction actually shrinks it toward that chip, which is
   * what makes a bite visible in the outline itself, not just in shading.
   *
   * `CHIPS` is a small deterministic list (seeded — identical on every
   * load, like the scatter/smoke placement elsewhere) of crater centres
   * scattered across the box's volume; most end up near enough to an edge
   * or corner to bite into it. At each vertex only the deepest crater in
   * reach wins (summing overlaps would stack into unrealistic pits), and
   * a small fine-grain term rides on top for surface texture.
   * 20×20 face segments (up from 10×10) give the crater boundaries enough
   * resolution to have real shape instead of blurring into a gradient.
   */
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(2.9, 3.0, 0.6, 20, 20, 5);
    const pos = geo.attributes.position;
    const normal = geo.attributes.normal;

    const CHIPS = Array.from({ length: 22 }, (_, i) => {
      // Depth as a fraction of this chip's own radius (not independently
      // random) — a deep narrow pull folds the surface into a sharp cone
      // at the chip centre instead of reading as a dent. Capping the
      // depth:radius ratio around 0.1-0.28 keeps every chip a shallow
      // bowl, however big or small it is.
      const radius = 0.3 + seeded(i * 7.1 + 4) * 0.55;
      return {
        x: (seeded(i * 7.1 + 1) - 0.5) * 3.2,
        y: (seeded(i * 7.1 + 2) - 0.5) * 3.4,
        z: (seeded(i * 7.1 + 3) - 0.5) * 0.9,
        radius,
        depth: radius * (0.1 + seeded(i * 7.1 + 5) * 0.18),
      };
    });

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      let bestPull = 0;
      let bestDir: [number, number, number] = [0, 0, 0];
      for (const c of CHIPS) {
        const dx = x - c.x;
        const dy = y - c.y;
        const dz = z - c.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d >= c.radius || d < 1e-5) continue;
        const t = 1 - d / c.radius;
        const pull = c.depth * t * t;
        if (pull > bestPull) {
          bestPull = pull;
          bestDir = [dx / d, dy / d, dz / d];
        }
      }

      const fine = seeded(x * 280 + y * 340 + z * 410) - 0.5;
      const nx = x - bestDir[0] * bestPull + normal.getX(i) * fine * 0.025;
      const ny = y - bestDir[1] * bestPull + normal.getY(i) * fine * 0.025;
      const nz = z - bestDir[2] * bestPull + normal.getZ(i) * fine * 0.025;
      pos.setXYZ(i, nx, ny, nz);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(
    () => () => {
      textures.map.dispose();
      textures.normalMap.dispose();
      textures.roughnessMap.dispose();
      textures.bumpMap.dispose();
      geometry.dispose();
    },
    [textures, geometry],
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
    <mesh ref={mesh} geometry={geometry}>
      <meshStandardMaterial
        map={textures.map}
        normalMap={textures.normalMap}
        normalScale={new THREE.Vector2(1.1, 1.1)}
        roughnessMap={textures.roughnessMap}
        roughness={0.92}
        bumpMap={textures.bumpMap}
        bumpScale={0.07}
        metalness={0.02}
        // Neutral mid-grey (R=G=B) — the real scan's own desaturated
        // diffuse (stoneTexture.ts) already removed the warm cast, this
        // just sets the overall tone per the owner's reference images.
        color={new THREE.Color(0x6e6e6e)}
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
