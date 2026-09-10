# DESIGN-SYSTEM — Reverse-engineered visual system

All measurements are in **CSS pixels at a 1710 px viewport**, derived from 3420 px-wide 2× frames
(divide raw pixel coordinates by 2). Colour values are pixel probes; type sizes are computed from ink
extents using neue-grotesque vertical metrics (cap 0.73 em, ascender 0.75 em, descender 0.22 em) and
are accurate to roughly ±2 px.

---

## 1. Colors

### Chapter backgrounds
| Token | Value | Where | Confidence |
|---|---|---|---|
| `--bg-dark` | `#0E0E0E` | hero, about statement, marquee, services scene | OBSERVED |
| `--bg-black` | `#030408` | footer CTA (slightly cool/blue-black) | OBSERVED |
| `--bg-white` | `#FFFFFF` | services kinetic-type chapter (top) | OBSERVED |
| `--bg-off` | `#F7F7F7` | client stories (top of gradient) | OBSERVED |
| `--bg-grey-2` | `#DADADA` | key facts (top), how-we-work | OBSERVED |
| `--bg-grey` | `#BBBBBB` | design-in-motion, preloader, page-transition overlay | OBSERVED |

Light chapters are **vertical linear gradients**, e.g.
`key-facts: linear-gradient(#DADADA 0%, #FDFDFD 60%, #FFFFFF 100%)`,
`client-stories: linear-gradient(#F7F7F7, #BEBEBE)`. `OBSERVED` (column probes at x = 3390)

### Surfaces
| Token | Value | Where |
|---|---|---|
| `--card-dark` | `#2E2E2E` | key-facts card 3 |
| `--card-warm` | `#EAE7E2` | key-facts card 2 |
| `--panel-white` | `#FFFFFF` | menu overlay panel |
| `--pill-fill-dark` | `#FFFFFF` | LET'S TALK on a dark chapter |
| `--pill-fill-light` | `#111111` | LET'S TALK on a light chapter |
| `--audio-chip` | `rgba(255,255,255,.12)` / `rgba(0,0,0,.08)` | circular audio toggle |

### Text
| Token | Value | Use |
|---|---|---|
| `--text-hi` | `#F2F2F2` | headings / body on dark |
| `--text-mid` | `#AAAAAA` | secondary copy on dark, statement "unread" words |
| `--text-lo` | `#6E6E6E` | mono micro-labels on dark |
| `--ink` | `#1A1A1A` | headings on light |
| `--ink-mid` | `#555555` | body on light |
| `--ink-lo` | `#8A8A8A` | mono micro-labels on light, inactive client names |

### Lines / overlays
```
--rule-dark    rgba(255,255,255,0.14)   1px hairlines on dark
--rule-light   rgba(0,0,0,0.12)         1px hairlines on light
--ring-cursor  rgba(255,255,255,0.40)   hero ring, 1px stroke
--marquee-ink  rgba(255,255,255,0.30)   marquee glyph fill
--overlay-nav  #BBBBBB                  full-screen route-transition overlay
```

### Accents — **inside the 3D scenes only**, never in UI chrome
```
--ember  #E2521F   glowing shard edges / rim light
--arc    #2E7BFF   lightning arcs on hover
```
`OBSERVED`. There is **no accent colour anywhere in the interface layer** — buttons, links and labels
are strictly monochrome. This is a defining property of the design; do not introduce a brand accent
into the UI.

### Gradients / blur / glass
* Volumetric smoke in the services scene and footer is rendered in WebGL, not CSS. `OBSERVED`
* No glassmorphism, no `backdrop-filter`, no drop shadows on UI. Cards sit flat on their background.
  `OBSERVED`

---

## 2. Typography

### Families
| Role | Identification | Confidence |
|---|---|---|
| Display / UI | **PP Neue Montreal** — single-storey `g`, double-storey `a`, angled `t` terminal, very tight sidebearings, slightly condensed uppercase | HIGH-CONFIDENCE INFERENCE |
| Micro-labels / links / numerals | **monospaced grotesque** — unslashed `0`, straight-leg `R`, flat-terminal `C`; PP Supply Mono / Geist Mono class | HIGH-CONFIDENCE INFERENCE |

