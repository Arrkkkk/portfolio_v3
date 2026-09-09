# BLUEPRINT — Reference Reverse-Engineering (Master Specification)

**Reference site:** `https://trionn.com` — TRIONN, an independent digital studio.
**Evidence base:** 327 sequential JPEG frames (`Trion Frames/frame_0001…0327.jpg`), 3420×1902 px @2×,
captured at ~2 FPS from a desktop screen recording. CSS viewport = **1710 × 951** (content width
~1695 px after scrollbar). Confirmed by the browser status bar in frames 100 / 259
(`https://trionn.com/work/myworker-ai`, `https://trionn.com/contact`).
**No live-site inspection was performed** (no network access in this session). Every statement below is
derived from the frames; confidence is labelled.

> Contact sheets: `analysis/atlas/atlas-01…07.jpg` (48 frames each, frame numbers burned in).
> Per-frame scene breakdown: `analysis/FRAME-MAP.md`.

---

## 1. Overall design

A **dark-first, high-contrast editorial studio site** built around three ideas:

1. **Alternating luminance chapters.** The page swings between near-black (`#0E0E0E`) and light
   (`#FFFFFF` → `#BBBBBB`) full-viewport chapters. Chapter changes are hard cuts driven by scroll, not
   fades, and the header inverts its colours to match. `OBSERVED`
2. **Oversized neo-grotesque typography as the primary graphic.** There is almost no decoration; the
   layout is carried by a 72–120 px display face, tightly tracked, set against very large empty areas.
   `OBSERVED`
3. **Three WebGL set-pieces** that are scroll-scrubbed and pinned: a shattered metal logo (hero), a
   stone monolith in volumetric smoke (services), and a curved 3D arc of website screenshots
   (explorations). `OBSERVED`

Supporting motifs: monospaced micro-labels in caps with wide tracking; hairline 1 px rules with `+`
crosshair markers at their midpoints; pill-shaped nav buttons; ✦-prefixed caption lines pinned to the
bottom of pinned scenes; an audio toggle (the site plays sound).

## 2. Page architecture

```
/                    Home        (frames 001–264)
/services            Services    (frames 269–327)
/work/<slug>         Case study  (link target only — NOT OBSERVED)
/contact             Contact     (link target only — NOT OBSERVED)
/about               About       (menu link — NOT OBSERVED)
```

**Home**
```
Preloader  →  Hero (3D)  →  About statement  →  Marquee  →  Key facts  →
Selected work (horizontal)  →  Collection CTA  →  Services set-piece (pinned 3D)  →
Client stories  →  Design in motion (3D arc)  →  Footer CTA
```

**Services**
```
Page transition  →  Hero "Area of expertise"  →  Focused-disciplines statement  →
Marquee  →  6 × service detail rows  →  Technology stack (accordion)  →
How we work (3 steps)  →  Footer CTA
```

Header and the slide-in Menu overlay are global. The footer CTA block is shared by both pages
(identical in frames 248 and 324). `OBSERVED`

## 3. Layout

* **Fluid full-bleed page, no centred max-width for most sections.** Content starts at **x = 32 px**
  and ends at **x ≈ 1660 px** on a 1695 px content box → symmetric **32 px page padding**.
  `OBSERVED` (measured on frames 13, 48, 248)
* **Exception:** the Key facts card row is a **centred ~1032 px container** (cards at x 331/682/1033,
  each 330 px wide, 20 px gaps). `OBSERVED`
* **Two-column split layouts** use a real 1 px vertical divider at 50 % (services detail rows,
  frame 286) or at ~43 % (Selected work, divider at x ≈ 730, frame 100). `OBSERVED`
* **Section heights are viewport-locked**: every chapter is ≥ 100 vh; the pinned scenes run several
  viewport-heights of scroll while staying visually fixed. `HIGH-CONFIDENCE INFERENCE`
* Implementation: CSS Grid for the detail rows and stat cards, Flexbox for the header and link rows,
  `position: sticky` for the pinned section labels and the Selected-work title column, `transform:
  translate3d()` for the horizontal track and marquees. Evidence: the "Selected work" title stays
  motionless for ~25 frames while the right-hand cards translate left (frames 096–120).

## 4. Grid

No visible column grid overlay. Derived structure:

| Context | Structure |
|---|---|
| Page | single fluid column, 32 px gutters |
| Key facts | 3 equal columns, 330 px, 20 px gap, centred (~1032 px) |
| Services detail row | 2 columns 50/50, 1 px divider, image left / copy right (alternates) |
| Selected work | sticky left column ~43 %, horizontal track right ~57 % |
| How we work | 3 equal columns starting at x = 307, ~405 px pitch |
| Footer CTA | headline left (~50 %), links + contact right, 2 sub-columns |
| Tech stack | 3 zones: number (x 32), title (x 583), arrow (x 1656) |

