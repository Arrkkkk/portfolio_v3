# PAGES — Section-by-section reconstruction

Coordinates are CSS px at 1710 × 951.

---

# HOME  `/`

```
Home
├── Preloader (overlay)
├── Header (fixed, global)
├── 01 Hero                     dark   100vh
├── 02 About statement          dark   ~120vh
├── 03 Marquee                  dark   ~60vh
├── 04 Key facts                light  ~110vh
├── 05 Selected work            light  pinned, ~300vh
├── 06 Collection CTA           light  ~80vh
├── 07 Services set-piece       white→dark, pinned ~400vh
├── 08 Client stories           light  ~110vh
├── 09 Design in motion         grey   pinned ~350vh
└── 10 Footer CTA               black  ~100vh
```

## 01 Hero — frames 006–030
**Purpose** positioning statement + two primary CTAs, over the signature 3D scene.
**Layout** full-bleed canvas; text overlaid on a fluid 32 px-padded frame.
```
y 32    header
y 112   H1 line 1 "Designed to"          x 32
y 187   H1 line 2 "mean something."      x 32 → 954
y 294   MonoLink "DISCUSS YOUR PROJECT"  x 32,  w 208
y 294   MonoLink "BOOK A 30-MINUTE CALL" x 262, w 210
y 770   EST-badge  (globe glyph + "EST. 2012" | "14+ YEARS SHAPING DIGITAL DIRECTION.")  x 1464→1644
y 866   3-line 15px paragraph, right-aligned block  x 1441→1660
y 877   ✦ captions, centred: "HOLD TO 💥 BLAST" / "DARE ⚡ TO TOUCH THE LINES."
y 895   scroll-down ⌄ button, 20px circle           x 40
```
**Visual treatment** near-black; the only colour in the viewport is the ember/blue inside the canvas.
**Interaction** ring cursor, hold-to-blast, hover-the-lines. **Animation** A02, A03, A04.
**Transition out** the canvas persists; the About chapter's text scrolls up over it.

## 02 About statement — frames 030–056
```
y 173   label "ABOUT"                     x 32
y 166   statement, 3 lines, 72px          x 171 → 1629
y 465   hairline + "+" marker             x 32 → 1660
y 541   3-line mono caps note             x 171, w ~200
y 540   16px mission paragraph            x 1133, w ~330
y 681   MonoLink "MORE ABOUT US"          x 1133, w 168
```
**Animation** A05 word-reveal (scrubbed). The hero canvas is still faintly visible behind.

## 03 Marquee — frames 057–078
Full-bleed band; ~120 px `IMPACT + INSPIRE + INNOVATE +`, 30 % white, centred vertically at y ≈ 465.
`FOCUSED VISION. / MEASURED EXECUTION.` label at x 171, y 125. `✦ FROM IDEA TO OUTCOME.` centred at
y 785. The 3D cluster is still drifting behind. **Animation** A07.

## 04 Key facts — frames 079–095
```
y 0-ish  h2 "Key facts" (scrolls up out of frame)   centred
y 35     2-line 14px note, centred                  "A snapshot of our experience and impact."
y 128    3 StatCards: x 331 / 682 / 1033, 330 × 407, gap 20
y 644    label "OUR BUSINESS PARTNERS", centred
y 700    5 partner wordmarks + hairline dividers, centred, w ~690
```
**Animation** A08. **Transition out** a hairline + `+` marker at y ≈ 849 closes the section.

## 05 Selected work & explorations — frames 095–121
```
sticky left column
  y 412  h2 "Selected work"       x 100
  y 486  h2 "& explorations"      x 100
  y 603  MonoLink "VIEW ALL PROJECTS"  x 222, w 168
vertical divider  x 730, full height
horizontal track (right)
  card i:  image 714 × 488 at y 187, radius 4
           title 24px   at y 714
           desc 14px    at y 748 (2 lines, w ~330)
           MonoLink "EXPLORE PROJECT" right-aligned at y 756
  card gap 60
```
Projects seen: **MyWorker AI** (AI platform simplifying hiring, management, and workforce scaling) →
**Pulse Studio** (A motion-led audio-visual streaming platform for artists, projects, and cultures) →
**Lofticorn** (Seamless real-estate platform for effortless property discovery) → a 4th, partly seen.
**Animation** A09.

