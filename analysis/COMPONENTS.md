# COMPONENTS — Inventory from the reference

Every component below was seen in the frames. Nothing is listed because it is "common on websites".
Dimensions are CSS px at a 1710 px viewport.

---

## 1. Header
**Purpose** persistent global navigation.
**Structure** `<header>` fixed; flex row, `justify-between`, `align-center`; left = LogoLockup;
right = AudioToggle + PillButton("LET'S TALK") + PillButton("MENU ≡").
**Dimensions** full width; controls band y 32 → 60 (28 px tall); z above everything except the menu
panel and the transition overlay.
**Position** `position: fixed; top: 0; left: 0; right: 0; padding: 32px;`
**Typography** `nav-pill` 13 px mono-ish caps, +0.02 em.
**Spacing** logo x = 32; audio chip x ≈ 1443; gap chip→pill 12; gap pill→pill 12; MENU right edge 1660.
**Colors** inverts with the chapter behind it — dark chapter: white logo / white filled pill / white
1 px outlined pill. Light chapter: black logo / black filled pill / black 1 px outlined pill.
**Default → Hover** pills invert fill/ink on hover `LOW-CONFIDENCE INFERENCE`.
**Animation** colour inversion crossfades over ~0.3 s as a chapter boundary crosses y = 46.
**Mobile** NOT OBSERVABLE.

## 2. LogoLockup
Mark (angular tri-stroke monogram, ~26 × 22) + wordmark `TRIONN` (~72 × 14) + superscript `®`.
Total ≈ 102 × 28 at x 32, y 32. Single colour, flips black/white with the chapter. SVG.
**Portfolio:** replace with your own monogram + name; keep the mark+wordmark+® proportions.

