import { chromium } from "playwright";
const OUT = "/Users/rajitagrawal/portfolio_v3/analysis/_shots";
const targets = JSON.parse(process.argv[2]);

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1710, height: 951 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
let current = null;

for (const t of targets) {
  if (t.path !== current) {
    await page.goto(`http://localhost:3000${t.path}`, { waitUntil: "networkidle" });
    await page.evaluate(() => sessionStorage.setItem("preloaded", "1"));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    current = t.path;
  }
  const y = t.scroll ?? 0;
  await page.evaluate((to) => window.scrollTo(0, to), y);
  await page.waitForTimeout(200);
  // nudge so Lenis/ScrollTrigger commit the position
  await page.mouse.move(855, 475);
  await page.mouse.wheel(0, 1);
  await page.waitForTimeout(t.wait ?? 1100);
  await page.screenshot({ path: `${OUT}/${t.name}.png` });
  const actual = await page.evaluate(() => Math.round(window.scrollY));
  console.log(t.name, "want", y, "got", actual);
}
await browser.close();