Fallback stacks (if PP Neue Montreal is not licensed — pick one and stay with it):
```css
--font-display: "PP Neue Montreal", "Neue Montreal",
                "Helvetica Neue", Arial, sans-serif;   /* self-hosted: Book -> 400, Medium -> 500 */
--font-mono:    "PP Supply Mono", "Geist Mono", "JetBrains Mono", "Roboto Mono",
                ui-monospace, monospace;
```
Weights actually used: **400 only** for display (no bold anywhere in headings), 400/500 for mono.
`OBSERVED` — the design gets its weight contrast from *size*, never from font-weight.

### Type scale (tokens)

| Token | Size | LH | Tracking | Case | Where |
|---|---|---|---|---|---|
| `display-hero` | **76 px** / 4.45 vw | 0.98 | −0.02 em | Sentence | hero H1 (frames 13–29) |
| `display-lg` | **72 px** / 4.2 vw | 1.04 | −0.02 em | Sentence | about statement, footer CTA, "Client stories", "How we work", "Selected work & explorations" |
| `display-kinetic` | **~112 px** / 6.5 vw | 0.80 | −0.01 em | UPPER | A.I./DESIGN/DEVELOPMENT/BRANDING stack (scroll-scaled 1 → ~1.15) |
| `display-marquee` | **~120 px** / 7 vw | 1.0 | 0 | UPPER | IMPACT + INSPIRE + INNOVATE |
| `title-lg` | **32 px** | 1.25 | −0.01 em | Sentence | menu links |
| `title-md` | **30 px** | 1.2 | −0.01 em | Sentence | service detail titles, tech-stack row titles |
| `title-sm` | **28 px** | 1.2 | −0.01 em | Sentence | process step titles ("Understand"), project card titles (24 px) |
| `body` | **16 px** | 1.35 | 0 | Sentence | mission paragraph, service descriptions |
| `body-sm` | **14 px** | 1.3 | 0 | Sentence | card copy, testimonial meta, capability lines |
| `quote` | **26 px** | 1.35 | −0.01 em | Sentence | testimonial quote |
| `label-mono` | **12 px** | 1.4 | +0.06 em | UPPER | ABOUT, OUR SERVICES, OUR PROCESS, STEP - 1, section captions |
| `link-mono` | **13 px** | 1.4 | +0.08 em | UPPER | DISCUSS YOUR PROJECT →, VIEW ALL PROJECTS →, EXPLORE PROJECT → |
| `nav-pill` | **13 px** | 1 | +0.02 em | UPPER | LET'S TALK, MENU |
| `caption` | **12 px** | 1.4 | +0.02 em | UPPER | ✦ DESIGN WITH INTENT. BUILT TO WORK. |

Raw evidence for the display sizes (frame → ink extent → derived em):
```
f13  hero line pitch 75.5px, ink 72px (cap→descender = .95em)  → 76px / lh 0.99
f48  statement pitch 75px,  ink 68px                            → 72px / lh 1.04
f248 footer  pitch 73.5px,  ink 68px                            → 72px / lh 1.02
f100 "Selected work" ink 54px (cap→baseline), pitch 74px        → 70–72px / lh 1.05
f130 kinetic stack pitch 89.5px, "DEVELOPMENT" width 777px      → ~112px / lh 0.80
f70  marquee cap height 87px                                    → ~120px
```

### Text behaviour
* Headlines wrap **manually** into balanced 2–3 line blocks; never justified, never hyphenated.
  Max measure ≈ **16–18 words per line at 72 px**, i.e. line boxes up to ~1600 px wide (about
  statement) and ~950 px (hero).
* Body copy max-width: **~330 px** (3-line columns in about / process / service descriptions).
  `OBSERVED` — this narrow measure is a signature of the layout.
* Sentence case for all display type; **UPPERCASE only for mono micro-type and the kinetic/marquee
  stacks**.
