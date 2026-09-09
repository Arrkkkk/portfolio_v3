"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FEATURED_SIGN, ZODIAC } from "./zodiacData";

/**
 * The hero's sky: the twelve zodiac constellations strung along a true
 * ecliptic band, with Aries — the owner's sign — as the one asterism whose
 * lines are actually drawn.
 *
 * Everything here is subordinate to the monogram. Three rules keep it that
 * way, and they are the reason this reads as depth rather than decoration:
 *
 *   1. Visual mass, not peak brightness. Stars are allowed to out-peak the
 *      mark — in a real sky they are the brightest points in frame, and that
 *      is what makes them read as stars. What keeps the sky subordinate is how
 *      little of the frame it lights: a sparse scatter of points against a
 *      large, continuously modelled object. An earlier version capped peak
 *      brightness below the mark's and was invisible on a dimmed laptop.
 *   2. A clear zone. Stars fade out within a screen-space radius of the mark,
 *      so it always sits in empty sky and never picks up a busy halo.
 *   3. Cool greys only. The ember stays the mark's alone.
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
// The band is a cylindrical projection of the sky: ecliptic longitude runs
// along it, latitude across it. Longitude is centred on Aries and the whole
// band is tilted, which puts the featured sign in the composition's dead space
// (upper right) and keeps the band off the headline.

/** Ecliptic longitude placed at the band's anchor point. Aries sits near 40°. */
const LON_CENTRE = 40;
/** World units per degree of ecliptic angle. */
const SCALE = 0.18;
/** Band tilt, degrees — echoes the diagonal hairlines this replaced. */
const TILT = -9;
/**
 * Where the anchor lands, in world units on the star plane. Tuned so Aries
 * clears the top edge and sits in the dead space right of the headline and
 * above the mark, rather than being clipped by the viewport.
 */
const ANCHOR = new THREE.Vector2(3.97, 0.49);
/** All stars sit on one plane behind the mark. */
const PLANE_Z = -4;

/** Camera Z, mirrored from the Canvas — used for the screen-space clear zone. */
const CAMERA_Z = 6.2;
/** Screen radius (tan-space) the mark occupies, plus margin. */
const CLEAR_INNER = 0.3;
const CLEAR_OUTER = 0.46;

const tiltCos = Math.cos(TILT * DEG);
const tiltSin = Math.sin(TILT * DEG);

function project(lon: number, lat: number) {
  // wrap longitude into ±180 of the centre so signs either side of Aries
  // land left and right of it rather than a full turn away
  let dLon = lon - LON_CENTRE;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;

  const x = dLon * SCALE;
  const y = lat * SCALE;
  return new THREE.Vector2(
    x * tiltCos - y * tiltSin + ANCHOR.x,
    x * tiltSin + y * tiltCos + ANCHOR.y,
  );
}

/**
 * 0 where the mark is, 1 well clear of it. Compared in tan-space — the ratio of
 * world offset to distance-from-camera — so the plane's depth is accounted for
 * rather than assuming the sky sits at the mark's Z.
 */
function clearZone(p: THREE.Vector2) {
  const screenR = p.length() / (CAMERA_Z - PLANE_Z);
  return THREE.MathUtils.smoothstep(screenR, CLEAR_INNER, CLEAR_OUTER);
}

/** Soft round sprite — one texture shared by every magnitude bin. */
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

/**
 * Magnitude bins. PointsMaterial applies one size to the whole draw call and
 * ignores a per-vertex size attribute, so brightness classes are separate
 * Points objects rather than one buffer.
 */
const BINS = [
  { max: 2.5, size: 0.17, opacity: 0.62 },
  { max: 3.5, size: 0.115, opacity: 0.48 },
  { max: Infinity, size: 0.075, opacity: 0.34 },
];

