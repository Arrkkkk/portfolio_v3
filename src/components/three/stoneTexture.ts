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
 * Generates the stone surface for the services monolith, with the portfolio
 * monogram engraved into its face — an original mark, not the reference's.
 * The engraving is sized relative to each loaded image's own resolution,
 * not a caller-supplied size — the real scan dictates that now.
 */
export function createStoneTextures(monogram = "RA") {
  const loader = new THREE.TextureLoader();
  const normalMap = loadMap(loader, STONE_NORMAL, false);
  const roughnessMap = loadMap(loader, STONE_ROUGHNESS, false);

  /*
   * map (diffuse) is NOT loaded via TextureLoader like the two above —
   * it has to go through the same Image+canvas path as bumpMap below so
   * the engraving can be composited onto it. Loading it both ways (an
   * independent TextureLoader fetch AND this canvas path) would race:
   * whichever finished last would overwrite the other's `.image`, and if
   * the plain load won, it would silently erase the engraving with no
   * visible error.
   */
  const map = new THREE.Texture();
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(REPEAT, REPEAT);
  map.colorSpace = THREE.SRGBColorSpace;

  /*
   * The engraving still has to be generated at runtime, not pre-baked
   * into the displacement photo on disk — it has to track `monogram`
   * (site.monogram), which is owner-configurable data, not a fixed asset.
   * Composited onto the REAL displacement map rather than a from-scratch
   * canvas, so the surrounding bump detail is still the photographed rock,
   * not a flat field with a mark floating on it.
   *
   * bumpMap convention is brighter = higher/raised, darker = lower/
   * recessed — an ENGRAVING has to darken this region, not lighten it, or
   * it reads as a raised seal instead of a carved mark. Blurred edge
   * (not a hard cut) so the depth falls off like a real gouge wall would,
   * rather than a binary cliff.
   */
  const bumpMap = new THREE.CanvasTexture(document.createElement("canvas"));
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(REPEAT, REPEAT);

  const dispImg = new Image();
  dispImg.crossOrigin = "anonymous";
  dispImg.onload = () => {
    const texSize = dispImg.width;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = texSize;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(dispImg, 0, 0, texSize, texSize);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#000";
    ctx.font = `600 ${texSize * 0.34}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.filter = `blur(${texSize * 0.004}px)`;
    ctx.fillText(monogram, texSize / 2, texSize / 2);
    ctx.restore();
    bumpMap.image = canvas;
    bumpMap.needsUpdate = true;
  };
  dispImg.src = STONE_DISPLACEMENT;

  /*
   * Engrave the colour map too (a faint shadow on top of the real grain,
   * not the engraving's main depth cue — the bump map above carries that)
   * so the mark reads correctly even at angles/lighting where the bump
   * perturbation alone is subtle.
   */
  const diffImg = new Image();
  diffImg.crossOrigin = "anonymous";
  diffImg.onload = () => {
    const texSize = diffImg.width;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = texSize;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(diffImg, 0, 0, texSize, texSize);
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#000";
    ctx.font = `600 ${texSize * 0.34}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.filter = `blur(${texSize * 0.003}px)`;
    ctx.fillText(monogram, texSize / 2, texSize / 2);
    ctx.restore();
    map.image = canvas;
    map.needsUpdate = true;
  };
  diffImg.src = STONE_DIFFUSE;

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