## 3. PillButton
**Structure** `<a>`; inline-flex, centred; optional trailing icon (`≡`, `×`, `✦`).
**Dimensions** height 28, radius 999, padding 0 16 (LET'S TALK ≈ 125 × 28; MENU ≈ 92 × 28).
**Variants** `filled` (LET'S TALK — solid, inverted ink) · `outline` (MENU — transparent, 1 px border)
· `ghost-pill` (✦ THE TRIONN NAME STORY, inside the menu panel, 1 px border on white).
**Typography** 13 px uppercase, +0.02 em.
**Transition** `background/color 0.3s var(--e-out)`.

## 4. AudioToggle
28 px circle, `rgba(255,255,255,.12)` on dark / `rgba(0,0,0,.08)` on light, containing a 14 px
muted-speaker glyph. Sits immediately left of LET'S TALK. Toggles site audio (the footer says
`SOUND ON ♪`). `OBSERVED` — the icon is struck-through (muted) in all frames.

## 5. MenuOverlay
**Purpose** primary navigation panel.
**Structure** white panel anchored right; nav list; pill; contact block; social block.
**Dimensions** 368 × 928, inset 12 px from the viewport's top/right/bottom, radius 6.
**Position** `position: fixed; right: 12px; top: 12px; bottom: 12px;`
**Typography** links `title-lg` 32 px sentence case, 36 px pitch; block labels `label-mono` 12 px
(`BUSINESS ENQUIRY`, `SOCIAL`); contact/social values 15 px.
**Spacing** links start at x 1341 (29 px panel padding) and y 270; pill 32 px below the list;
contact block anchored to the panel bottom, social below it, 2 columns.
**Colors** `#FFFFFF` panel, `#0B0B0B` text, `#8A8A8A` labels.
**Animation** panel slides in from `x: 100%` over ~1.0 s `--e-out`; links reveal with a
**per-character stagger** (frame 259 catches "Contact" as "Co"); MENU icon morphs `≡ → ×`.
**Exit** reverse; a route click hands off to PageTransition instead.

## 6. Preloader
Full-screen `--bg-grey`. Centred 195 × 195 square, 1 px rule, `×` ticks at its four corners; the logo
mark animates inside (strokes/planes assembling). Caption `INSPIRE · INNOVATE · IMPACT` in 12 px caps,
28 px below the square. A numeric counter in 11 px mono at y ≈ 878 (bottom-centre).
**Exit** hard cut to black (frames 005 → 006), then the hero canvas fades up. Total visible ≥ 2.5 s.

## 7. PageTransition
Full-screen `--bg-grey` overlay; destination name centred in 11–12 px mono caps; two faint `+`
crosshairs at ~42 % / ~58 % of the width, on the vertical centre line. ~1.5 s total. Shares its
surface with Preloader.

## 8. HeroScene (WebGL)
**Purpose** the hero's living background.
**Structure** full-viewport `<canvas>` behind the hero text layer; a cluster of dark faceted metal
shards forming the logo monogram, slowly rotating; thin wire-lines cross the whole viewport; ember
rim-light `#E2521F`; blue lightning arcs `#2E7BFF` on line hover.
**Interaction** pointer parallax; `HOLD TO 💥 BLAST` (press-hold explodes the cluster);
`DARE ⚡ TO TOUCH THE LINES.` (hover spawns arcs).
**Cursor** a lagging 82 px ring, 1 px `rgba(255,255,255,.40)`, only over this canvas.
**Exit** the cluster keeps rotating and drifts behind the About chapter (still faintly visible in
frame 48) — the canvas persists across the first two chapters. `OBSERVED`

## 9. KineticHeadline
**Structure** `<h1>` with a static prefix and a swapping final word.
**Dimensions** hero: 2 lines, x 32 → 954, y 112 → 258.
**Typography** `display-hero` 76 / 0.98 / −0.02 em, `--text-hi`.
**Animation** the last word cycles `something → depth → impact` on a ~2.5 s loop; each swap is a
per-glyph blur + vertical micro-shift (frames 017–018, 023–024, 028–029 catch mid-swap states).
Word widths differ, so the line reflows — the swap must not shift the preceding words: use an
inline-block with the outgoing word absolutely positioned during the crossfade.

## 10. MonoLink
Uppercase mono label + right-aligned `→`, with a 1 px underline spanning the full component width.
Sizes seen: 208 × 28 (`DISCUSS YOUR PROJECT`), 210 × 28 (`BOOK A 30-MINUTE CALL`),
168 × 28 (`VIEW ALL PROJECTS`), 183 × 28 (`EXPLORE PROJECT`), 168 × 28 (`BECOME A CLIENT`),
178 × 28 (`VIEW SERVICES`), 173 × 28 (`VIEW ON DRIBBBLE`), 168 × 28 (`MORE ABOUT US`).
Label sits ~10 px above the rule; arrow flush right. Hover: arrow translates +6 px, rule brightens.
`HIGH-CONFIDENCE INFERENCE`

## 11. StatementBlock
**Purpose** the big scroll-revealed paragraph (about / focused-disciplines).
**Structure** `label-mono` at x 32 (`ABOUT`) + a 3-line 72 px statement indented to x ≈ 171 + a
full-width hairline with `+` at midpoint + a two-column support row (left: 3-line mono caps note at
x 171; right: 16 px mission paragraph at x 1133, ~330 px wide, with a MonoLink beneath).
**Animation** every word starts at `--text-mid` and animates to `--text-hi`, **scrubbed** left→right
by scroll (frames 031–056 show the wipe crossing the block over ~25 frames).

## 12. Marquee
Full-bleed band, ~120 px uppercase at 30 % white, items joined by ` + `, translating right→left
infinitely. A fixed `label-mono` sits top-left of the band (`FOCUSED VISION. / MEASURED EXECUTION.`)
and a ✦ caption bottom-centre (`✦ FROM IDEA TO OUTCOME.`). Speed ≈ 90 px/s at rest; adds a
scroll-velocity-driven skew/speed boost. `HIGH-CONFIDENCE INFERENCE`

## 13. StatCard (Key facts)
**Dimensions** 330 × 407, radius 10, three across in a 1032 px centred container, 20 px gaps.
**Variants**
* *image card* — full-bleed portrait photo, `label-mono` caption top-centre (`FEATURED & AWARDS`),
  a 28 px mark bottom-left (`W.`), 14 px 2-line copy bottom-left, and a **48 px numeral with a
  superscript `+`** bottom-right (`50⁺`).
* *centre card* — `--card-warm` background, `label-mono` top-centre, a **190 px white circle** with
  `1.5K⁺` at 40 px inside it, 14 px 2-line copy bottom-centre.
* *dark card* — `--card-dark`, `label-mono` top-centre, inset 266 × 220 image, copy bottom-left,
  numeral `20⁺` bottom-right.
**Animation** cards rotate up from `rotateX: −70°`, hinged on their top edge under a perspective
shared across the grid, fading in with a ~0.145 s left→right stagger as the section enters
(frames 081–085). See `ANIMATIONS.md` §A08 for the measurements — this is a 3D rotation, not the
rise/scale-fade previously recorded here.

## 14. PartnerRow
`label-mono` centred (`OUR BUSINESS PARTNERS`), then 5 wordmarks in a centred row with 1 px vertical
dividers between them; row width ≈ 690, item height ~22, dividers full-height 28 px hairlines.

## 15. ProjectCard
**Structure** image (714 × 488, radius 4, `object-fit: cover`) → 24 px title → 14 px 2-line
description (max ~330 px) → MonoLink `EXPLORE PROJECT →` right-aligned on the description's baseline row.
**Spacing** image → title 40; title → description 12; card → card 60 (horizontal).
**Hover** pointer cursor; status-bar URL; slight image scale. `LOW-CONFIDENCE INFERENCE`

## 16. HorizontalTrack (Selected work)
Left column is **sticky**: `display-lg` 2-line heading at x 100, y 412, plus `VIEW ALL PROJECTS →`.
A 1 px vertical divider at x ≈ 730 separates it from the track. The right side is a flex row of
ProjectCards translated on X in proportion to vertical scroll (frames 096–120: 4 projects pass).
Cards enter from beyond the right edge and exit past the divider.

## 17. ServicesScene (pinned WebGL set-piece)
Persistent chrome for the whole scene: `label-mono` `OUR SERVICES` top-centre (y 107); ✦ caption
bottom-centre (y 868) whose text changes between phases; `VIEW SERVICES →` bottom-right (x 1494).
Stage: the kinetic type stack, then a stone monolith (~578 × 590, embossed monogram) in volumetric
smoke, then the ServiceLabel pairs. Background animates `#FFFFFF → #0E0E0E` across the scene.

## 18. ServiceLabel
A 2-line 30 px title + a 3-line 14 px description (~250 px wide) + a 24 px line-art icon offset to the
side of the title. Appears in **diagonal pairs**: one at top-left (x 223, y 128) and one at
bottom-right (x 1115, y 640), then cross-fades to the next pair. Six labels total:
AI & Intelligent Automation · Website & Mobile Design · Web Development · WordPress Development ·
Product Design · Branding.

## 19. TestimonialSwitcher
**Left column** (x 171): list of client names, 14 px caps, 28 px pitch; inactive `--ink-lo`,
active `--ink` with a trailing `→`. **Right column** (x 857): 26 px quote (max ~640 px), 48 px gap,
then a 66 px avatar + name (16 px) + role·country (15 px, muted), then `BECOME A CLIENT →`.
**Controls** two 68 × 68 outlined square buttons (`←`, `→`) at x 171, y 653.
**Header** `display-lg` "Client stories" at x 171 y 115 + a 3-line 14 px note at x 857;
a full-width hairline with `+` marker below at y 247.

## 20. CurvedGallery (Design in motion, WebGL)
Split display heading `DESIGN IN` (top-left-ish) / `MOTION` (offset right) at ~96 px with a 12 px
mono note between them; a bent/arced plane carrying ~10 website screenshots sweeping horizontally as
you scroll; at the end of the scene it flattens into a static 2-row grid (frames 235–241).
Bottom-left 16 px 3-line description; bottom-right `VIEW ON DRIBBBLE →`.

## 21. AccordionRow (Technology stack)
96 px tall row: index `1.`–`7.` at x 32 (30 px), title at x 583 (30 px), `↓` at x 1656; 1 px rule
below each row. Open state pushes a two-column body above the rule: `label-mono` category headers
(`AI PLATFORMS & APIS`, `AI CAPABILITIES`) at x 583 / x 1097 with 14 px item lists, 20 px pitch.
Closed rows show a partial-width underline that grows on hover.

## 22. ProcessStep
`label-mono` `STEP - 1` → 28 px title → 14 px 3-line description (max ~305 px). Three columns at
x 307 / 713 / 1118, i.e. a 405 px pitch. Section header: `OUR PROCESS` label at x 32,
`How we work` `display-lg` at x 307, and a 2-line 14 px note beneath it.

## 23. FooterCTA
`LET'S BUILD WORK THAT INSPIRES.` label at x 32 y 123, with a live local time at the right
(`IST → 13:05`). `display-lg` 2-line question at x 32 y 158→300. Right cluster at x 1145:
two MonoLinks side by side, then `BUSINESS ENQUIRY` (E./P.) and `SOCIAL` (4 links) in two columns.
Bottom-left: `©TRIONN® 2026` and `SOUND ON ♪ HOVER THE LINES.`

## 24. LineWordmark
The lower ~55 % of the footer is a giant `TRIONN` rendered as **~40 rows of horizontal hairlines**
of varying lengths (a scanline/waveform reading of the letterforms) over the smoke canvas. Hovering
the lines deforms them and drives audio. Rows start at y 540 with ~18 px pitch, 1 px, low-opacity white.

## 25. CursorRing
82 px circle, 1 px `rgba(255,255,255,.40)`, `pointer-events:none`, lerped toward the pointer
(~0.12 factor → visible lag of ~10 px at normal speed). **Hero canvas only** — the native cursor is
never hidden anywhere on the site.

## 26. RuleWithCrosshair
Full-width (page-padded) 1 px rule with a 9 px `+` glyph centred on it. Used to close the About and
Client-stories headers, and as a decorative marker at section boundaries.
