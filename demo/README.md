# Rock material — two approaches, side by side

Open each directly in a browser (needs a local static server, since both load
textures/modules — `file://` won't work for approach A's image loads):

```
cd demo
python3 -m http.server 8793
```

Then visit `http://localhost:8793/approach-a-real-texture.html` and
`http://localhost:8793/approach-b-procedural.html`. Drag to rotate, scroll to
zoom, both auto-rotate slowly when idle so you can see it from multiple
angles without touching anything.

## Approach A — `approach-a-real-texture.html`

Real scanned material: [Poly Haven "Rock Boulder Dry"](https://polyhaven.com/a/rock_boulder_dry)
(CC0 — public domain, no attribution required, included anyway: photography
by Dimitrios Savva, processing by Rico Cilliers). Diffuse + normal +
roughness + displacement maps, downloaded into `assets/` and dropped onto
the geometry. Recolored darker via `material.color` (a multiply tint, not a
texture replacement) since the stock scan is a lighter sandy/lichen grey,
not the reference's near-black basalt.

This is the one that actually looks like the reference up close — genuine
non-repeating grain, specular glints on individual facets, a real crack.
No amount of noise-function tuning gets that; it's what a photo brings that
procedural generation structurally can't.

The engraved "RA" is composited onto the loaded displacement image (same
darken-the-bump-map technique as approach B) but reads subtly against the
photo's own busy detail — verified the code path works (the image loads and
the bump map does swap in), it's just not very visible at the current alpha/
blur. Would need another pass (sharper edge, higher contrast, maybe a
drop-shadow-style double pass) to read clearly on top of a real photo
specifically — approach B's version, on the flatter procedural base, reads
far more clearly as a result, which is itself useful information: a real
texture's own high-frequency noise fights with a flat overlaid mark more
than a procedural one does.

**CLAUDE.md currently says the monolith uses "original geometry and
procedural textures — no reference assets."** Using this approach for real
would be a deliberate, explicit exception to that rule, not a tweak — flag
it back before committing to this direction.

## Approach B — `approach-b-procedural.html`

No external assets, everything generated at runtime, same technique family
as the current `stoneTexture.ts` but with the three specific fixes from the
writeup:

- **Worley/cellular noise** layered against the existing `fbm`, for actual
  discrete grain-like facets instead of one smooth continuous gradient.
- **Decorrelated bump vs. colour** — separate noise calls (different
  frequencies, different offsets) for each channel, not the same value
  reused for both.
- **Carved, not stamped, engraving** — the glyph darkens the bump map
  (recessed) with a blurred edge (soft falloff, not a hard binary cut),
  rather than only darkening the colour map. Reads clearly as cut into the
  surface, visible in the demo.

Doesn't close the full gap to a real photo — up close it's still
recognizably "good noise," not "a rock" — but it's a real, visible
improvement over the current implementation and keeps CLAUDE.md's
no-reference-assets rule intact.

## Geometry note (both files)

Both use the same subdivided-box + per-vertex noise displacement (a cheap
"chipped edge" approximation), so the comparison isolates the *material*,
not the silhouette. Neither is the full fractured-geometry treatment from
the original writeup — that's a separate, bigger piece of work either way.

## Next step

Pick a direction (or neither, or a third option) and say so — whichever one
wins, I'll port the relevant piece into `stoneTexture.ts` /
`MonolithScene.tsx` properly (matching the project's existing code
conventions, not copy-pasted demo code), not just copy these files in
directly.
