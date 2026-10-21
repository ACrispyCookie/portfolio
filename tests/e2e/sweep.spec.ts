import { test, expect, type Page } from '@playwright/test';

// Rules that must hold at any window size, checked across widths and heights, so a size we didn't think of can't slip
// through. Runs once (desktop project) and resizes its own page.

// Real devices, both orientations (phones, tablets, laptops, desktops).
const DEVICES: [number, number][] = [
  [320, 568], [360, 740], [375, 667], [390, 844], [393, 873], [412, 915], [430, 932],
  [768, 1024], [810, 1080], [820, 1180], [834, 1194], [1024, 1366],
  [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1680, 1050], [1920, 1080], [2560, 1440],
].flatMap(([w, h]): [number, number][] => (w === h ? [[w, h]] : [[w, h], [h, w]]));
// Every 20px of width (layout and text rules depend on width only).
const WIDTHS = [...new Set([...Array.from({ length: 113 }, (_, i) => 320 + i * 20), ...DEVICES.map(([w]) => w)])].sort((a, b) => a - b);
// A grid of window shapes for the rules that depend on height (first screen, picture size).
const SHAPES: [number, number][] = [...DEVICES, ...[320, 480, 640, 800, 960, 1120, 1280, 1600, 1920, 2560].flatMap((w) => [360, 430, 600, 768, 900, 1080, 1440].map((h): [number, number] => [w, h]))];

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

// Containers whose items are peers: items that share a row must be the same height.
const PEERS = ['.now > a', '.glance > .read', '#projects .grid > .card', '.ccard .cr > .clink'];

// Phones lay text out differently from desktop browsers at the same width (touch, mobile text sizing), so every
// sweep runs as both.
const MODES = [{ name: 'desktop browser', isMobile: false, hasTouch: false }, { name: 'phone browser', isMobile: true, hasTouch: true }];

async function settle(page: Page) {
  await page.route('https://fpga.njason.dev/**', (r) => r.abort());
  await page.goto('/');
  // pass the whole page once so every section is switched on and every lazy image has its size
  for (let y = 0; y < 20000; y += 600) await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
}

for (const mode of MODES)
test(`${mode.name}, every width 320–2560: no sideways scroll, no overlapping text, short headlines, one-line top bar, even rows`, async ({ browser, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'resizes its own page; one run covers every width');
  test.setTimeout(900_000);
  const ctx = await browser.newContext({ baseURL, isMobile: mode.isMobile, hasTouch: mode.hasTouch, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await settle(page);
  const failures: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(60);
    const f = await page.evaluate((peers) => {
      const uneven: string[] = [];
      for (const sel of peers) {
        // items whose vertical extents overlap share a row (grouping by top edge would miss centred items)
        const boxes = [...document.querySelectorAll(sel)].map((el) => el.getBoundingClientRect()).filter((r) => r.height).sort((a, b) => a.top - b.top);
        const rows: DOMRect[][] = [];
        for (const r of boxes) {
          const row = rows.find((g) => g.some((o) => r.top < o.bottom - 1 && o.top < r.bottom - 1));
          if (row) row.push(r); else rows.push([r]);
        }
        for (const g of rows) {
          const hs = g.map((r) => Math.round(r.height));
          if (g.length > 1 && Math.max(...hs) - Math.min(...hs) > 1) uneven.push(`${sel}: ${hs.join(' vs ')}px`);
        }
      }
      return {
        sideways: document.documentElement.scrollWidth > innerWidth,
        bar: Math.round(document.querySelector('.topbar')!.getBoundingClientRect().height),
        heads: [...document.querySelectorAll('#projects p.head')].filter((p) => p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight) > 2.2).map((p) => p.textContent!.slice(0, 30)),
        uneven,
      };
    }, PEERS);
    if (f.sideways) failures.push(`${w}: page scrolls sideways`);
    if (f.bar > 75) failures.push(`${w}: top bar is ${f.bar}px (wrapped)`);
    for (const h of f.heads) failures.push(`${w}: headline over two lines: "${h}"`);
    for (const u of f.uneven) failures.push(`${w}: uneven row: ${u}`);
    for (const o of await overlaps(page)) failures.push(`${w}: text overlaps: ${o}`);
  }
  await ctx.close();
  expect(failures).toEqual([]);
});

for (const mode of MODES)
test(`${mode.name}, every window shape, portrait and landscape: the name is on the first screen, no picture outgrows the screen, pictures fill their cards`, async ({ browser, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'resizes its own page; one run covers every shape');
  test.setTimeout(900_000);
  const ctx = await browser.newContext({ baseURL, isMobile: mode.isMobile, hasTouch: mode.hasTouch, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await settle(page);
  const failures: string[] = [];
  for (const [w, h] of SHAPES) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(40);
    const f = await page.evaluate(() => {
      const name = document.querySelector('h1')!.getBoundingClientRect();
      const tall = [...document.querySelectorAll('main img, main video, main svg.diagram')].flatMap((m) => {
        const r = m.getBoundingClientRect();
        if (!r.height) return [];
        // the hero photo may fill up to 80% of the screen; every other picture up to 60%
        const limit = m.closest('.cover') ? 0.8 : 0.6;
        const what = m.closest('.cover') ? 'hero photo' : m.closest('[data-id]')?.getAttribute('data-id') ?? m.tagName.toLowerCase();
        return r.height > innerHeight * limit ? [`${what} ${Math.round((r.height / innerHeight) * 100)}%`] : [];
      });
      // a picture above its text fills the card's width (a capped height crops; it must not shrink the picture sideways)
      const narrow = [...document.querySelectorAll('.card')].flatMap((c) => {
        const m = c.querySelector('.media')?.getBoundingClientRect();
        const b = c.querySelector('.body')?.getBoundingClientRect();
        if (!m || !b || m.bottom > b.top + 1) return []; // side by side: not this rule
        const cs = getComputedStyle(c);
        const inner = c.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        return m.width < inner - 2 ? [`${c.getAttribute('data-id')} picture ${Math.round(m.width)}px in a ${Math.round(inner)}px card`] : [];
      });
      return { nameBottom: Math.round(name.bottom), tall, narrow };
    });
    if (f.nameBottom > h) failures.push(`${w}×${h}: the name is below the first screen (bottom at ${f.nameBottom}px)`);
    for (const t of f.tall) failures.push(`${w}×${h}: picture taller than allowed: ${t}`);
    for (const n of f.narrow) failures.push(`${w}×${h}: picture doesn't fill its card: ${n}`);
  }
  await ctx.close();
  expect(failures).toEqual([]);
});
