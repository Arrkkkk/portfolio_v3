import * as THREE from "three";

/** Value-noise helpers — deterministic so SSR/CSR and reloads look identical. */
const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const smooth = (t: number) => t * t * (3 - 2 * t);

const noise2 = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
};

const fbm = (x: number, y: number, octaves = 5) => {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += noise2(x * freq, y * freq) * amp;
    freq *= 2;
    amp *= 0.5;
  }
  return v;
};

/**
 * Generates the stone surface for the services monolith, with the portfolio
 * monogram engraved into its face — an original mark, not the reference's.
 * Returns a colour map and a bump map so the engraving reads as carved depth.
 */
export function createStoneTextures(size = 512, monogram = "RA") {
  const make = () => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    return { c, ctx: c.getContext("2d")! };
  };

  const colour = make();
  const bump = make();
  const img = colour.ctx.createImageData(size, size);
  const bimg = bump.ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(x / 36, y / 36);
      const grain = fbm(x / 4, y / 4, 3);
      const v = Math.max(0, Math.min(1, n * 0.78 + grain * 0.22));
      const base = 14 + v * 58;
      // Warm speckle on the upper-right, as in the reference's lit face.
      const warm = Math.max(0, x / size + (1 - y / size) - 1.35) * 190 * v;
      const i = (y * size + x) * 4;
      img.data[i] = base + warm;
      img.data[i + 1] = base + warm * 0.78;
      img.data[i + 2] = base + warm * 0.6;
      img.data[i + 3] = 255;

      const b = v * 255;
      bimg.data[i] = bimg.data[i + 1] = bimg.data[i + 2] = b;
      bimg.data[i + 3] = 255;
    }
  }
  colour.ctx.putImageData(img, 0, 0);
  bump.ctx.putImageData(bimg, 0, 0);

  // Engrave the monogram into both maps.
  for (const { ctx } of [colour, bump]) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.font = `600 ${size * 0.34}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(monogram, size / 2, size / 2);
    ctx.restore();
  }

  const toTexture = (canvas: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  };

  return { map: toTexture(colour.c), bumpMap: toTexture(bump.c) };
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