export function ConstellationField() {
  const texture = useStarTexture();
  const group = useRef<THREE.Group>(null);
  const ariesLines = useRef<THREE.LineSegments>(null);
  const { pointer } = useThree();

  const { bins, featuredBins, aries, ariesCentre, eclipticLine } = useMemo(() => {
    const binned: THREE.BufferGeometry[] = BINS.map(() => new THREE.BufferGeometry());
    const buckets: number[][] = BINS.map(() => []);
    const featuredBinned: THREE.BufferGeometry[] = BINS.map(
      () => new THREE.BufferGeometry(),
    );
    const featuredBuckets: number[][] = BINS.map(() => []);

    for (const sign of ZODIAC) {
      // The featured sign is boosted, but still binned by magnitude: rendering
      // its stars at one uniform brightness made 41 Arietis (mag 3.63) as
      // bright as Hamal (mag 2.0), which is backwards. Hamal should lead it.
      const featured = sign.key === FEATURED_SIGN;
      for (const star of sign.stars) {
        const { lon, lat } = toEcliptic(star.ra, star.dec);
        const p = project(lon, lat);
        // Stars inside the clear zone are dropped outright rather than dimmed:
        // a faint smudge behind the mark is worse than nothing there.
        if (clearZone(p) < 0.12) continue;
        const bin = BINS.findIndex((b) => star.mag < b.max);
        (featured ? featuredBuckets : buckets)[bin].push(p.x, p.y, PLANE_Z);
      }
    }

    buckets.forEach((pts, i) => {
      binned[i].setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    });
    featuredBuckets.forEach((pts, i) => {
      featuredBinned[i].setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    });

    // Featured asterism.
    const sign = ZODIAC.find((s) => s.key === FEATURED_SIGN)!;
    const projected = sign.stars.map((s) => {
      const { lon, lat } = toEcliptic(s.ra, s.dec);
      return project(lon, lat);
    });
    const segments: number[] = [];
    for (const [a, b] of sign.lines ?? []) {
      segments.push(projected[a].x, projected[a].y, PLANE_Z);
      segments.push(projected[b].x, projected[b].y, PLANE_Z);
    }
    const ariesGeom = new THREE.BufferGeometry();
    ariesGeom.setAttribute("position", new THREE.Float32BufferAttribute(segments, 3));


    const centre = projected
      .reduce((acc, p) => acc.add(p), new THREE.Vector2())
      .divideScalar(projected.length);

    // The ecliptic itself: latitude zero, running the length of the band.
    const ecliptic = new THREE.BufferGeometry();
    const a = project(LON_CENTRE - 150, 0);
    const b = project(LON_CENTRE + 150, 0);
    ecliptic.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([a.x, a.y, PLANE_Z, b.x, b.y, PLANE_Z], 3),
    );

    return {
      bins: binned,
      featuredBins: featuredBinned,
      aries: ariesGeom,
      ariesCentre: centre,
      eclipticLine: ecliptic,
    };
  }, []);

  useEffect(() => {
    return () => {
      texture.dispose();
      bins.forEach((g) => g.dispose());
      featuredBins.forEach((g) => g.dispose());
      aries.dispose();
      eclipticLine.dispose();
    };
  }, [texture, bins, featuredBins, aries, eclipticLine]);

  useFrame(() => {
    // "DARE ⚡ TO TOUCH THE LINES." — the asterism answers the cursor.
    const line = ariesLines.current;
    if (line) {
      const half = (CAMERA_Z - PLANE_Z) * Math.tan((42 / 2) * DEG);
      const px = pointer.x * half * (1710 / 951);
      const py = pointer.y * half;
      const d = Math.hypot(px - ariesCentre.x, py - ariesCentre.y);
      const near = 1 - THREE.MathUtils.smoothstep(d, 1.2, 4);
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.32 + near * 0.3, 0.08);
    }

    // A shallow counter-drift against the pointer separates the sky from the
    // mark without ever moving far enough to unseat the composition.
    const g = group.current;
    if (g) {
      g.position.x = THREE.MathUtils.lerp(g.position.x, -pointer.x * 0.12, 0.03);
      g.position.y = THREE.MathUtils.lerp(g.position.y, -pointer.y * 0.08, 0.03);
    }
  });

  return (
    <group ref={group}>
      {bins.map((geometry, i) => (
        <points key={i} geometry={geometry}>
          <pointsMaterial
            map={texture}
            size={BINS[i].size}
            sizeAttenuation
            transparent
            depthWrite={false}
            opacity={BINS[i].opacity}
            color="#93a3c8"
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}

      <lineSegments geometry={eclipticLine}>
        <lineBasicMaterial color="#6f7c9c" transparent opacity={0.26} />
      </lineSegments>

      <lineSegments ref={ariesLines} geometry={aries}>
        <lineBasicMaterial color="#9fb0d4" transparent opacity={0.32} />
      </lineSegments>

      {/*
        The featured sign, boosted but still magnitude-ordered. Multipliers are
        measured rather than guessed: at a flat 0.52 opacity the brightest Aries
        star peaked at luminance 92 against the mark's 63, making a background
        star the brightest thing in the hero.
      */}
      {featuredBins.map((geometry, i) => (
        <points key={`f${i}`} geometry={geometry}>
          <pointsMaterial
            map={texture}
            size={BINS[i].size * 1.35}
            sizeAttenuation
            transparent
            depthWrite={false}
            opacity={BINS[i].opacity * 0.9}
            color="#b9c6e4"
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  );
}
