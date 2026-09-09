#!/usr/bin/env python3
"""Trace the RA monogram artwork into vector contours for the 3D hero mark.

    python3 scripts/trace-monogram.py [assets/monogram-source.png]

Sub-pixel marching squares on the anti-aliased grayscale (so curves stay
smooth), then Douglas-Peucker simplification. The mark is three disjoint
pieces with no holes -- the interlace breaks separate them -- so every
contour is a closed outer boundary.

Writes src/components/three/monogramContours.ts.
"""
import sys, math, json
sys.setrecursionlimit(20000)

SRC = sys.argv[1] if len(sys.argv) > 1 else "assets/monogram-source.png"
OUT_TS = "src/components/three/monogramContours.ts"
# crop to the mark, excluding the tagline and corner ticks in the source art
CROP = (185, 600, 295, 775)  # y0, y1, x0, x1
HEADER = open("src/components/three/monogramContours.ts").read().split("export const")[0]

from PIL import Image
import numpy as np, json, math

LEVEL = 128.0
img = Image.open(SRC).convert("L")
a = np.array(img).astype(np.float64)
# mark region only (excludes the tagline and the corner x ticks)
a = a[CROP[0]:CROP[1], CROP[2]:CROP[3]]
H, W = a.shape
# invert so "inside" (ink) is HIGH -> contour at LEVEL
f = 255.0 - a
lvl = 255.0 - LEVEL

def interp(p1, v1, p2, v2):
    t = (lvl - v1) / (v2 - v1)
    return (p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t)

segs = []
for y in range(H - 1):
    for x in range(W - 1):
        # corners: tl tr br bl
        v = (f[y, x], f[y, x+1], f[y+1, x+1], f[y+1, x])
        p = ((x, y), (x+1, y), (x+1, y+1), (x, y+1))
        idx = (v[0] > lvl) | ((v[1] > lvl) << 1) | ((v[2] > lvl) << 2) | ((v[3] > lvl) << 3)
        if idx == 0 or idx == 15:
            continue
        # edge midpoints (interpolated): e0 top, e1 right, e2 bottom, e3 left
        e = [None]*4
        if (v[0] > lvl) != (v[1] > lvl): e[0] = interp(p[0], v[0], p[1], v[1])
        if (v[1] > lvl) != (v[2] > lvl): e[1] = interp(p[1], v[1], p[2], v[2])
        if (v[3] > lvl) != (v[2] > lvl): e[2] = interp(p[3], v[3], p[2], v[2])
        if (v[0] > lvl) != (v[3] > lvl): e[3] = interp(p[0], v[0], p[3], v[3])
        # standard marching squares cases (inside = above level), CCW-ish pairing
        table = {
            1:[(3,0)], 2:[(0,1)], 3:[(3,1)], 4:[(1,2)], 6:[(0,2)], 7:[(3,2)],
            8:[(2,3)], 9:[(2,0)], 11:[(2,1)], 12:[(1,3)], 13:[(1,0)], 14:[(0,3)],
            5:[(3,0),(1,2)], 10:[(0,1),(2,3)],
        }
        for i, j in table[idx]:
            if e[i] is not None and e[j] is not None:
                segs.append((e[i], e[j]))

print("segments:", len(segs))

from collections import defaultdict
def key(p): return (round(p[0], 4), round(p[1], 4))
nxt = defaultdict(list)
for s, t in segs:
    nxt[key(s)].append((key(t), t))
used = set(); loops = []
for s, t in segs:
    ks = key(s)
    if (ks, key(t)) in used: continue
    loop = [s, t]; cur = key(t); used.add((ks, key(t)))
    while True:
        cand = [c for c in nxt[cur] if (cur, c[0]) not in used]
        if not cand: break
        k2, pt = cand[0]
        used.add((cur, k2)); loop.append(pt); cur = k2
        if cur == ks: break
    if len(loop) > 8: loops.append(loop)

def area(poly):
    s = 0.0
    for i in range(len(poly)):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % len(poly)]
        s += x1 * y2 - x2 * y1
    return s / 2

def rdp(pts, eps):
    if len(pts) < 3: return list(pts)
    x1, y1 = pts[0]; x2, y2 = pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy)
    dmax, idx = -1.0, 0
    for i in range(1, len(pts) - 1):
        d = (math.hypot(pts[i][0] - x1, pts[i][1] - y1) if n < 1e-9
             else abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / n)
        if d > dmax: dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]

def rdp_closed(loop, eps):
    if loop[0] == loop[-1]: loop = loop[:-1]
    p0 = loop[0]
    k = max(range(len(loop)), key=lambda i: (loop[i][0]-p0[0])**2 + (loop[i][1]-p0[1])**2)
    return rdp(loop[:k+1], eps)[:-1] + rdp(loop[k:] + [loop[0]], eps)[:-1]

loops = sorted((l for l in loops if abs(area(l)) > 200), key=lambda l: -abs(area(l)))
simp = [rdp_closed(l, 0.4) for l in loops]

xs = [p[0] for l in simp for p in l]; ys = [p[1] for l in simp for p in l]
cx, cy = (min(xs)+max(xs))/2, (min(ys)+max(ys))/2
scale = 1.0 / max(max(xs)-min(xs), max(ys)-min(ys))
out = []
for l in simp:
    n = [[round((x-cx)*scale, 5), round(-(y-cy)*scale, 5)] for x, y in l]
    if area(n) < 0: n.reverse()
    out.append(n)

names = ["R", "A_RIGHT", "A_LEFT"]
body = ",\n".join(
    f"  // {names[i]} \u2014 {len(p)} points\n  [\n"
    + ",\n".join(f"    [{x}, {y}]" for x, y in p) + "\n  ]"
    for i, p in enumerate(out))
open(OUT_TS, "w").write(HEADER + "export const MONOGRAM_CONTOURS: number[][][] = [\n" + body + ",\n];\n")
print("wrote", OUT_TS, "-", sum(len(p) for p in out), "points across", len(out), "contours")
