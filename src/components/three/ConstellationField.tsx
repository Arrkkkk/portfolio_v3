"use client";

/* eslint-disable react-hooks/immutability --
 * The frame loop writes straight into geometry attribute buffers and a scratch
 * array, which React Compiler flags because they originate in a memo. That is a
 * false positive for this idiom: driving react-three-fiber means mutating
 * buffers in place every frame, and re-allocating them to satisfy the rule
 * would push ~9KB to the GPU sixty times a second for no benefit. Everything
 * mutated here is created once in buildField and owned by nothing else.
 */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FEATURED_SIGN, ZODIAC } from "./zodiacData";
import { seeded } from "@/lib/utils";

/**
 * The hero's sky: the twelve zodiac constellations on a true ecliptic band,
 * drifting at a sidereal pace so every sign comes round in turn.
 *
 * Aries — the owner's sign — is always drawn. The other eleven are anonymous
 * scatter until the cursor comes near, at which point their stars brighten and
 * their asterism draws in. The reveal radius is deliberately generous: hero
 * backgrounds do not get deliberately explored, so this has to be found by
 * accident, as a soft ripple following the cursor, rather than by hunting.
 *
 * Everything here is subordinate to the monogram:
 *
 *   1. Visual mass, not peak brightness. Stars may out-peak the mark — in a
 *      real sky they are the brightest points in frame, and that is what makes
 *      them read as stars. What keeps the sky subordinate is how little of the
 *      frame it lights. An earlier version capped peak brightness below the
 *      mark's and was invisible on a dimmed laptop.
 *   2. A clear zone. Stars fade out near the mark, so it always sits in empty
 *      sky. Because the band drifts, this is recomputed every frame.
 *   3. Cool greys only. The ember stays the mark's alone.
 *   4. Richness comes from density, not level.
 *
 * None of this touches the mark's lighting: the Lightformer environment is a
 * separate cube render, so a visible star layer is invisible to its reflections.
 */

/** Obliquity of the ecliptic, J2000, in degrees. */
const OBLIQUITY = 23.4393;
const DEG = Math.PI / 180;

/** Equatorial (RA/Dec) to ecliptic (longitude/latitude), all in degrees. */
function toEcliptic(ra: number, dec: number) {
  const a = ra * DEG;
  const d = dec * DEG;
  const e = OBLIQUITY * DEG;

  const sinLat = Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a);
  const lat = Math.asin(THREE.MathUtils.clamp(sinLat, -1, 1));
  const y = Math.sin(d) * Math.sin(e) + Math.cos(d) * Math.cos(e) * Math.sin(a);
  const x = Math.cos(d) * Math.cos(a);
  const lon = Math.atan2(y, x);

  return { lon: ((lon / DEG) + 360) % 360, lat: lat / DEG };
}

// --- Placement -------------------------------------------------------------
// A cylindrical projection: ecliptic longitude along the band, latitude across
// it, the whole thing tilted so it reads as a diagonal rather than a horizon.

/** Longitude at the band's anchor at t=0 — Aries sits near 40°. */
const LON_CENTRE = 40;
/** World units per degree of ecliptic angle. */
const SCALE = 0.18;
/** Band tilt, degrees. */
const TILT = -9;
/** Where the anchor lands, in world units on the star plane. */
const ANCHOR = new THREE.Vector2(3.97, 0.49);
/** All zodiac stars sit on one plane behind the mark. */
const PLANE_Z = -4;

/**
 * Sidereal drift. A full turn of the zodiac takes 15 minutes, so every sign
 * comes round, Aries returns to its composed position each cycle, and the
 * motion stays slow enough (~9px/s) to read as drift rather than animation.
 */
const DRIFT_DEG_PER_SEC = 360 / 900;

/** Camera Z, mirrored from the Canvas — used for the screen-space clear zone. */
const CAMERA_Z = 6.2;
const CLEAR_INNER = 0.3;
const CLEAR_OUTER = 0.46;

/** Reveal falloff, in world units on the star plane (~120px per unit). */
const REVEAL_NEAR = 1.0;
const REVEAL_FAR = 5.0;
/** Aries never drops below this, being the owner's own sign. */
const FEATURED_FLOOR = 0.34;

const tiltCos = Math.cos(TILT * DEG);
const tiltSin = Math.sin(TILT * DEG);

/** Asterism line colour, as fractions. */
const LINE_R = 0.624;
const LINE_G = 0.69;
const LINE_B = 0.831;

/** Star colour, linear-ish fractions of a cool white. */
const STAR_R = 0.725;
const STAR_G = 0.776;
const STAR_B = 0.894;