## 5. Spacing

Recurring gaps, measured to the nearest 2 px (`HIGH-CONFIDENCE INFERENCE`):

```
4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 120 · 160 · 200
```

Anchors: page padding 32; header top offset 32; card gap 20; heading→sub-copy 24–32; label→heading 40;
rule→content 80; section top padding 96–120; large vertical rhythm inside pinned scenes 160–200.

## 6. Typography

See `DESIGN-SYSTEM.md` for the full token table. Summary:

| Role | Size | LH | Notes |
|---|---|---|---|
| Hero H1 | **76 px** (~4.45 vw) | 0.98 | tight tracking (−0.02em), sentence case |
| Display statement / H2 | **70–72 px** | 1.04 | about, footer CTA, "Client stories", "How we work" |
| Kinetic type stack | **~112 px** | 0.80 | uppercase, scroll-scaled |
| Marquee | **~120 px** | 1.0 | uppercase, 30 % opacity |
| Section title | **28–30 px** | 1.2 | service detail titles, process step titles |
| Body | **15–16 px** | 1.35 | |
| Body small | **13–14 px** | 1.3 | card copy, captions |
| Mono label | **11–12 px** | 1.4 | uppercase, +0.06em tracking |

Two families:
* **Display/UI:** a neue-grotesque with a **single-storey `g`**, double-storey `a`, angled `t` terminal
  and very tight default spacing. Best match: **PP Neue Montreal**. `HIGH-CONFIDENCE INFERENCE`
* **Micro-labels/links:** a **monospaced grotesque** (unslashed zero, straight-leg `R`), e.g.
  PP Supply Mono / Geist Mono. `HIGH-CONFIDENCE INFERENCE`

## 7. Colors

```
--bg-dark        #0E0E0E   hero, about, marquee, services scene
--bg-black       #030408   footer CTA (near-black, cool)
--bg-white       #FFFFFF   services type chapter
--bg-off         #F7F7F7   client stories (top of gradient)
--bg-grey        #BBBBBB   design-in-motion, preloader, page-transition overlay
--bg-grey-2      #DADADA   how-we-work, key-facts top
--card-dark      #2E2E2E   key-facts card 3
--card-warm      #EAE7E2   key-facts card 2
--text-hi        #F2F2F2   headings on dark
--text-mid       #AAAAAA   secondary on dark
--text-lo        #6E6E6E   mono labels on dark
--ink            #1A1A1A   headings on light
--ink-mid        #555555
--rule           rgba(255,255,255,.14) / rgba(0,0,0,.12)
--accent-ember   #E2521F   only inside the 3D scenes (glowing shard edges)
--accent-blue    #2E7BFF   only inside the 3D scenes (lightning arcs)
```
Light chapters are **vertical gradients**, not flats (e.g. Key facts runs `#DADADA → #FDFDFD`).
`OBSERVED` (pixel probe, frames 88 / 187 / 320)

## 8. Components

Full inventory in `COMPONENTS.md`. Headline items: Header, LogoLockup, PillButton, AudioToggle,
MenuOverlay, HeroScene, KineticHeadline, MonoLink, StatementBlock, Marquee, StatCard, PartnerRow,
ProjectCard, HorizontalTrack, ServicesScene, ServiceLabel, TestimonialSwitcher, CurvedGallery,
AccordionRow, ProcessStep, FooterCTA, LineWordmark, Preloader, PageTransition, CursorRing.

## 9. Navigation

Fixed header, always visible, never hides on scroll. `OBSERVED` (present in all 327 frames)

```
[logo mark + TRIONN®]  ………………………  [🔇 audio]  [LET'S TALK pill]  [MENU ≡ pill]
x=32, y=32..60                            x≈1443…1660
```
* Header inverts with the chapter behind it: on dark → white logo, filled-white "LET'S TALK", outlined
  white "MENU"; on light → black logo, filled-black "LET'S TALK", outlined black "MENU". `OBSERVED`
* Clicking MENU slides a **white panel in from the right**: x 1314…1682, top 12 → bottom 940
  (368 × 928 px, inset 12 px, small radius). Links `Work / Services / About / Contact` at ~32 px,
  revealed with a per-character stagger (frame 259 catches "Co" mid-reveal). Below them a pill
  `✦ THE TRIONN NAME STORY`; at panel bottom, BUSINESS ENQUIRY (email, phone) and SOCIAL
  (Linkedin/Facebook/Dribbble/Instagram) in two columns. MENU's icon swaps `≡ → ×`. `OBSERVED`
