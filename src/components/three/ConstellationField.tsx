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

/** Ecliptic (longitude/latitude) back to equatorial (RA/Dec), all in degrees. */
function toEquatorial(lon: number, lat: number) {
  const l = lon * DEG;
  const bt = lat * DEG;
  const e = OBLIQUITY * DEG;

  const sinDec = Math.sin(bt) * Math.cos(e) + Math.cos(bt) * Math.sin(e) * Math.sin(l);
  const dec = Math.asin(THREE.MathUtils.clamp(sinDec, -1, 1));
  const y = -Math.sin(bt) * Math.sin(e) + Math.cos(bt) * Math.cos(e) * Math.sin(l);
  const x = Math.cos(bt) * Math.cos(l);

  return { ra: ((Math.atan2(y, x) / DEG) + 360) % 360, dec: dec / DEG };
}

// North galactic pole and the galactic longitude of the north celestial pole, J2000.
const NGP_RA = 192.85948;
const NGP_DEC = 27.12825;
const NCP_L = 122.93192;

/** Equatorial (RA/Dec) to galactic (longitude/latitude), all in degrees. */
function toGalactic(ra: number, dec: number) {
  const a = ra * DEG;
  const d = dec * DEG;
  const pa = NGP_RA * DEG;
  const pd = NGP_DEC * DEG;

  const sinB = Math.sin(d) * Math.sin(pd) + Math.cos(d) * Math.cos(pd) * Math.cos(a - pa);
  const b = Math.asin(THREE.MathUtils.clamp(sinB, -1, 1));
  const y = Math.cos(d) * Math.sin(a - pa);
  const x = Math.sin(d) * Math.cos(pd) - Math.cos(d) * Math.sin(pd) * Math.cos(a - pa);
  const l = NCP_L * DEG - Math.atan2(y, x);

  return { l: (((l / DEG) % 360) + 360) % 360, b: b / DEG };
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

/**
 * `?skyTime=<seconds>` pins the band's drift, independently of `?markTime`
 * which pins the mark's swing. The galactic core is only in view for part of
 * each cycle, so capturing it otherwise means waiting minutes for it to come
 * round. centre = LON_CENTRE + t * DRIFT, so the core (ecliptic longitude ~267°)
 * arrives at t ≈ 568.
 */
function useSkyTime() {
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("skyTime");
    if (raw === null) return null;
    const t = Number(raw);
    return Number.isFinite(t) ? t : null;
  }, []);
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
 * The anonymous sky behind the named stars — and the Milky Way, which is the
 * same thing at higher density rather than a separate layer painted on top.
 *
 * Stars are drawn from a real density model: an exponential thin disk in
 * galactic latitude, a bulge toward the galactic centre, and the Great Rift as
 * dust lanes subtracting light along the plane. Positions are sampled in
 * ecliptic coordinates and accepted against that model, so the band lands where
 * the galaxy actually is. The plane is inclined ~60° to the ecliptic and crosses
 * it near Sagittarius and Gemini, so the core sweeps through as the sign does —
 * it is genuinely part of the zodiac rather than a backdrop.
 *
 * Positions are reprojected each frame, like the constellations, so the field
 * drifts with the band instead of needing its own tiling.
 */

/** Density floor away from the plane — the sky is never empty. */
const HALO = 0.155;
/** How many stars to accept. Candidates are drawn until this many pass. */
// Restores the density of the field this replaced: spreading the same count
// over a full 360° of longitude left the open sky visibly sparser than before.
const FIELD_COUNT = 7400;
/** Ecliptic latitude sampled, slightly beyond what the viewport can show. */
const FIELD_LAT = 26;

const FIELD_TIERS = [
  { size: 0.11, share: 0.06 },
  { size: 0.075, share: 0.23 },
  { size: 0.045, share: 0.71 },
];

/**
 * Unresolved haze. Density alone does not make a Milky Way: at a brightness
 * that stays subordinate to the mark, ~1700 visible stars read as scatter, not
 * as cloud — the real band is mostly light that never resolves into countable
 * points. These are large, very faint sprites that accumulate into the glow,
 * sampled on the luminous disk only so they never spread across the open sky.
 */
const HAZE_COUNT = 5000;
const HAZE_SIZE = 0.85;

/** Violet only where the core is — never a tint across the whole sky. */
const VIOLET_R = 0.72;
const VIOLET_G = 0.55;
const VIOLET_B = 0.95;

/**
 * Relative star density at a galactic position, plus how much of that comes
 * from the bulge — which is what the violet is bound to.
 */
function galacticDensity(l: number, b: number) {
  const absB = Math.abs(b);
  const dl = Math.abs(wrap180(l));

  const disk = Math.exp(-absB / 6.5);
  const bulge = Math.exp(-dl / 26) * Math.exp(-absB / 13);
  const bright = disk * 0.85 + bulge * 0.9;

  // The Great Rift: a dust lane wandering along the plane, heaviest toward the
  // core. It bisects the band, which is what gives the real thing its shape.
  const lr = l * DEG;
  const riftCentre = 1.1 * Math.sin(lr * 1.3 + 0.4) + 0.7 * Math.sin(lr * 2.9 + 1.7);
  const riftWidth = 2.4 + 1.1 * Math.sin(lr * 0.8);
  const t = (b - riftCentre) / riftWidth;
  const dust = Math.exp(-t * t) * (0.5 + 0.35 * Math.exp(-dl / 45));

  return { weight: HALO + bright * (1 - dust), core: bulge };
}