/** Wrap an angle in degrees into ±180. */
const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

function projectInto(out: THREE.Vector2, dLon: number, lat: number) {
  const x = dLon * SCALE;
  const y = lat * SCALE;
  out.set(
    x * tiltCos - y * tiltSin + ANCHOR.x,
    x * tiltSin + y * tiltCos + ANCHOR.y,
  );
  return out;
}

/** 0 where the mark is, 1 well clear of it, compared in tan-space. */
function clearZone(x: number, y: number) {
  const screenR = Math.hypot(x, y) / (CAMERA_Z - PLANE_Z);
  return THREE.MathUtils.smoothstep(screenR, CLEAR_INNER, CLEAR_OUTER);
}

/**
 * The headline block, in normalised device coordinates. Some signs are simply
 * huge — Pisces spans ~38° of longitude — so a correctly drawn asterism can
 * still sweep a line straight through "Designed to feel effortless.". The mark
 * has a radial clear zone; the type needs a rectangular one.
 */
const TEXT_RECT = { x0: -1.05, x1: -0.6, y0: 0.2, y1: 0.86 };
const TEXT_FEATHER = 0.16;

/** 1 in open sky, falling to 0 over the headline. */
function textMask(ndcX: number, ndcY: number) {
  const dx = Math.max(TEXT_RECT.x0 - ndcX, ndcX - TEXT_RECT.x1);
  const dy = Math.max(TEXT_RECT.y0 - ndcY, ndcY - TEXT_RECT.y1);
  const outside = Math.max(dx, dy);
  return THREE.MathUtils.smoothstep(outside, 0, TEXT_FEATHER);
}

/** Brightness from apparent magnitude — brighter stars carry more light. */
const lumFor = (mag: number) => THREE.MathUtils.clamp(1.15 - 0.19 * mag, 0.22, 1);

/** Soft round sprite, shared by every layer. */
function useStarTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.3, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);
}

/** Size tiers by magnitude — PointsMaterial applies one size per draw call. */
const TIERS = [
  { max: 2.5, size: 0.17 },
  { max: 3.5, size: 0.115 },
  { max: Infinity, size: 0.075 },
];

// --- Deep field ------------------------------------------------------------

/**
 * The anonymous dusting a real sky has behind its named stars. Density is what
 * makes this read as sky; each star is individually very faint, so the visual
 * mass stays low because each lights almost nothing, not because there are few.
 *
 * Generated in band coordinates and tiled along the band, so the same drift
 * that carries the zodiac carries the background with it and wraps seamlessly.
 */
const FIELD_PERIOD = 30;
const FIELD_TIERS = [
  { count: 700, size: 0.045 },
  { count: 230, size: 0.075 },
  { count: 60, size: 0.11 },
];