* Route change plays the **page transition overlay** (§15).

## 10. Interactions

* **Hero:** cursor drives a lagging **ring cursor** (~82 px, 1 px white @ ~40 %) over the canvas;
  captions read `HOLD TO 💥 BLAST` and `DARE ⚡ TO TOUCH THE LINES.` — press-and-hold explodes the
  shard cluster, hovering the wire-lines triggers blue lightning arcs. `OBSERVED` (arcs visible in
  frames 13–14; captions state the affordance)
* **Footer:** `SOUND ON ♪ HOVER THE LINES.` — the giant `TRIONN` wordmark is drawn from ~40 rows of
  horizontal hairlines that deform/sound on hover. `OBSERVED`
* **Project cards:** hover shows a pointer and a browser status-bar URL; the card image scales
  slightly. `LOW-CONFIDENCE INFERENCE` (2 FPS cannot isolate the zoom)
* **Testimonials:** left-hand client list; hovering/selecting a name moves an `→` marker to it and
  swaps the quote. Prev/next square buttons (2 × 68 px, 1 px border). `OBSERVED`
* **Tech stack rows:** `↓` affordance at the right; the open row expands to reveal two columns of
  capability lists; the closed rows show a partial underline that grows on hover. `OBSERVED`
* **Mono links:** underline + `→` that shifts right on hover. `HIGH-CONFIDENCE INFERENCE`

## 11. Animations

Full spec in `ANIMATIONS.md`. The seven signatures:

1. **Preloader** — logo mark strokes draw in, a counter ticks, then a hard cut to black.
2. **Kinetic headline** — the final word of the H1 swaps `something → depth → impact` with a
   per-glyph blur/scramble, on a ~2.5 s loop.
3. **Word-by-word statement reveal** — the about paragraph starts at ~30 % opacity and each word
   lifts to full white as the scroll passes it (scrubbed, left→right, wrapping).
4. **Marquee** — infinite `IMPACT + INSPIRE + INNOVATE +` loop, right→left, plus a scroll-velocity skew.
5. **Pinned services scene** — background white→black, type stack scales up, glyphs shatter and fall,
   a stone monolith drops in and settles, then six service labels cross-fade in alternating corners.
6. **Horizontal work track** — vertical scroll is mapped to X translation of the project cards while
   the title column stays sticky.
7. **Curved 3D gallery** — screenshots mapped onto a bent plane that sweeps horizontally, then
   flattens into a static grid at the end of the scene.

## 12. Scroll behaviour

* **Smooth/inertial scrolling.** Frame-to-frame deltas decay smoothly after a scroll burst rather than
  stopping dead (see the diff ramp in frames 042–053). `HIGH-CONFIDENCE INFERENCE` — a Lenis/locomotive-class
  smooth-scroll layer.
* **Pinned + scrubbed scenes**: services set-piece (frames 121–178, ~28 frames ≈ 14 s of scrolling
  with a locked viewport) and design-in-motion (frames 193–243). `OBSERVED`
* Native scrollbar remains visible on the right. `OBSERVED`
* Relationship model to reproduce:
  `scroll position → normalised scene progress (0…1) → GSAP timeline scrub → transform/opacity/uniform`.

## 13. Media behaviour

* Project card images: **~714 × 488 px, ratio ≈ 1.464 (≈ 3:2)**, radius ~4 px, `object-fit: cover`,
  full-colour, with the project's own hero typography baked into the image. `OBSERVED`
* Key-facts card 1/3 images: portrait, ratio ≈ 0.81 (4:5), radius ~10 px.
* Testimonial avatar: 66 × 66 px, square, radius ~2 px.
* Services detail mockups: light UI screenshots on a pale panel, ~493 × 320 px, no radius.
* The 3D scenes are `<canvas>` elements, not images.

## 14. Responsive behaviour

**NOT OBSERVABLE FROM PROVIDED MATERIAL.** All 327 frames are a single 1710 × 951 desktop viewport.
`RESPONSIVE.md` records only defensible, structure-preserving rules — do not treat them as replicated
behaviour.

## 15. Page transitions

Route change (frames 265–268, ≈ 1.5 s):
```
t0.0  click menu link
t0.0–0.4  flat grey (#BBBBBB) overlay wipes over the page, menu panel gone
t0.4–1.0  overlay holds; destination name centred in 11 px mono caps ("SERVICES");
          faint + crosshairs at ~42% / ~58% width
t1.0–1.5  overlay lifts, new page's hero is already at its entrance state
```
The overlay is visually identical to the preloader background — one shared component. `OBSERVED`

