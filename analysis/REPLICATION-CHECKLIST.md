# REPLICATION-CHECKLIST

Tick an item only after the **visual-validation loop** (implement → run → screenshot at 1710 × 951 →
compare against the named frame → fix → re-shoot). Reference frames are given for each item.

## LAYOUT
- [x] Page padding 32px left/right *(f13, f48, f248)* — **P0**
- [x] Full-bleed fluid container as the default *(f13)* — **P0**
- [x] Centred 1032px container for Key facts only *(f88)* — **P1**
- [x] Vertical divider at x 730 in Selected work *(f100)* — **P0**
- [x] Vertical divider at 50% in service detail rows *(f286)* — **P1**
- [x] Section min-height 100vh, chapters ≥ 1 viewport *(all)* — **P0**
- [x] Body copy measure capped at ~330px *(f48, f320)* — **P0**
- [x] Hairline rules 1px + `+` crosshair at midpoint *(f48, f187)* — **P2**

## TYPOGRAPHY
- [x] Display family: single-storey `g` neue-grotesque *(f13 headline crop)* — **P0**
- [x] Mono family for all micro-labels and links *(f13 links crop)* — **P0**
- [x] Weight 400 only for display type — no bold headings *(all)* — **P0**
- [x] Hero 76px / lh 0.98 / −0.02em *(f13)* — **P0**
- [x] Display statement 72px / lh 1.04 *(f48, f248)* — **P0**
- [x] Kinetic stack ~112px / lh 0.80, uppercase *(f130)* — **P0**
- [x] Marquee ~120px, 30% opacity *(f70)* — **P1**
- [x] Body 16px / 1.35, small 14px / 1.3 *(f48, f320)* — **P0**
- [x] Mono label 12px / +0.06em uppercase *(f48, f130)* — **P0**
- [x] Manual line breaks in headlines (no auto-wrap) *(f13, f100, f248)* — **P0**

## COLOR
- [x] `#0E0E0E` dark chapters *(f13, f48)* — **P0**
- [x] `#030408` footer *(f248)* — **P1**
- [x] Light chapters are vertical gradients, not flats *(f88, f187)* — **P1**
- [x] `#BBBBBB` for preloader, route overlay and Design-in-motion *(f3, f267, f205)* — **P1**
- [x] **No accent colour anywhere in the UI layer** *(all)* — **P0**
- [x] Ember/blue accents confined to the 3D scenes *(f13, f26)* — **P2**

## COMPONENTS
- [x] Header fixed, never hides, inverts per chapter *(f13 vs f100)* — **P0**
- [x] Logo lockup: mark + wordmark + ® , ~102 × 28 at x32/y32 *(f13)* — **P0**
- [x] Pills 28px tall, radius 999, filled + outline variants *(f13, f100)* — **P0**
- [x] Audio toggle chip *(f13)* — **P2**
- [x] MonoLink: label + `→` + full-width 1px underline *(f13, f100)* — **P0**
- [x] Menu panel 368 × 928, inset 12px, right-anchored *(f259)* — **P0**
- [x] Preloader with framed square + `×` ticks + counter *(f3)* — **P1**
- [x] Route-transition overlay with destination label *(f267)* — **P1**
- [x] Stat cards 330 × 407, radius 10, gap 20, three variants *(f88)* — **P1**
- [x] Partner row with hairline dividers *(f88)* — **P2**
- [x] Project card: 714 × 488 image + title + desc + EXPLORE link *(f100)* — **P0**
- [x] Service labels in diagonal pairs with line-art icons *(f170)* — **P1**
- [ ] Testimonial switcher: name list + quote + avatar + ←/→ *(f187)* — **P1**
- [x] Accordion rows 96px, index/title/`↓` zones *(f313)* — **P1**
- [x] Process steps, 3 columns, 405px pitch *(f320)* — **P1**
- [x] Footer CTA with live local clock *(f248)* — **P1**
- [x] Line-wordmark from ~40 hairline rows *(f248)* — **P2**

## INTERACTION
- [x] Native cursor stays visible site-wide *(all)* — **P0**
- [x] Ring cursor over the hero canvas only, with lag *(f13)* — **P1**
- [x] Header colour inversion at chapter boundaries *(f70 → f88)* — **P0**
- [x] Menu open/close with `≡ ↔ ×` morph *(f259)* — **P0**
- [x] MonoLink hover: arrow shifts right *(inferred)* — **P2**
- [ ] Testimonial name hover moves the `→` marker *(f187)* — **P2**
- [x] Accordion row expand/collapse *(f313)* — **P1**
- [ ] Hero hold-to-blast / hover-the-lines *(f13 captions)* — **P2**
- [ ] Footer hover-the-lines *(f248 caption)* — **P2**

