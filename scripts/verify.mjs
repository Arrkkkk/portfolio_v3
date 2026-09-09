import { chromium } from "playwright";
const OUT = "/Users/rajitagrawal/portfolio_v3/analysis/_shots";
const b = await chromium.launch({ channel: "chrome" });

// Desktop, footer with the wordmark fully drawn
const d = await b.newPage({ viewport: { width: 1710, height: 951 } });
const errs = [];
d.on("pageerror", (e) => errs.push("desktop: " + e.message));
await d.goto("http://localhost:3000", { waitUntil: "networkidle" });
await d.evaluate(() => sessionStorage.setItem("preloaded", "1"));
await d.reload({ waitUntil: "networkidle" });
await d.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await d.mouse.wheel(0, 1);
await d.waitForTimeout(3000);
await d.screenshot({ path: `${OUT}/13-footer.png` });

// Mobile — WebGL scenes must be gated off, layout must not overflow
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on("pageerror", (e) => errs.push("mobile: " + e.message));
await m.goto("http://localhost:3000", { waitUntil: "networkidle" });
await m.evaluate(() => sessionStorage.setItem("preloaded", "1"));
await m.reload({ waitUntil: "networkidle" });
await m.waitForTimeout(1500);
await m.screenshot({ path: `${OUT}/40-mobile-hero.png` });
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const canvases = await m.locator("canvas").count();
await m.evaluate(() => window.scrollTo(0, 3000));
await m.waitForTimeout(1200);
await m.screenshot({ path: `${OUT}/41-mobile-work.png` });

// Reduced motion
const r = await b.newContext({ viewport: { width: 1710, height: 951 }, reducedMotion: "reduce" });
const rp = await r.newPage();
rp.on("pageerror", (e) => errs.push("reduced: " + e.message));
await rp.goto("http://localhost:3000", { waitUntil: "networkidle" });
await rp.waitForTimeout(1200);
await rp.screenshot({ path: `${OUT}/42-reduced-motion.png` });

console.log(JSON.stringify({ mobileHorizontalOverflow: overflow, mobileCanvases: canvases, errors: errs }, null, 1));
await b.close();