## 16. Cursor behaviour

* Default: the **native OS cursor stays visible everywhere** (arrow / pointer / grab are all visible in
  the frames). This site does **not** replace the cursor globally. `OBSERVED`
* Over the hero canvas an additional **ring follower** (~82 px, 1 px stroke, ~40 % white) trails the
  pointer with visible lag. `OBSERVED` (frames 13, 14, 16, 17, 21, 23)
* No text-in-cursor, no blend-mode invert, no magnetic buttons detected. `NOT OBSERVABLE` beyond the above.

## 17. Implementation recommendations

| Choice | Why it is needed (not "because it's popular") |
|---|---|
| **Next.js (App Router) + TypeScript** | Two real routes with a shared header/footer and an animated route transition; RSC keeps the copy-heavy sections static while the scenes stay client-only. |
| **Tailwind CSS v4** | The design is a small token set (8 colours, 9 type steps, one spacing ramp) applied thousands of times — utilities + `@theme` tokens map 1:1 onto `DESIGN-SYSTEM.md`. |
| **GSAP + ScrollTrigger** | Non-negotiable: two pinned, scrubbed multi-viewport scenes, a vertical→horizontal scroll mapping, and word-level scrubbed reveals. IntersectionObserver alone cannot scrub. |
| **Lenis** | The inertial feel is a defining property; ScrollTrigger integrates with it directly. |
| **Three.js + @react-three/fiber + drei** | Three WebGL set-pieces. R3F because scene state must be driven from React scroll progress. |
| **Motion (Framer Motion)** | Only for the menu panel and the route-transition overlay — declarative enter/exit with `AnimatePresence` is materially simpler than hand-rolled GSAP there. |
| **next/font (local)** | Self-host the display + mono faces; avoids FOUT on a type-led design. |

Deliberately **not** recommended: a carousel library (the tracks are transform-driven), a cursor
library (only one ring), any UI kit.

## 18. Portfolio adaptation strategy

| Reference | Portfolio |
|---|---|
| Preloader: logo + `INSPIRE · INNOVATE · IMPACT` | initials monogram + 3 personal keywords |
| Hero: `Designed to mean something/depth/impact.` | name/positioning line with a 3-word kinetic swap |
| About statement (studio mission) | one-sentence professional statement, same word-reveal |
| Marquee `IMPACT + INSPIRE + INNOVATE` | 3 discipline words |
| Key facts (3 stat cards + partners) | 3 stat cards (projects / years / stack) + tools-used row |
| Selected work & explorations | selected projects, same horizontal track |
| Services set-piece (kinetic stack + monolith) | skills/expertise stack — keep the whole scene |
| Client stories | testimonials, or **cut the section entirely** if none exist — do not fake quotes |
| Design in motion (curved 3D gallery) | explorations / side projects / UI shots |
| Footer CTA + `TRIONN` line wordmark | same CTA, wordmark = your name |
| /services page | /expertise page, same six-row structure |
| Technology stack accordion | actual stack, 7 categories |
| How we work | how I work, 3 steps |

**Rule:** structure, geometry, motion and rhythm are copied; every string, image, logo, name, phone,
email and social handle is replaced. The TRIONN mark, its stone-monolith render, its client logos and
its case-study screenshots must **not** be reused.

## 19. Fidelity priorities

**P0** page padding & chapter structure · type scale & the two families · header + pill nav ·
hero composition + kinetic headline · dark/light chapter inversion · statement word-reveal ·
horizontal work track · pinned services scene (even with a simplified 3D) · footer CTA · menu overlay.

**P1** preloader · route-transition overlay · marquee + velocity skew · key-facts cards ·
testimonial switcher · accordion · hero ring cursor · smooth scroll.

**P2** hero blast/lightning interaction · footer line-wordmark hover · ✦ caption lines ·
`+` crosshair rule markers · audio toggle.

**P3** exact easing curves inside the 3D scenes · the 1.0x recorder pill (a capture artifact — ignore).

---

### Capture artifacts — do not reproduce
* The rounded-corner window frame and the right-hand scrollbar are browser chrome.
* The `1.0x` pill (bottom-right, light frames) and the bottom-left URL tooltip are recorder/browser UI.
* Horizontal black/white banding in frames 076–079, 178–181, 243–244, 284–285, 320–322 is **screen
  tearing during fast scrolling**, not a slat transition. `HIGH-CONFIDENCE INFERENCE` (bands show two
  different scroll offsets of the same content).