## 06 Collection CTA — frames 116–126
Centred 2–3 line 16 px paragraph ("Discover our complete collection of digital experiences, brands,
and platforms.") at y ~690 with `VIEW ALL PROJECTS →` centred beneath. Acts as the breath between the
work track and the services set-piece.

## 07 Services set-piece — frames 121–178
Persistent chrome: `OUR SERVICES` label centred at y 107; ✦ caption centred at y 868
(`✦ DESIGN WITH INTENT. BUILT TO WORK.` → `✦ DIFFERENT DISCIPLINES. ONE STANDARD OF CRAFT.`);
`VIEW SERVICES →` bottom-right at x 1494, y 867.
Stage: kinetic stack centred at y 314–672 (4 lines, ~112 px, centred, lines touching) → monolith
~578 × 590 centred at y 185–775 → six ServiceLabels in diagonal pairs
(top-left anchor x 223 / y 128; bottom-right anchor x 1115 / y 640).
**Animation** A10 (six phases). **This is the highest-effort, highest-payoff section.**

## 08 Client stories — frames 178–192
```
y 115   h2 "Client stories"                 x 171
y 130   3-line 14px note                    x 857, w ~170
y 247   hairline + "+" marker               x 171 → 1525
y 328   client list, 5 names, 28px pitch    x 171
y 337   quote, 26px, 3 lines                x 857, w ~640
y 480   avatar 66 × 66 + name + role        x 857
y 653   ← → buttons, 68 × 68                x 171
y 703   MonoLink "BECOME A CLIENT"          x 857
y 931   hairline + "+" marker
```
Clients listed: LUXURY PRESENCE · CREDIBLE · FAST RESUME · TECHNIS · VENTIGENCE.
**Animation** A11 + A18.

## 09 Design in motion — frames 193–243
Grey `#BBBBBB`. Split heading `DESIGN IN` (upper-left area, ~96 px) and `MOTION` (lower-right of it),
with a 2-line 12 px mono note between them (`EXPLORING IDEAS THROUGH DAILY DESIGN PRACTICE`).
The curved 3D screenshot arc dominates the centre. Bottom-left: 3-line 16 px description
("Concepts, explorations, and interface experiments shared openly as part of our creative process.")
at x 34, y 837. Bottom-right: `VIEW ON DRIBBBLE →` at x 1512, y 866.
**Animation** A12.

## 10 Footer CTA — frames 243–264
```
y 123   label "LET'S BUILD WORK THAT INSPIRES."   x 32
y 123   live clock "IST → 13:05", right-aligned   x 1588 → 1660
y 158   h2 line 1 "Ready to build"                x 32
y 231   h2 line 2 "something bold?"               x 32 → 520
y 273   MonoLink "DISCUSS YOUR PROJECT"           x 1145
y 273   MonoLink "BOOK A 30-MINUTE CALL"          x 1376
y 365   label "BUSINESS ENQUIRY" + E./P. rows     x 1145
y 365   label "SOCIAL" + 4 links in 2 columns     x 1488
y 365   "©TRIONN® 2026"                           x 32
y 427   "SOUND ON ♪ HOVER THE LINES."             x 32
y 540+  LineWordmark "TRIONN" (~40 hairline rows) full width
```
**Animation** A13.

---

# SERVICES  `/services`

```
Services
├── 11 Hero "Area of expertise"     dark   100vh
├── 12 Focused-disciplines statement dark  ~90vh
├── 13 Marquee (BRANDING + A.I. + DESIGN + DEVELOPMENT)  dark  ~50vh
├── 14 Service detail rows × 6      light  ~100vh each
├── 15 Technology stack             light  ~150vh
├── 16 How we work                  grey   ~90vh
└── 17 Footer CTA                   black  (shared)
```

## 11 Hero — frames 269–273
Dark, minimal: `✦ WHAT WE DO BEST` label centred at y ~208; `Area of expertise` (~48 px, sentence
case) centred at y ~250; a 2-line 12 px mono note beneath. A subtle 3D element drifts at the right
edge. **Animation** A18 blur-resolve.

## 12 Focused-disciplines statement — frames 273–278
Centred 3-line 44 px statement ("Focused disciplines where strategy, design, and technology work as
one.") with the same **A05 word-reveal**, then two MonoLinks centred beneath
(`VIEW OUR PROJECTS →` · `LET'S CONNECT →`).

## 13 Marquee — frames 278–284
`BRANDING + A.I. + DESIGN + DEVELOPMENT +`, same treatment as §03, with a ✦ caption beneath.

## 14 Service detail rows — frames 284–309
Six alternating rows, 50/50 split with a 1 px vertical divider at x = 855 and a 1 px horizontal rule
opening each row (with a `+` marker on the divider intersection).
```
image half:  mono caption above the mockup (e.g. "INTEGRATED SEAMLESSLY INTO EXISTING PLATFORMS.")
             mockup 493 × 320 on a pale panel
copy half:   title 30px           x 993 (or mirrored)
             description 14px, 3 lines, w ~350
             label "OUR CORE CAPABILITIES"
             capability list, 14px, 39px pitch, each with a 1px underline
```
Rows: AI & Intelligent Automation · Website & Mobile Design · Product Design · Web Development ·
WordPress Development · Branding. Sides alternate image-left / image-right.
**Animation** A16.

## 15 Technology stack — frames 309–316
`BUILT WITH PERFORMANCE-FIRST, SCALABLE AND MODERN ARCHITECTURE.` mono note; split heading
`TECHNOLOGY` (left) / `STACK` (right) at ~64 px; then 7 AccordionRows:
1. AI & Intelligent Automation · 2. Front-end · 3. Back-end · 4. Databases & Content Management ·
5. Cloud Services · 6. DevOps & Infrastructure · 7. Marketing, Email & Integrations.
**Animation** A17.

## 16 How we work — frames 316–322
```
y 147   label "OUR PROCESS"        x 32
y 141   h2 "How we work"           x 307
y 228   2-line 14px note           x 307
y 331   STEP - 1 / 2 / 3 labels    x 307 / 713 / 1118
y 388   step titles, 28px          Understand · Design & Build · Refine & Evolve
y 436   step copy, 14px, 3 lines, w ~305
```

## 17 Footer CTA — frames 322–327
Identical to §10.

---

# NOT OBSERVED
`/work/<slug>` case-study pages, `/about`, `/contact` — linked but never opened in the recording.
Reproduce them by extending the established system (statement + detail rows + footer CTA); do not
claim fidelity to the reference for these.