function DeepField({ texture }: { texture: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);

  const tiers = useMemo(() => {
    let seed = 900;
    return FIELD_TIERS.map(({ count }) => {
      // two tiles, so translating by up to one period always leaves cover
      const total = count * 2;
      const pos = new Float32Array(total * 3);
      const col = new Float32Array(total * 3);
      for (let i = 0; i < count; i++) {
        const bandX = seeded(seed++) * FIELD_PERIOD;
        const bandY = (seeded(seed++) - 0.5) * 15;
        const z = -1.6 - seeded(seed++) * 7.4;
        const b = 0.1 + Math.pow(seeded(seed++), 2.4) * 0.9;
        const warm = Math.pow(seeded(seed++), 3);
        const r = b * (0.66 + warm * 0.34);
        const g = b * (0.73 + warm * 0.19);
        const bl = b * (0.92 - warm * 0.16);

        for (const tile of [0, 1]) {
          const j = (i + tile * count) * 3;
          const bx = bandX + tile * FIELD_PERIOD;
          pos[j] = bx * tiltCos - bandY * tiltSin;
          pos[j + 1] = bx * tiltSin + bandY * tiltCos;
          pos[j + 2] = z;
          col[j] = r;
          col[j + 1] = g;
          col[j + 2] = bl;
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(col, 3));
      return geometry;
    });
  }, []);

  useEffect(() => () => tiers.forEach((g) => g.dispose()), [tiers]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const along = state.clock.elapsedTime * DRIFT_DEG_PER_SEC * SCALE;
    const wrapped = -(along % FIELD_PERIOD) - FIELD_PERIOD * 0.5;
    g.position.set(wrapped * tiltCos, wrapped * tiltSin, 0);
  });

  return (
    <group ref={group}>
      {tiers.map((geometry, i) => (
        <points key={i} geometry={geometry}>
          <pointsMaterial
            map={texture}
            size={FIELD_TIERS[i].size}
            sizeAttenuation
            vertexColors
            transparent
            depthWrite={false}
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  );
}

// --- Constellations --------------------------------------------------------

type PlacedStar = {
  sign: number;
  lat: number;
  /** Longitude offset from its sign's reference star, wrapped once at build.
   *  Signs are placed as rigid figures: Pisces straddles 0°/360°, so wrapping
   *  each star independently tore it in half across the sky. */
  offset: number;
  lum: number;
  tier: number;
  /** Index within its tier's buffer. */
  slot: number;
  /** Index into the flat `stars` array — precomputed so the frame loop never
   *  has to search for a star it already has a handle on. */
  index: number;
};

/** Places every zodiac star once and allocates the buffers the frame loop writes. */
function buildField() {
  const stars: PlacedStar[] = [];
  const counts = TIERS.map(() => 0);
  // Each sign is anchored to its first star; every other member is placed as a
  // fixed offset from it, so the figure stays rigid wherever the drift puts it.
  const refLons: number[] = [];

  ZODIAC.forEach((sign, s) => {
    for (const star of sign.stars) {
      const { lon, lat } = toEcliptic(star.ra, star.dec);
      refLons[s] ??= lon;
      const tier = TIERS.findIndex((t) => star.mag < t.max);
      stars.push({
        sign: s,
        lat,
        offset: wrap180(lon - refLons[s]),
        lum: lumFor(star.mag),
        tier,
        slot: counts[tier]++,
        index: stars.length,
      });
    }
  });

  const tierGeoms = counts.map((n) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  });

  // One line geometry per sign; vertices are rewritten each frame as the
  // band drifts, which is cheaper and simpler than tiling the geometry.
  const lineGeoms = ZODIAC.map((sign) => {
    const g = new THREE.BufferGeometry();
    const n = sign.lines.length * 2;
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    // vertex colours, so a line can fade along its length where it crosses the
    // headline rather than being all-or-nothing
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  });

  // flat indices grouped by sign, for the per-sign endpoint lookups
  const bySign = ZODIAC.map(() => [] as number[]);
  for (const st of stars) bySign[st.sign].push(st.index);

  const featured = ZODIAC.findIndex((s) => s.key === FEATURED_SIGN);
  return { stars, tierGeoms, lineGeoms, bySign, featured, refLons };
}

export function ConstellationField() {
  const texture = useStarTexture();
  const { pointer } = useThree();

  const labelGroup = useRef<THREE.Group>(null);
  const labelEl = useRef<HTMLDivElement>(null);

  const built = useMemo(() => buildField(), []);
  const scratch = useMemo(
    () => ({
      v: new THREE.Vector2(),
      xs: new Float32Array(built.stars.length),
      ys: new Float32Array(built.stars.length),
      hover: new Float32Array(ZODIAC.length),
      base: new Float32Array(ZODIAC.length),
    }),
    [built],
  );

  useEffect(() => {
    const { tierGeoms, lineGeoms } = built;
    return () => {
      tierGeoms.forEach((g) => g.dispose());
      lineGeoms.forEach((g) => g.dispose());
    };
  }, [built]);

  useEffect(() => () => texture.dispose(), [texture]);


  useFrame((state) => {
    const { stars, tierGeoms, lineGeoms, bySign, featured, refLons } = built;
    const { v, xs, ys, hover, base } = scratch;

    const centre = LON_CENTRE + state.clock.elapsedTime * DRIFT_DEG_PER_SEC;

    // 1. place each sign as a rigid figure, then its stars relative to it
    for (let s = 0; s < refLons.length; s++) base[s] = wrap180(refLons[s] - centre);
    for (let i = 0; i < stars.length; i++) {
      projectInto(v, base[stars[i].sign] + stars[i].offset, stars[i].lat);
      xs[i] = v.x;
      ys[i] = v.y;
    }

    // 2. cursor position on the star plane, and each sign's reveal strength.
    //    Distance is to the sign's *nearest* star rather than its centroid —
    //    for a long figure like Scorpius the centroid sits in empty sky.
    const halfH = (CAMERA_Z - PLANE_Z) * Math.tan((42 / 2) * DEG);
    const halfW = halfH * (state.size.width / state.size.height);
    const px = pointer.x * halfW;
    const py = pointer.y * halfH;

    /** Combined content mask: clear of the mark, and clear of the headline. */
    const visible = (x: number, y: number) =>
      clearZone(x, y) * textMask(x / halfW, y / halfH);

    hover.fill(0);
    for (let i = 0; i < stars.length; i++) {
      const d = Math.hypot(px - xs[i], py - ys[i]);
      const near = 1 - THREE.MathUtils.smoothstep(d, REVEAL_NEAR, REVEAL_FAR);
      if (near > hover[stars[i].sign]) hover[stars[i].sign] = near;
    }
    hover[featured] = Math.max(hover[featured], FEATURED_FLOOR);

    // 3. write star positions and colours
    for (let i = 0; i < stars.length; i++) {
      const st = stars[i];
      const geom = tierGeoms[st.tier];
      const p = geom.attributes.position as THREE.BufferAttribute;
      const c = geom.attributes.color as THREE.BufferAttribute;
      const j = st.slot * 3;
      p.array[j] = xs[i];
      p.array[j + 1] = ys[i];
      p.array[j + 2] = PLANE_Z;

      const lit = st.lum * (0.55 + hover[st.sign] * 1.15) * visible(xs[i], ys[i]);
      c.array[j] = STAR_R * lit;
      c.array[j + 1] = STAR_G * lit;
      c.array[j + 2] = STAR_B * lit;
    }
    for (const g of tierGeoms) {
      g.attributes.position.needsUpdate = true;
      g.attributes.color.needsUpdate = true;
      g.computeBoundingSphere();
    }

    // 4. asterism lines
    ZODIAC.forEach((sign, s) => {
      const geom = lineGeoms[s];
      const arr = geom.attributes.position.array as Float32Array;
      const col = geom.attributes.color.array as Float32Array;
      const mine = bySign[s];
      const strength = hover[s];
      sign.lines.forEach(([a, b], k) => {
        const ia = mine[a];
        const ib = mine[b];
        const o = k * 6;
        arr[o] = xs[ia];
        arr[o + 1] = ys[ia];
        arr[o + 2] = PLANE_Z;
        arr[o + 3] = xs[ib];
        arr[o + 4] = ys[ib];
        arr[o + 5] = PLANE_Z;
        // Per-endpoint fade, so a line crossing the headline dims along its
        // length instead of the whole figure vanishing.
        const la = strength * visible(xs[ia], ys[ia]) * 0.5;
        const lb = strength * visible(xs[ib], ys[ib]) * 0.5;
        col[o] = LINE_R * la;
        col[o + 1] = LINE_G * la;
        col[o + 2] = LINE_B * la;
        col[o + 3] = LINE_R * lb;
        col[o + 4] = LINE_G * lb;
        col[o + 5] = LINE_B * lb;
      });
      geom.attributes.position.needsUpdate = true;
      geom.attributes.color.needsUpdate = true;
      geom.computeBoundingSphere();

    });

    // 5. name the strongest sign only — several glow at once under a generous
    //    radius, and labelling all of them would be clutter.
    let best = -1;
    for (let s = 0; s < ZODIAC.length; s++) {
      if (hover[s] > 0.42 && (best === -1 || hover[s] > hover[best])) best = s;
    }
    const el = labelEl.current;
    const lg = labelGroup.current;
    if (el && lg) {
      if (best === -1) {
        el.style.opacity = "0";
      } else {
        const mine = bySign[best];
        let cx = 0;
        let cy = 0;
        for (const i of mine) {
          cx += xs[i];
          cy += ys[i];
        }
        lg.position.set(cx / mine.length, cy / mine.length - 0.55, PLANE_Z);
        el.textContent = ZODIAC[best].label;
        el.style.opacity = String(
          THREE.MathUtils.smoothstep(hover[best], 0.42, 0.7) * 0.75,
        );
      }
    }
  });

  return (
    <group>
      <DeepField texture={texture} />

      {built.tierGeoms.map((geometry, i) => (
        <points key={i} geometry={geometry}>
          <pointsMaterial
            map={texture}
            size={TIERS[i].size}
            sizeAttenuation
            vertexColors
            transparent
            depthWrite={false}
            opacity={0.95}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}

      {built.lineGeoms.map((geometry, i) => (
        <lineSegments key={i} geometry={geometry}>
          <lineBasicMaterial
            vertexColors
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      ))}

      <group ref={labelGroup}>
        <Html center pointerEvents="none" zIndexRange={[5, 0]}>
          <div
            ref={labelEl}
            className="label-mono whitespace-nowrap text-[#b9c6e4] opacity-0 transition-opacity duration-300"
          >
            {""}
          </div>
        </Html>
      </group>
    </group>
  );
}
