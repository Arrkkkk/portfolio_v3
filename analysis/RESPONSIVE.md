# RESPONSIVE — What can and cannot be claimed

## Status: NOT OBSERVABLE FROM PROVIDED MATERIAL

All 327 frames are one desktop viewport: **1710 × 951 CSS px** (3420 × 1902 @2×). There are no
tablet frames, no mobile frames, no window-resize events, and no live site was inspected.

Therefore the following are **unknown**:
* breakpoint values
* how the horizontal work track behaves on touch
* whether the pinned services scene is pinned, simplified, or replaced on small screens
* whether the WebGL scenes render at all on mobile
* the mobile menu (the desktop menu is already a slide-in panel, so it may simply be reused)
* mobile type sizes, and whether the display face uses `clamp()` or fixed steps
* image `sizes`/art-direction

**Do not invent reference behaviour here and do not present the rules below as replication.**

---

## Defensible rules for the portfolio build

These preserve the observed desktop design and follow from it; they are *our* decisions, labelled as
such, and they are the only responsive claims the implementation should make.

### Breakpoints
```
mobile     < 640
tablet     640 – 1023
laptop     1024 – 1439
desktop    ≥ 1440     ← the observed design lives here; treat 1710 as the reference width
```

### Container & spacing
| Token | ≥1440 | 1024–1439 | 640–1023 | <640 |
|---|---|---|---|---|
| page padding | 32 | 32 | 24 | 20 |
| centred container | 1032 | 100% − 64 | 100% − 48 | 100% − 40 |
| section top/bottom | 120 | 96 | 80 | 64 |

### Typography (fluid, anchored to the measured desktop values)
```css
--fs-hero:    clamp(40px, 4.45vw, 84px);   /* 76px at 1710 */
--fs-display: clamp(34px, 4.20vw, 78px);   /* 72px at 1710 */
--fs-kinetic: clamp(48px, 6.50vw, 120px);  /* 112px at 1710 */
--fs-marquee: clamp(56px, 7.00vw, 130px);  /* 120px at 1710 */
--fs-title:   clamp(22px, 1.75vw, 32px);
--fs-body:    16px;      /* do not scale down below 15px */
--fs-small:   14px;
--fs-label:   12px;
```
Line-heights stay fixed (0.98 / 1.04 / 0.80 / 1.35) — the tightness is part of the identity.
Below 640, allow hero line-height to relax to 1.05 to avoid ascender/descender collisions.

### Layout collapse
| Section | ≥1024 | <1024 |
|---|---|---|
| Header | logo + audio + 2 pills | logo + MENU pill only (drop LET'S TALK and the audio chip) |
| About statement | statement indented, 2-col support row | statement flush left, support row stacks |
| Key facts | 3 columns | 1 column, cards full-width, aspect 4:5 preserved |
| Selected work | sticky title + horizontal track | title on top, cards stack vertically, full-width images |
| Services set-piece | pinned 3D, ~400vh | unpinned: type stack, then a static monolith image, then the six labels as a stacked list |
| Client stories | 2 columns | quote first, client list becomes a horizontal chip row |
| Design in motion | curved 3D arc | 2-column static grid of the same screenshots |
| Service detail rows | 50/50 split | image above copy, divider becomes horizontal |
| Tech stack | 3-zone row | index + title on one line, `↓` right; body stacks to 1 column |
| How we work | 3 columns | 1 column |
| Footer CTA | headline left / links right | stacked; line-wordmark scales to fit width |
| Menu panel | 368 px right panel | full-screen panel |

### Interaction degradation
* Ring cursor, hover-the-lines and hold-to-blast: **pointer: fine only**
  (`@media (hover: hover) and (pointer: fine)`).
* Horizontal track on touch: fall back to vertical stacking rather than a swipe carousel — the
  reference's effect depends on scroll-scrubbing that does not translate to touch.
* Respect `prefers-reduced-motion`: disable A05 scrubbing (show final state), A07 marquee,
  A10/A12 scene scrubs (show the settled frame), and A18 blur-resolve (fade only).

### WebGL policy (our decision)
Render the three scenes only when: viewport ≥ 1024, `pointer: fine`, WebGL2 available, and
`prefers-reduced-motion: no-preference`. Otherwise render a static poster image of the settled scene
state so the composition and rhythm survive.
