@AGENTS.md

# CLAUDE.md — Implementation instructions

## Primary objective

Reproduce the reference website's UI with **high visual fidelity**, replacing its content with the
owner's portfolio content.

**Reference:** `https://trionn.com` — TRIONN studio site.
**Evidence:** 327 frames at `Trion Frames/frame_0001…0327.jpg` (2 FPS, 3420 × 1902 @2×,
CSS viewport 1710 × 951). Contact sheets: `analysis/atlas/atlas-01…07.jpg`.

The reference is the **design authority**. The portfolio content is the **content authority**.
When in doubt, ask "how do I reproduce the reference here?", never "how would I design this?".

## Read before implementing

1. `analysis/BLUEPRINT.md` — master spec (layout, grid, spacing, colours, nav, scroll, priorities)
2. `analysis/DESIGN-SYSTEM.md` — tokens: colour, type scale, spacing, radii, motion
3. `analysis/COMPONENTS.md` — component inventory with dimensions and states
4. `analysis/ANIMATIONS.md` — motion spec A01–A18
5. `analysis/PAGES.md` — section-by-section geometry
6. `analysis/FRAME-MAP.md` — what happens in which frames
7. `analysis/RESPONSIVE.md` — what is observed vs. what we decided
8. `analysis/REPLICATION-CHECKLIST.md` — the definition of done

## Rules

* Do **not** redesign the reference. Do not "improve" spacing, colour or hierarchy.
* Do **not** simplify important interactions. Do **not** replace a complex animation with a generic
  fade — especially not A05 (scrubbed word reveal), A09 (horizontal track), A10 (pinned services
  scene), A12 (curved gallery) or A18 (per-glyph blur-resolve).
* If a WebGL scene must be reduced in scope, keep its **composition, timing and outcome** and say so
  explicitly in the PR/summary. Never silently downgrade.
* Preserve the measured geometry: 32 px page padding, the 1032 px centred container for Key facts,
  the ~330 px body measure, the 1 px hairlines, the 28 px pill height.
* Preserve the type system: weight 400 display only, tight tracking, sentence case for display,
  uppercase reserved for mono micro-type and the kinetic/marquee stacks.
* **No accent colour in the UI layer.** Colour exists only inside the 3D scenes.
* Keep animations performant: animate `transform`/`opacity` only, `will-change` sparingly, one GSAP
  context per scene with proper cleanup, no layout thrash inside scroll handlers.
* Accessibility: real semantic landmarks and heading order, visible focus rings,
  `prefers-reduced-motion` fallbacks for every animation in `ANIMATIONS.md`, `aria-expanded` on the
  accordion and menu, captions/alt text for all imagery. The native cursor must stay visible (the
  reference keeps it).
* Do **not** copy brand-specific content or assets: the TRIONN name, monogram, wordmark,
  stone-monolith render, client logos, testimonials or project screenshots must not appear anywhere.
* Sections with no genuine content (e.g. testimonials) are **removed**, never filled with invented
  quotes, fake clients or placeholder logos presented as real.

## Technology

```
Next.js (App Router) + TypeScript      two routes, shared chrome, animated route transition
Tailwind CSS v4 (@theme tokens)        tokens map 1:1 onto analysis/DESIGN-SYSTEM.md
GSAP + ScrollTrigger                   pinned + scrubbed scenes; nothing else can scrub
Lenis                                  the inertial scroll feel is part of the design
three + @react-three/fiber + drei      the three WebGL set-pieces
motion (Framer Motion)                 menu panel + route-transition overlay only
next/font/local                        self-hosted display + mono faces
```
Do not add libraries beyond these without stating why in the summary. No carousel library, no cursor
library, no UI kit.

## Structure

```
src/
├── app/
│   ├── layout.tsx            Header, MenuOverlay, PageTransition, Lenis provider
│   ├── page.tsx              Home
│   ├── expertise/page.tsx    Services-equivalent
│   ├── fonts/                self-hosted General Sans
│   └── globals.css           @theme tokens
├── components/
│   ├── chrome/               Header, Logo, Monogram, PillButton, AudioToggle, MenuOverlay,
│   │                         Preloader, PageTransition, CursorRing, SmoothScroll, ChapterTheme
│   ├── primitives/           MonoLink, Rule, BlurText, WordReveal, KineticHeadline
│   ├── home/                 Hero, Statement, Marquee, KeyFacts, SelectedWork,
│   │                         ServicesScene, ClientStories, DesignInMotion, FooterCta
│   ├── expertise/            ExpertiseHero, ServiceRow, TechStack, HowIWork, ServiceIcon
│   └── three/                HeroMonogram, MonolithScene, CurvedGallery, monogramContours
├── animations/               easings.ts
├── hooks/                    useMediaQuery, useReducedMotion, useClientFlag
├── lib/                      utils.ts
└── data/                     site, projects, stats, services, stack, process, explorations,
                              testimonials
```
All copy lives in `src/data/` — no hard-coded strings in components.

## The RA monogram

The owner's mark appears in three places and **must be the same shape in all of them**:
the header lockup, the preloader, and the 3D hero mark.

`src/components/three/monogramContours.ts` is the single source of truth. It is **generated** —
do not hand-edit it. It holds the mark auto-traced from the source artwork by
`scripts/trace-monogram.py` (sub-pixel marching squares on the anti-aliased grayscale, then
Douglas-Peucker at 0.4 px), so the letterforms, the bowl's curve and the interlace breaks are the
artwork's own. The mark is exactly three disjoint pieces with no holes — the interlace breaks
separate them.