## ANIMATION
- [x] **A18 per-glyph blur-resolve on every major heading** — the site's motion signature *(f11, f79, f180, f244)* — **P0**
- [x] A01 preloader assembly + hard cut to black *(f1–f6)* — **P1**
- [x] A02 hero entrance *(f7–f13)* — **P0**
- [x] A03 kinetic word cycle, no reflow of preceding words *(f13–f29)* — **P0**
- [x] A05 scrubbed word-by-word statement reveal *(f31–f56)* — **P0**
- [x] A06 chapter luminance inversion *(f76–f80)* — **P0**
- [x] A07 marquee loop + velocity response *(f57–f78)* — **P1**
- [x] A08 stat-card staggered entrance *(f81–f85)* — **P1**
- [x] A09 vertical→horizontal scroll mapping with sticky title *(f96–f120)* — **P0**
- [x] A10 pinned services scene, all six phases *(f121–f178)* — **P0**
- [x] A12 curved gallery sweep → flatten *(f193–f243)* — **P1**
- [x] A13 line-wordmark row draw *(f247–f252)* — **P2**
- [x] A14 menu panel + per-character link stagger *(f254–f264)* — **P0**
- [x] A15 route transition *(f265–f268)* — **P1**
- [x] A16 capability-line underline draw *(f290–f293)* — **P2**
- [x] A17 accordion staggered rule-draw *(f313–f315)* — **P2**
- [x] Smooth/inertial scrolling throughout *(f42–f53)* — **P0**
- [x] `prefers-reduced-motion` fallbacks for all of the above — **P1**

## RESPONSIVE  *(our rules — not observed in the reference; see RESPONSIVE.md)*
- [x] Desktop ≥1440 matches the reference at 1710 × 951
- [x] Laptop 1024–1439 preserves every section structurally
- [x] Tablet 640–1023 collapse rules applied
- [x] Mobile <640 collapse rules applied
- [x] WebGL gated on viewport / pointer / WebGL2 / reduced-motion, with static posters as fallback

## OUTSTANDING — needs real content or a deliberate decision
- [ ] Testimonial switcher renders nothing (`src/data/testimonials.ts` is empty by design)
- [ ] Project images, stat figures, exploration screenshots and social links are placeholders
- [ ] Hero blast / hover-the-lines and footer hover-the-lines have no audio layer
- [ ] `/work/<slug>`, `/about`, `/contact` routes are linked but not built (never observed in the reference)
- [ ] Header on <1024 keeps the LET'S TALK pill (RESPONSIVE.md proposed dropping it — it currently fits)

## CONTENT REPLACEMENT
- [x] No TRIONN name, monogram, wordmark, ® lockup or stone-monolith render reused
- [x] No TRIONN client logos, testimonials, project screenshots or Dribbble shots reused
- [ ] All copy, contact details and social links replaced with the portfolio owner's
- [x] Sections with no real content (e.g. testimonials) removed rather than filled with fabrications


---

## Status — first implementation pass

Verified in the loop at 1710 × 951 against the named frames (`npm run shot`, output in
`analysis/_shots/`), with `npm run verify` covering mobile, reduced motion and runtime errors.
`next build`, `tsc --noEmit` and `eslint --max-warnings=0` all pass.

Hero mark: the reference's hero object is TRIONN's own monogram rendered as 3D shards, so the
content mapping is the owner's RA monogram — auto-traced from their artwork
(`scripts/trace-monogram.py`) and extruded. It swings within ±35° rather than spinning, because an
extruded flat logo reads as a blank slab edge-on. The same traced contours drive the header lockup
and the preloader, so the mark is identical everywhere.

Known deltas from the reference, accepted for now:
* The display face is **General Sans**, not PP Neue Montreal — slightly wider, so long
  headlines run ~2% longer than the reference at the same size.
* The hero cluster and the services monolith are **original geometry with procedural
  textures**, not the reference's authored 3D assets. Composition, scale, staging and
  scrub timing follow the frames; surface detail does not.
* The route-transition overlay plays over the *incoming* page (App Router commits
  navigation first). See `src/components/chrome/PageTransition.tsx`.
* Durations under ~0.5s are tuned by eye — the 2 FPS source cannot resolve them.
