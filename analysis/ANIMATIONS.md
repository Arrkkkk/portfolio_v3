# ANIMATIONS — Motion specification

**Sampling caveat.** The source is 2 FPS (one frame every 500 ms). Any animation shorter than ~1 s is
resolved by 1–3 frames, so its *existence and shape* are observable but its *exact duration and
easing* are not. Every duration below carries a confidence tag; treat `LOW-CONFIDENCE` values as
starting points to tune in the visual-validation loop, not as measurements.

---

## A01 — Preloader assembly
**Element** logo mark inside a 195 px framed square + counter.
**Trigger** page load.
**Initial** empty frame, counter at 0.
**Final** complete mark, counter at 100, then hard cut to black.
**Properties** stroke/plane reveal of the mark; numeric counter; corner `×` ticks fade in.
**Duration** ≥ 2.5 s visible (frames 001–005); cut at frame 006. `OBSERVED`
**Easing** `--e-out`. `LOW-CONFIDENCE`
**Scroll relationship** none (scroll locked).
**Confidence** OBSERVED (existence) / LOW (timing).

## A02 — Hero entrance
**Element** WebGL shard cluster + H1 + hero chrome.
**Trigger** end of preloader.
**Initial** black screen; canvas empty.
**Final** cluster rotating at centre-right; H1 visible; chrome visible.
**Sequence** frames 006–007 black → 008–010 faint shards fade up from 0 opacity while scattered wide →
011–012 shards converge, H1 glyphs resolve out of a heavy blur (frame 011 shows `s n t / m ns m t`,
frame 012 shows `D sig d to / mean someth i g`) → 013 fully resolved.
**Properties** canvas opacity 0→1; shard positions converging; H1 per-glyph `filter: blur(12px)→0`
with a small random `y` offset and staggered opacity.
**Duration** ~3 s (frames 007→013). `OBSERVED`
**Stagger** per-glyph, ~0.03 s, non-sequential (random order — glyphs resolve out of order).
`HIGH-CONFIDENCE INFERENCE`

## A03 — Kinetic word swap (hero H1)
**Element** the final word of the H1.
**Trigger** timed loop (no scroll, no hover — the page is static across frames 013–029).
**States** `something.` → `depth.` → `impact.` → repeat.
**Properties** outgoing word blurs + fades; incoming word resolves from blur. Frames 018, 024, 029
catch the mid-blur state (`mean s methi g`, `mean d th`, `mean m`).
**Cycle** ~2.5 s hold + ~0.5 s transition; full loop ≈ 3 s per word. Word changes observed at frames
013→019 (something→depth) and 019→027 (depth→impact) = ~3 s and ~4 s apart. `HIGH-CONFIDENCE INFERENCE`
**Implementation note** the swap must not reflow the preceding words.

## A04 — Hero interactions
**Ring cursor** — 82 px ring lerps toward the pointer, factor ≈ 0.12, ~10 px trailing offset.
`OBSERVED` (frames 13/14/16/17/21/23).
**Blast** — `HOLD TO 💥 BLAST`: pointer-down for a sustained period explodes the shard cluster
outward. `OBSERVED` (label) / `NOT OBSERVABLE` (the recording never performs it).
**Lightning** — `DARE ⚡ TO TOUCH THE LINES.`: hovering the thin wire-lines spawns `#2E7BFF` arcs
along them. `OBSERVED` (arcs present in frames 013–014).
**Pointer parallax** — the cluster's rotation tracks the pointer slowly. `HIGH-CONFIDENCE INFERENCE`.

