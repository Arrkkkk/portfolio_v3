import * as THREE from "three";

/*
 * The monolith's surface used to be generated from fbm (fractal Brownian
 * motion) value noise — smooth and continuous by construction, which is
 * exactly why it couldn't read as rock up close: real rock grain has hard,
 * high-frequency, non-repeating detail (individual facets, specular glints,
 * a genuine fracture) that no amount of octaves of a smooth noise function
 * produces. Compared side by side against a real scanned material in
 * demo/ (kept in the repo — see demo/README.md for the full writeup), the
 * scanned one was unambiguously the one that looked like a rock.
 *
 * This is a deliberate, explicit exception to "original geometry and
 * procedural textures — no reference assets" for the monolith (see
 * CLAUDE.md) — the owner's call, not a procedural tweak.
 *
 * Source: Poly Haven "Rock Boulder Dry" (CC0 — public domain, no
 * attribution required; credited anyway: photography by Dimitrios Savva,
 * processing by Rico Cilliers — https://polyhaven.com/a/rock_boulder_dry).
 * Diffuse/normal/roughness/displacement at 1k, converted to webp.
 *
 * The diffuse map is pre-desaturated (public/images/stone/rock-diffuse.webp
 * keeps only ~20% of the stock scan's own warm tan/ochre cast, the rest
 * pulled toward each pixel's own luminance) — a colour tint alone can't
 * remove a hue that's baked into the source photo, only scale it, so this
 * had to happen to the pixels themselves before they ever reach the GPU.
 * material.color then tints the result neutral grey on top.
 */
const STONE_DIFFUSE = "/images/stone/rock-diffuse.webp";
const STONE_NORMAL = "/images/stone/rock-normal.webp";
const STONE_ROUGHNESS = "/images/stone/rock-roughness.webp";
const STONE_DISPLACEMENT = "/images/stone/rock-displacement.webp";

const REPEAT = 1.4; // >1 so the box's single face doesn't read as one obvious texture tile

function loadMap(loader: THREE.TextureLoader, path: string, srgb: boolean) {
  const t = loader.load(path);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(REPEAT, REPEAT);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Generates the stone surface for the services monolith. No engraving —
 * removed on request; the monolith is now the plain real-scanned rock with
 * nothing composited onto it. All four maps load the same simple way now
 * that nothing needs runtime canvas compositing.
 */
export function createStoneTextures() {
  const loader = new THREE.TextureLoader();
  const map = loadMap(loader, STONE_DIFFUSE, true);
  const normalMap = loadMap(loader, STONE_NORMAL, false);
  const roughnessMap = loadMap(loader, STONE_ROUGHNESS, false);
  const bumpMap = loadMap(loader, STONE_DISPLACEMENT, false);
  return { map, normalMap, roughnessMap, bumpMap };
}

/** Soft radial sprite used to fake volumetric smoke. */
export function createSmokeTexture(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(120,126,138,0.26)");
  g.addColorStop(0.5, "rgba(80,85,95,0.09)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