function buildDeepField() {
  let seed = 900;
  const rand = () => seeded(seed++);

  const lonsBy: number[][] = FIELD_TIERS.map(() => []);
  const latsBy: number[][] = FIELD_TIERS.map(() => []);
  const colsBy: number[][] = FIELD_TIERS.map(() => []);
  const zsBy: number[][] = FIELD_TIERS.map(() => []);

  let accepted = 0;
  let guard = 0;
  while (accepted < FIELD_COUNT && guard < FIELD_COUNT * 40) {
    guard++;
    const lon = rand() * 360;
    const lat = (rand() - 0.5) * 2 * FIELD_LAT;
    const { ra, dec } = toEquatorial(lon, lat);
    const { l, b } = toGalactic(ra, dec);
    const { weight, core } = galacticDensity(l, b);
    if (rand() > weight) continue;
    accepted++;

    const pick = rand();
    const tier = pick < FIELD_TIERS[0].share ? 0
      : pick < FIELD_TIERS[0].share + FIELD_TIERS[1].share ? 1
      : 2;

    // Brightness is a property of the star, not of where it sits: density
    // carries the Milky Way, so the same power law applies everywhere.
    const lum = 0.1 + Math.pow(rand(), 2.4) * 0.9;
    const warm = Math.pow(rand(), 3);
    const baseR = 0.66 + warm * 0.34;
    const baseG = 0.73 + warm * 0.19;
    const baseB = 0.92 - warm * 0.16;

    const violet = THREE.MathUtils.clamp(core * 1.3, 0, 1) * 0.32;
    colsBy[tier].push(
      THREE.MathUtils.lerp(baseR, VIOLET_R, violet) * lum,
      THREE.MathUtils.lerp(baseG, VIOLET_G, violet) * lum,
      THREE.MathUtils.lerp(baseB, VIOLET_B, violet) * lum,
    );
    lonsBy[tier].push(lon);
    latsBy[tier].push(lat);
    zsBy[tier].push(-1.6 - rand() * 7.4);
  }

  // Haze, sampled on the disk component alone — the halo floor is resolved
  // stars, not glow, so it must not carry haze into the empty sky.
  const hazeLons: number[] = [];
  const hazeLats: number[] = [];
  const hazeZs: number[] = [];
  const hazeCols: number[] = [];
  let hazeGuard = 0;
  while (hazeLons.length < HAZE_COUNT && hazeGuard < HAZE_COUNT * 60) {
    hazeGuard++;
    const lon = rand() * 360;
    const lat = (rand() - 0.5) * 2 * FIELD_LAT;
    const { ra, dec } = toEquatorial(lon, lat);
    const { l, b } = toGalactic(ra, dec);
    const { weight, core } = galacticDensity(l, b);
    const glow = Math.max(0, weight - HALO) / (1 - HALO);
    if (rand() > glow) continue;

    // Faint enough that only heavy overlap registers: sparse large sprites
    // read as lens smudges, many small ones merge into cloud.
    const lum = 0.017 + core * 0.015;
    const violet = THREE.MathUtils.clamp(core * 1.3, 0, 1) * 0.32;
    hazeCols.push(
      THREE.MathUtils.lerp(0.7, VIOLET_R, violet) * lum,
      THREE.MathUtils.lerp(0.76, VIOLET_G, violet) * lum,
      THREE.MathUtils.lerp(0.92, VIOLET_B, violet) * lum,
    );
    hazeLons.push(lon);
    hazeLats.push(lat);
    hazeZs.push(-4.5 - rand() * 2);
  }

  const tiers = FIELD_TIERS.map((tier, i) => {
    const n = lonsBy[i].length;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colsBy[i]), 3));
    return {
      geometry,
      size: tier.size,
      lons: new Float32Array(lonsBy[i]),
      lats: new Float32Array(latsBy[i]),
      zs: new Float32Array(zsBy[i]),
    };
  });

  const hazeGeom = new THREE.BufferGeometry();
  hazeGeom.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(hazeLons.length * 3), 3),
  );
  hazeGeom.setAttribute("color", new THREE.BufferAttribute(new Float32Array(hazeCols), 3));
  tiers.push({
    geometry: hazeGeom,
    size: HAZE_SIZE,
    lons: new Float32Array(hazeLons),
    lats: new Float32Array(hazeLats),
    zs: new Float32Array(hazeZs),
  });

  return tiers;
}

function DeepField({ texture }: { texture: THREE.Texture }) {
  const tiers = useMemo(() => buildDeepField(), []);
  const v = useMemo(() => new THREE.Vector2(), []);
  const frozen = useSkyTime();

  useEffect(() => () => tiers.forEach((t) => t.geometry.dispose()), [tiers]);

  useFrame((state) => {
    const centre =
      LON_CENTRE + (frozen ?? state.clock.elapsedTime) * DRIFT_DEG_PER_SEC;
    for (const tier of tiers) {
      const arr = tier.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < tier.lons.length; i++) {
        projectInto(v, wrap180(tier.lons[i] - centre), tier.lats[i]);
        const j = i * 3;
        arr[j] = v.x;
        arr[j + 1] = v.y;
        arr[j + 2] = tier.zs[i];
      }
      tier.geometry.attributes.position.needsUpdate = true;
      tier.geometry.computeBoundingSphere();
    }
  });

  return (
    <group>
      {tiers.map((tier, i) => (
        <points key={i} geometry={tier.geometry}>
          <pointsMaterial
            map={texture}
            size={tier.size}
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
  const frozenSky = useSkyTime();
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

    const centre =
      LON_CENTRE + (frozenSky ?? state.clock.elapsedTime) * DRIFT_DEG_PER_SEC;

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