## A05 — Statement word-reveal (scrubbed)
**Element** every word of the About statement (and the Services page's "Focused disciplines…").
**Trigger** ScrollTrigger, scrubbed.
**Initial** `color: --text-mid` (#AAAAAA).
**Final** `color: --text-hi` (#F2F2F2).
**Scroll relationship** the reveal front moves left→right and wraps line by line; it is tied to scroll
position, not time — frames 031→056 show the wipe advancing and *pausing when scrolling pauses*
(frames 038–039 barely change). `OBSERVED` — this is definitive proof of a scrubbed timeline.
**Stagger** per word, distributed across the trigger's scroll range (start: block bottom at 80 % vh,
end: block top at 30 % vh).
**Properties** colour only — no y-offset, no opacity, no clip.

## A06 — Chapter luminance inversion
**Element** page background + header chrome.
**Trigger** scroll boundary between chapters.
**Change** `#0E0E0E ⟷ #FFFFFF/#DADADA`; logo, pills and text invert together.
**Duration** ~0.3 s crossfade at the boundary; the boundary itself is a hard edge scrolling up the
viewport (the next chapter's background scrolls over the previous one). `HIGH-CONFIDENCE INFERENCE`
**Frames** 076–080 (dark → Key facts), 130–140 (white → dark smoke), 178–181 (dark → Client stories),
243–246 (light → footer black).

## A07 — Marquee loop
**Element** `IMPACT + INSPIRE + INNOVATE +` band.
**Trigger** always running.
**Properties** `transform: translateX()` on a duplicated track, linear, seamless.
**Speed** ≈ 90 px/s at rest (measured: the word `IMPACT` advances ~45 px between frames 062 and 063).
`HIGH-CONFIDENCE INFERENCE`
**Scroll relationship** speed/skew reacts to scroll velocity — the band advances noticeably further
during fast-scroll frames. `LOW-CONFIDENCE INFERENCE`
**Direction** right → left.

## A08 — Key facts entrance
**Element** 3 stat cards + partner row.
**Trigger** section enters viewport.
**Initial** `opacity: 0; rotateX: −70°` about `transform-origin: 50% 0%`, under a **shared
perspective of ~1335px on the card grid** (not per-card). `OBSERVED` — corrected from the earlier
`opacity/y:+40/scale:.97` inference, which was wrong. The "small skewed placeholder" in frame 081 is
the effect itself, not a placeholder.

Measured silhouette of the right-hand card (CSS px; final size 330 × 407):

| frame | height | top edge | bottom edge | taper |
|---|---|---|---|---|
| 082 | 241 (59%) | 323 | 260 | −19.7% |
| 083 | 315 (77%) | 327 | 287 | −12.3% |
| settled | 407 | 330 | 330 | 0 |

Three things this pins down. Within frame 082 the width narrows 323 → 298 → 259.5 over equal height
steps — *accelerating*, which only a perspective divide produces; an affine skew holds width constant
and a linear scale narrows evenly. The top edge sits at its final 330 throughout, so the hinge is the
top edge. And the right card's right edge drifts 97px left against its own left edge's 33px — that
asymmetry is a **shared** vanishing point at the grid's centre pulling the outer cards inward, not a
`rotateY`; per-card perspective would taper each card symmetrically.

**Final** neutral.
**Duration** ~1.1 s; **stagger** ~0.145 s left→right — frame 082 catches the three cards at ~95% /
~77% / 59% of final height, a 36-point spread that 0.08 s cannot produce (it measures 16).
**Extra** the section title `Key facts` itself resolves out of a per-glyph blur (frame 079:
`K   f cts`). Same technique as A02.

## A09 — Horizontal work track (scrubbed)
**Element** ProjectCard row.
**Trigger** ScrollTrigger pin + scrub over the Selected-work section.
**Mapping** `x = -progress × (trackWidth − viewportRight)`; the title column is `position: sticky`.
**Evidence** frames 096–120: cards translate steadily left while the heading stays fixed; a card's
left edge moves ~130 px per frame during steady scrolling.
**Easing** linear (scrub); Lenis supplies the inertia.
**Cards observed** MyWorker AI → Pulse Studio → Lofticorn → (a 4th, partially seen).

## A10 — Services set-piece (pinned, scrubbed) — the centrepiece
Phases, with frame ranges:

| Phase | Frames | What happens |
|---|---|---|
| P1 enter | 121–130 | The 4-line type stack `A.I./DESIGN/DEVELOPMENT/BRANDING` slides up into a white viewport and settles centred; the preceding "Discover our complete collection" copy slides out left. |
| P2 darken | 131–139 | Background crossfades `#FFFFFF → #0E0E0E`; volumetric smoke fades in; the type inverts to white; a stone boulder drops from the top and grows. |
| P3 shatter | 140–150 | The boulder rotates and collides with the type; glyphs detach, tumble as rigid bodies with rotation, and fall out of frame (frames 148–150 show letters scattered mid-air, e.g. `D D S E G / E R O E M N`). |
| P4 settle | 150–157 | Debris clears; the boulder resolves into a static square monolith (~578 × 590) with the monogram embossed into its face, centred. |
| P5 labels | 157–177 | Six ServiceLabels cross-fade in **diagonal pairs** (top-left + bottom-right), one pair at a time, each with a 24 px line-art icon that draws in. Smoke keeps drifting. |
| P6 exit | 178–181 | The whole scene unpins and the Client-stories chapter scrolls over it. |

**Properties** background-color, canvas uniforms (smoke density, camera), per-glyph rigid-body
transforms, opacity/y on the labels.
**Total scroll length** ~28 frames of continuous scrolling ⇒ roughly **350–400 vh of pinned scroll**.
`HIGH-CONFIDENCE INFERENCE`
**Simplification path (if physics is out of scope):** replace P3 with per-glyph GSAP tweens using
randomised `x/y/rotation/opacity` — keep the timing and the visual outcome. Do **not** replace the
whole scene with a fade.

## A11 — Client stories switch
**Element** quote + avatar + active client name.
**Trigger** click on a name, or the ←/→ buttons.
**Properties** old quote fades/slides out, new fades in; the `→` marker moves to the active name.
**Duration** ~0.5 s. `LOW-CONFIDENCE INFERENCE` (the recording only hovers, never switches).
**Header** `Client stories` resolves from per-glyph blur on enter (frame 180: `lien s o es`).

## A12 — Curved gallery (pinned, scrubbed)
**Element** ~10 website screenshots mapped onto a bent plane.
**Frames** 193–243.
| Phase | Frames | Behaviour |
|---|---|---|
| enter | 193–203 | `DESIGN IN` / `MOTION` split heading resolves; the arc enters from the right as a thin curved ribbon. |
| sweep | 203–228 | The arc sweeps left; its curvature *increases then decreases* — the plane bends toward the camera at mid-scene so the centre tiles read almost flat and full-size (frames 210–222) and the edges recede. |
| flatten | 229–241 | Curvature → 0, tiles snap onto a flat 2-row grid at true scale. |
| exit | 241–243 | Scene unpins; the footer scrolls over it. |
**Mapping** scroll progress → plane X offset **and** bend amount, both scrubbed.
**Background** stays `#BBBBBB` throughout; the heading sits *behind* the arc (the tiles occlude it).

## A13 — Footer entrance + LineWordmark
Frames 243–253: the black chapter scrolls up; the heading and contact block fade/slide in; the ~40
hairline rows of the `TRIONN` wordmark draw in from the left with a per-row stagger (frames 247–252
show rows still filling in). Hovering a row deforms it and drives audio.
**Stagger** ~0.02 s per row. `LOW-CONFIDENCE INFERENCE`

## A14 — Menu open/close
Frames 254–264.
```
t0.00  MENU clicked
t0.00–0.55  white panel translates from x:100% → 0 (frame 254 catches it already ~60% in)
t0.30–0.90  nav links reveal, per-character stagger (frame 259: "Contact" shown as "Co")
t0.60–1.00  pill, contact block and social block fade up
```
Close reverses. The `≡ → ×` icon morph runs with the panel. `OBSERVED` / durations `LOW-CONFIDENCE`.

## A15 — Route transition
Frames 265–268, ~1.5 s. See `BLUEPRINT.md` §15 for the timeline. Grey overlay wipe → destination
label → lift. The new page's hero (`Area of expertise`) is mid-entrance when the overlay lifts
(frames 269–272 show its per-glyph blur resolve, identical technique to A02).

## A16 — Services-page detail rows
Frames 284–309. Each row: the mockup image slides up into the left half while the right half's title,
description and capability lines stagger in; **each capability line has a 1 px underline that draws
left→right** as the line appears (frames 290–293 show the rules at partial width). ~0.06 s per line.
`OBSERVED`

## A17 — Technology stack accordion
Frames 309–316. Row 1 is open on entry. Numbers/titles fade in with a stagger; the open row's two
capability columns are visible above the rule; the closed rows show partial underlines of decreasing
width (frames 313–315: 655 px, 407 px, 272 px, 135 px), which reads as a **staggered rule-draw
entrance**, not a hover state. `HIGH-CONFIDENCE INFERENCE`

## A18 — Section heading blur-resolve (global pattern)
Every major heading in the site enters with the same **per-glyph blur + opacity resolve**:
hero (frames 011–013), `Key facts` (079), `Selected work & explorations` (093–096),
`Client stories` (180), `Area of expertise` (269–272), `TECHNOLOGY STACK` (309–311),
`How we work` (314–317), `Ready to build something bold?` (244–246).
**Spec** per glyph: `filter: blur(10px) → 0`, `opacity: 0 → 1`, `y: +8px → 0`, duration ~0.5 s,
stagger ~0.03 s in randomised order, `--e-out`, triggered once when the heading crosses ~75 % vh.
This single primitive is the most important thing to get right — it is the site's motion signature.
