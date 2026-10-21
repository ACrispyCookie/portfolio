import { test, expect, type Page } from '@playwright/test';

// Every width from 320 to 1920 in 20px steps, plus common devices, against the rules that must hold at any size.
// Runs once (desktop project) and resizes its own page, so new breakpoints can't hide between tested sizes.
const DEVICES = [320, 360, 375, 390, 412, 430, 600, 744, 768, 800, 820, 834, 853, 912, 1024, 1080, 1112, 1133, 1180, 1194, 1280, 1366, 1440, 1536, 1680, 1920];
const WIDTHS = [...new Set([...Array.from({ length: 81 }, (_, i) => 320 + i * 20), ...DEVICES])].sort((a, b) => a - b);

/** Pairs of text runs that overlap on screen, wherever they are on the page. */
const overlaps = (page: Page) =>
  page.evaluate(() => {
    const runs: { el: Element; r: DOMRect; t: string }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.textContent!.trim();
      const el = n.parentElement!;
      // the sticky top bar sits over content scrolling under it by design
      if (!t || el.closest('script, style, [hidden], .vh, svg, .menu-sheet, .topbar')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) runs.push({ el, r, t: t.slice(0, 30) });
    }
    const out: string[] = [];
    for (let i = 0; i < runs.length; i++)
      for (let j = i + 1; j < runs.length; j++) {
        const [a, b] = [runs[i], runs[j]];
        if (a.el === b.el) continue;
        const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (x > 2 && y > 2) out.push(`"${a.t}" × "${b.t}"`);
      }
    return out;
  });

test('every width from 320 to 1920: no sideways scroll, no overlapping text, short headlines, one-line top bar', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'resizes its own page; one run covers every width');
  test.setTimeout(600_000);
  await page.route('https://fpga.njason.dev/**', (r) => r.abort());
  await page.goto('/');
  // pass the whole page once so every section is switched on and every lazy image has its size
  for (let y = 0; y < 20000; y += 600) await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
  const failures: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(60);
    const f = await page.evaluate(() => ({
      sideways: document.documentElement.scrollWidth > innerWidth,
      bar: Math.round(document.querySelector('.topbar')!.getBoundingClientRect().height),
      heads: [...document.querySelectorAll('#projects p.head')].filter((p) => p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight) > 2.2).map((p) => p.textContent!.slice(0, 30)),
    }));
    if (f.sideways) failures.push(`${w}: page scrolls sideways`);
    if (f.bar > 75) failures.push(`${w}: top bar is ${f.bar}px (wrapped)`);
    for (const h of f.heads) failures.push(`${w}: headline over two lines: "${h}"`);
    for (const o of await overlaps(page)) failures.push(`${w}: text overlaps: ${o}`);
  }
  expect(failures).toEqual([]);
});
