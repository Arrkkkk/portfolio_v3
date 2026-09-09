"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MONOGRAM_CONTOURS } from "./monogramContours";
import { seeded } from "@/lib/utils";

/**
 * The hero's 3D mark: the RA monogram, extruded into a slab and rotating.
 *
 * Geometry comes straight from a sub-pixel trace of the source artwork
 * (see scripts/trace-monogram.py), so the letterforms, the bowl's curve and
 * the interlace breaks are the artwork's own — nothing is redrawn or added.
 * The three contours are the mark's three disjoint pieces and stay coplanar,
 * exactly as they sit in the flat logo.
 *
 * "HOLD TO 💥 BLAST" separates those three pieces along their radial
 * directions; releasing lets them settle back together.
 */

const DEPTH = 0.17;

function useMonogramGeometries() {
  return useMemo(() => {
    return MONOGRAM_CONTOURS.map((contour) => {
      const shape = new THREE.Shape(
        contour.map(([x, y]) => new THREE.Vector2(x, y)),
      );

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3,
      });

      // Centre on Z only — centring X/Y per piece would break the layout.
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      geometry.translate(0, 0, -(box.min.z + box.max.z) / 2);
      geometry.computeVertexNormals();

      // Radial direction used by the blast, from the mark's centre.
      const centre = new THREE.Vector3();
      box.getCenter(centre);
      const dir = new THREE.Vector3(centre.x, centre.y, 0);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      dir.normalize();

      return { geometry, dir };
    });
  }, []);
}

function Monogram({ blast }: { blast: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const pieces = useRef<(THREE.Mesh | null)[]>([]);
  const parts = useMonogramGeometries();
  const { pointer } = useThree();

  useEffect(
    () => () => parts.forEach((p) => p.geometry.dispose()),
    [parts],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Swing rather than spin. A full 360° turn puts the mark edge-on for a
    // large part of every cycle, where an extruded flat logo reads as a blank
    // slab — the identity has to stay legible, so the rotation is bounded.
    const t = state.clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.34) * 0.62 + pointer.x * 0.22;
    g.rotation.x = Math.sin(t * 0.23) * 0.15 + pointer.y * 0.12;
    g.rotation.z = Math.sin(t * 0.17) * 0.045;
    g.position.y = THREE.MathUtils.lerp(g.position.y, Math.sin(t * 0.4) * 0.05, 0.05);
    void delta;

    const b = blast.current ?? 0;
    parts.forEach((part, i) => {
      const mesh = pieces.current[i];
      if (!mesh) return;
      const float = Math.sin(state.clock.elapsedTime * 0.6 + i * 2.1) * 0.012;
      mesh.position.set(
        part.dir.x * b * 0.9,
        part.dir.y * b * 0.9 + float,
        seeded(i + 5) * b * 0.5,
      );
      mesh.rotation.z = b * (seeded(i + 11) - 0.5) * 0.8;
    });
  });

  return (
    <group ref={group} scale={2.45}>
      {parts.map((part, i) => (
        <mesh
          key={i}
          ref={(m) => {
            pieces.current[i] = m;
          }}
          geometry={part.geometry}
          castShadow={false}
        >
          <meshStandardMaterial
            color="#262626"
            metalness={0.82}
            roughness={0.31}
          />
        </mesh>
      ))}
    </group>
  );
}

/** The thin wire-lines the hero's "DARE ⚡ TO TOUCH THE LINES." caption refers to. */
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

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#3a3a3a" transparent opacity={0.5} />
    </lineSegments>
  );
}

/**
 * Owns the blast state: R3F hooks only exist below <Canvas>, and the component
 * that mutates the value has to be the one that owns it.
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
      <directionalLight position={[3, 2, 6]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-2, -1, 5]} intensity={0.55} color="#aab4d0" />
      <pointLight position={[3.1, -2.2, 2.4]} intensity={9} distance={10} color="#e2521f" />
      <pointLight position={[-2.6, 2.1, 1.6]} intensity={7} distance={9} color="#2e7bff" />
      <Monogram blast={blast} />
      <WireLines />
    </>
  );
}

export function HeroMonogram() {
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
