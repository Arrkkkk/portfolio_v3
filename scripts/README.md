# Visual-validation scripts

CLAUDE.md makes the reference-comparison loop mandatory. These drive it.

```bash
npm run dev                        # in another shell
npm run shot -- '[{"name":"01-hero","path":"/"}]'
npm run shot -- '[{"name":"04-keyfacts","path":"/","scroll":2750}]'
npm run verify                     # mobile / reduced-motion / runtime-error sweep
```

* Screenshots land in `analysis/_shots/` at exactly **1710 × 951** — the reference
  capture viewport — so they can be compared 1:1 against `Trion Frames/frame_XXXX.jpg`
  and the half-res crops in `analysis/_work/`.
* `shot.mjs` skips the preloader, sets the scroll offset, then waits for Lenis and
  ScrollTrigger to settle before capturing. Pinned scenes need a `scroll` value inside
  their pinned range; `analysis/FRAME-MAP.md` says which frame each state corresponds to.
* Both scripts drive the locally installed Google Chrome (`channel: "chrome"`), so no
  Playwright browser download is required.