* No text-shadow, no outline text, no variable-font axis animation detected. The blur seen on the
  swapping hero word is a **CSS/GSAP blur filter during the transition**, not a font axis.
  `HIGH-CONFIDENCE INFERENCE`

---

## 3. Spacing scale

```
--s-1   4     --s-6   24    --s-11  80
--s-2   8     --s-7   32    --s-12  96
--s-3   12    --s-8   40    --s-13  120
--s-4   16    --s-9   48    --s-14  160
--s-5   20    --s-10  64    --s-15  200
```

Verified anchors:
| Gap | Value | Frame |
|---|---|---|
| Page left/right padding | 32 | 13, 48, 248 |
| Header top offset (to pill top) | 32 | 13 |
| Key-facts card gap | 20 | 88 |
| Card padding | 24–32 | 88 |
| Heading → sub-copy | 24 | 320 |
| Label → heading | 40 | 320 |
| Statement → hairline rule | 80 | 48 |
| Rule → supporting columns | 80 | 48 |
| Section top padding (light chapters) | 96–120 | 187, 320 |
| Between service capability lines | 39 | 286 |
| Tech-stack row height | 96 | 313 |

---

## 4. Layout tokens

```
--page-pad        32px            (both sides, all breakpoints ≥1024)
--container       100%            (default: full-bleed)
--container-mid   1032px          (key facts only, centred)
--split-divider   1px             vertical rule, --rule-*
--header-h        60px            (content band 32→60, i.e. 28px tall controls)
--section-min-h   100vh
--pinned-scene    300–400vh of scroll for pinned scenes
```

Image ratios:
```
project card        714 × 488   ≈ 1.464 : 1   (~3:2)     radius 4
key-fact portrait   330 × 407   ≈ 0.81  : 1   (4:5)      radius 10
key-fact inner img  266 × 220                            radius 4
testimonial avatar   66 ×  66     1:1                    radius 2
service mockup      493 × 320   ≈ 1.54  : 1              radius 0
menu panel          368 × 928                            radius 6
```

---

## 5. Borders, radius, shadows

| Token | Value | Notes |
|---|---|---|
| `--bw` | 1px | every border on the site is exactly 1 px |
| `--r-pill` | 999px | LET'S TALK / MENU / THE TRIONN NAME STORY |
| `--r-card` | 10px | key-facts cards |
| `--r-img` | 4px | project card images |
| `--r-panel` | 6px | menu panel |
| `--r-none` | 0 | service mockups, testimonial nav buttons |
| shadows | **none** | no box-shadow anywhere in the UI layer |
| blur | only inside WebGL scenes, plus a short `filter: blur()` on swapping glyphs |

Decorative primitives:
* **Hairline + crosshair**: a full-width 1 px rule with a small `+` glyph at its midpoint
  (frames 48, 187). ~9 px crosshair, same colour as the rule.
* **✦ caption**: a 4-point star glyph prefixing pinned-scene captions.
* **Corner ticks**: small `×` marks at the four corners of the preloader frame (frame 3).
* **Line-art icons** beside service labels: 24 × 24 px, 1 px stroke, geometric (concentric squares,
  horizontal-line stack, X-arrows) (frames 157–174).

---

## 6. Motion tokens

```
--e-out     cubic-bezier(0.16, 1, 0.3, 1)     entrances, panel slide
--e-inout   cubic-bezier(0.65, 0, 0.35, 1)    chapter/colour crossfades
--e-linear  linear                            marquees, scrubbed timelines
--d-fast    0.3s     hover states, pill fills
--d-base    0.6s     text/element entrances
--d-slow    1.0s     menu panel, overlay wipes
--d-xslow   1.5s     route transition (measured 3 frames @2FPS)
--stagger   0.04s    per-word / per-character
```
Because the source is sampled at 2 FPS, all durations under ~0.5 s are `LOW-CONFIDENCE INFERENCE`;
anything ≥ 1 s is `HIGH-CONFIDENCE`.