`components/chrome/Monogram.tsx` renders those contours as three filled SVG paths;
`components/three/HeroMonogram.tsx` extrudes the same contours. Never redraw the mark by hand, and
never add strokes, grooves or connecting lines to it.

To regenerate: `python3 scripts/trace-monogram.py path/to/artwork.png`.

## The hero sky

`components/three/ConstellationField.tsx` renders the twelve zodiac constellations along a true
ecliptic band, from real J2000 coordinates in `zodiacData.ts`. Aries — the owner's sign — is the one
asterism drawn with lines; the rest contribute stars only, so their exact geometry is never legible
as a shape.

It is deliberately subordinate to the mark, and three rules keep it there. Do not relax them without
re-measuring:

1. **Visual mass, not peak brightness.** Stars may out-peak the mark — in a real sky they are the
   brightest points in frame, and that is what makes them read as stars. What keeps the sky
   subordinate is how little of the frame it lights. Measure that, not peaks: currently the mark
   carries ~4.5× the sky's total light and lights ~16% of its own area against the sky's ~0.5%.
   An earlier version capped peak brightness below the mark's and was invisible on a dimmed laptop
   screen — a rigorous-sounding metric optimised to the point of deleting the feature.
2. **Clear zone.** Stars within a screen-space radius of the mark are dropped, not dimmed, so it
   always sits in empty sky.
3. **Layer order by brightness.** The deep field is the faintest layer, then catalogued stars by
   magnitude, then the featured sign, then its lines. Brightness must track magnitude: Hamal
   (mag 2.0) leads Aries, not 41 Arietis (mag 3.63).
4. **Richness comes from density, not level.** ~730 deep-field stars carry only ~9% more total light
   than the 46 that preceded them, because each one is far fainter. If the sky looks thin, add
   stars — do not turn the existing ones up.

## Visual validation loop — mandatory

For every section, before ticking it in `REPLICATION-CHECKLIST.md`:

```bash
npm run dev                                          # shell 1
npm run shot -- '[{"name":"04-keyfacts","path":"/","scroll":2750}]'   # shell 2
npm run verify                                       # mobile / reduced-motion / error sweep
```
Screenshots land in `analysis/_shots/` at exactly **1710 × 951**, the reference capture viewport, so
they compare 1:1 against `Trion Frames/frame_XXXX.jpg` and the half-res crops in `analysis/_work/`.
See `scripts/README.md`. Then: open the named reference frame → compare geometry / typography /
colour / motion → list the differences → fix → re-shoot.

**Freezing the hero mark.** `/?markTime=<seconds>` pins the 3D monogram's animation clock and drops
the pointer term, so a screenshot always reproduces the same orientation. Use it to regression-test
the angles where a rotating extruded logo is hardest to light — `4.62` is the positive peak of the
swing, `13.9` the negative one, `0` face-on. Do not judge the mark by whatever angle a screenshot
happens to catch; both dead angles found so far were missed exactly that way.

Compare specifically: element x/y and width/height, margins and padding, font size / line-height /
tracking / wrapping, colours and gradients, image crop and radius, and — by scrubbing the reference
frames — animation direction, order, stagger and end state.

"Looks close" is not close enough. Measure against the frame.

## Priorities

**P0** chapter structure · page padding · type scale + two families · header & pills · hero
composition + kinetic headline · chapter inversion · scrubbed statement reveal · horizontal work
track · pinned services scene · footer CTA · menu overlay · smooth scroll · per-glyph blur-resolve.

**P1** preloader · route transition · marquee · key facts · testimonials · accordion · curved gallery ·
ring cursor · reduced-motion fallbacks.

**P2** hero blast/lightning · footer line-wordmark hover · ✦ captions · `+` crosshairs · audio toggle.

**P3** exact in-scene easing curves.

## Capture artifacts — never reproduce

The rounded browser window frame, the right-hand scrollbar, the `1.0x` recorder pill, the bottom-left
URL tooltip, the screen-share bar in frames 325–327, and the horizontal tearing bands in frames
076–079 / 178–181 / 243–244 / 284–285 / 320–322.

## Content status

**Portfolio content has not been supplied.** Everything in `src/data/` marked `TODO` or
"PLACEHOLDER" is scaffolding. Do not invent projects, testimonials, statistics, clients, employers or
contact details — ask the owner.

* `src/data/testimonials.ts` is **empty on purpose**; `ClientStories` renders nothing until real,
  attributable quotes exist. Do not populate it with samples.
* Project, stat and exploration images are unset and render as labelled tint blocks.
* The name and email came from this repository's git config, not from the owner directly — confirm.

## Decisions already made (do not re-litigate)

* Display face: **General Sans** (Fontshare, free), self-hosted in `src/app/fonts/`. Swap in
  PP Neue Montreal by replacing those files and the `localFont` src list in `app/layout.tsx`.
  (The owner has since downloaded PP Neue Montreal — offer the swap.)
* All three WebGL set-pieces are **real R3F scenes**. Only the monogram uses the owner's artwork;
  the monolith and gallery use original geometry and procedural textures — no reference assets.
* The hero mark **swings within ±35° rather than spinning 360°**: an extruded flat logo reads as a
  blank slab edge-on, and the identity has to stay legible.
* Every reference section is kept, including the expertise route.
