"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { MONOGRAM_CONTOURS } from "./monogramContours";
import { ConstellationField } from "./ConstellationField";
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
        bevelThickness: 0.022,
        bevelSize: 0.012,
        bevelOffset: 0,
        bevelSegments: 2,
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

/**
 * `?markTime=4.62` pins the mark's animation clock to a fixed value and drops
 * the pointer term, so a screenshot always reproduces the same orientation.
 * The swing peaks at t = 4.62s — the angle where the mark is hardest to read —
 * which is the case worth regression-testing.
 */
function useFrozenTime() {
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("markTime");
    if (raw === null) return null;
    const t = Number(raw);
    return Number.isFinite(t) ? t : null;
  }, []);
}

function Monogram({ blast }: { blast: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const pieces = useRef<(THREE.Mesh | null)[]>([]);
  const parts = useMonogramGeometries();
  const { pointer } = useThree();
  const frozen = useFrozenTime();

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
    const t = frozen ?? state.clock.elapsedTime;
    const px = frozen === null ? pointer.x : 0;
    const py = frozen === null ? pointer.y : 0;
    g.rotation.y = Math.sin(t * 0.34) * 0.62 + px * 0.22;
    g.rotation.x = Math.sin(t * 0.23) * 0.15 + py * 0.12;
    g.rotation.z = Math.sin(t * 0.17) * 0.045;
    g.position.y = Math.sin(t * 0.4) * 0.05;
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
            color="#2a2a2a"
            metalness={0.9}
            roughness={0.23}
            envMapIntensity={1.15}
          />
        </mesh>
      ))}
    </group>
  );
}



/**
 * Bokeh motes at mixed depths. They give the empty black volume some spatial
 * read and, being self-lit, they keep the frame from going fully dead at any
 * angle. Positions are seeded so every render composes identically.
 */
function Motes() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  const geometry = useMemo(() => {
    const count = 46;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seeded(i + 101) - 0.5) * 11;
      pos[i * 3 + 1] = (seeded(i + 201) - 0.5) * 7;
      // kept behind the mark: near the camera, size attenuation blows them up
      // into lens-smudge blurs over the headline.
      pos[i * 3 + 2] = -0.8 - seeded(i + 301) * 4.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const points = useRef<THREE.Points>(null);

  useEffect(() => {
    return () => {
      texture.dispose();
      geometry.dispose();
    };
  }, [texture, geometry]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.012;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        map={texture}
        size={0.09}
        sizeAttenuation
        transparent
        depthWrite={false}
        // The deep field is the faintest layer by definition. At 0.55 it was
        // out-shining the catalogued zodiac stars in front of it, and was the
        // brightest thing in the hero after the mark's own highlights.
        opacity={0.32}
        color="#c2ccdf"
        blending={THREE.AdditiveBlending}
      />
    </points>
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
      {/*
        The mark is near-mirror metal, which has almost no diffuse response —
        its colour is reflected environment. Lamps aimed at it only produce
        specular hits where a face happens to align, which is why it went black
        at the extremes of the swing. These emissive panels surround it instead,
        so some panel is always reflecting toward camera and the faces carry a
        gradient at every angle. Built procedurally rather than from an HDRI
        preset: no network fetch, no megabytes, one cube render.
      */}
      <Environment resolution={256} frames={1} environmentIntensity={1}>
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#dfe6ff"
          position={[-5, 6, 5]}
          scale={[10, 10]}
          target={[0, 0, 0]}
        />
        {/* Long thin strips rake across the faces and hold the chamfer lines. */}
        <Lightformer
          form="rect"
          intensity={5}
          color="#ffffff"
          position={[7, 0.5, 3]}
          scale={[0.7, 12]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3.4}
          color="#e8eeff"
          position={[-7, 1, 2]}
          scale={[0.45, 10]}
          target={[0, 0, 0]}
        />
        {/* Ember and cool accents, as reflections rather than point falloff. */}
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#e2521f"
          position={[5, -5, 3]}
          scale={[8, 5]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.3}
          color="#2e7bff"
          position={[-6, 5, 1]}
          scale={[7, 5]}
          target={[0, 0, 0]}
        />
        {/*
          Camera-side softbox. Face-on, the front faces mirror whatever sits
          behind the camera — with nothing there they render black, which is the
          same failure as the extremes, just at the opposite end of the swing.
        */}
        <Lightformer
          form="rect"
          intensity={1.15}
          color="#c9d3ee"
          position={[1.5, 2.5, 9]}
          scale={[14, 12]}
          target={[0, 0, 0]}
        />
        {/* Dim backdrop so rear-facing chamfers still separate from the page. */}
        <Lightformer
          form="rect"
          intensity={0.5}
          color="#242833"
          position={[0, 0, -9]}
          scale={[16, 16]}
          target={[0, 0, 0]}
        />
      </Environment>

      <ambientLight intensity={0.12} />
      <directionalLight position={[-4, 5, 4]} intensity={0.9} color="#cfd8ff" />
      <pointLight position={[3.1, -2.2, 2.4]} intensity={4} distance={10} color="#e2521f" />
      <Monogram blast={blast} />
      <ConstellationField />
      <Motes />
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
