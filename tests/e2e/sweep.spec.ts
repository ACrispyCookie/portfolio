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
const PEERS = ['.now > a', '.glance > .read', '#projects .grid > .card', '.ccard .cr > .clink', '#people .big > .person', '#people .small > .person'];
// Text that must stay on one line: an address, a label, a button.
const ONE_LINE = ['.mail span', '.clink b', '.clink small', '.topbar .name', '.chip', '.btn:not(.origin .btn)', '.tag']; // the origin button may wrap below 400px (Plan 1)

// Phones lay text out differently from desktop browsers at the same width (touch, mobile text sizing), so every
// sweep runs as both.
// Every page the sweep covers. Plan 2 adds each new page type here as it lands.
const PAGES = ['/', '/projects', '/courses/ece338/gpgpu', '/courses/ece455/rambo', '/projects/homelab'];

const MODES = [{ name: 'desktop browser', isMobile: false, hasTouch: false }, { name: 'phone browser', isMobile: true, hasTouch: true }];

async function settle(page: Page, path: string) {
  await page.route('https://fpga.njason.dev/**', (r) => r.abort());
  await page.goto(path);
  // pass the whole page once so every section is switched on and every lazy image has its size
  for (let y = 0; y < 20000; y += 600) await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
}

for (const path of PAGES) for (const mode of MODES)
test(`${path}, ${mode.name}, every width 320–2560: no sideways scroll, no overlapping text, short headlines, one-line top bar, even rows`, async ({ browser, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'resizes its own page; one run covers every width');
  test.setTimeout(900_000);
  const ctx = await browser.newContext({ baseURL, isMobile: mode.isMobile, hasTouch: mode.hasTouch, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await settle(page, path);
  const failures: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(60);
    const f = await page.evaluate(([peers, oneLine]) => {
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
      const res = {
        sideways: document.documentElement.scrollWidth > innerWidth,
        // what sticks out, so a failure names its cause (a one-off at 320px in the gate on 2026-10-23 didn't reproduce)
        wide: document.documentElement.scrollWidth > innerWidth ? [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 0.5).slice(0, 5).map((e) => `${e.tagName.toLowerCase()}.${typeof e.className === 'string' ? e.className : ''} right ${Math.round(e.getBoundingClientRect().right)}`) : [],
        bar: Math.round(document.querySelector('.topbar')!.getBoundingClientRect().height),
        // two lines from 390px up (spec §11); below that, where only the body size is left on the scale, three
        heads: [...document.querySelectorAll('#projects p.head')].filter((p) => p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight) > (innerWidth < 390 ? 3.2 : 2.2)).map((p) => p.textContent!.slice(0, 30)),
        uneven,
      };
      // a text run that breaks across lines (pieces side by side at different heights are not a wrap)
      const breaks = (e: Element) => {
        const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          if (!n.textContent!.trim() || n.parentElement!.closest('.vh')) continue;
          const r = document.createRange(); r.selectNodeContents(n);
          const rects = [...r.getClientRects()].filter((x) => x.width > 1);
          if (rects.length > 1 && rects.some((x) => x.top > rects[0].bottom - 2)) return true;
        }
        return false;
      };
      const wrapped = oneLine.flatMap((sel) => [...document.querySelectorAll<HTMLElement>(sel)].filter((e) => e.offsetParent && breaks(e)).map((e) => `${sel} "${e.textContent!.trim().slice(0, 30)}"`));
      return { ...res, wrapped };
    }, [PEERS, ONE_LINE] as const);
    if (f.sideways) failures.push(`${w}: page scrolls sideways (${f.wide.join('; ')})`);
    if (f.bar > 75) failures.push(`${w}: top bar is ${f.bar}px (wrapped)`);
    for (const h of f.heads) failures.push(`${w}: headline too many lines: "${h}"`);
    for (const u of f.uneven) failures.push(`${w}: uneven row: ${u}`);
    for (const t of f.wrapped) failures.push(`${w}: wraps onto two lines: ${t}`);
    for (const o of await overlaps(page)) failures.push(`${w}: text overlaps: ${o}`);
  }
  await ctx.close();
  expect(failures).toEqual([]);
});

for (const path of PAGES) for (const mode of MODES)
test(`${path}, ${mode.name}, every window shape, portrait and landscape: the page's h1 is on the first screen, no picture outgrows the screen, pictures fill their cards`, async ({ browser, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'resizes its own page; one run covers every shape');
  test.setTimeout(900_000);
  const ctx = await browser.newContext({ baseURL, isMobile: mode.isMobile, hasTouch: mode.hasTouch, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await settle(page, path);
  const failures: string[] = [];
  for (const [w, h] of SHAPES) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(40);
    const f = await page.evaluate(() => {
      const name = document.querySelector('h1')!.getBoundingClientRect();
      const tall = [...document.querySelectorAll('main img, main video, main svg.diagram, main .origin svg')].flatMap((m) => {
        const r = m.getBoundingClientRect();
        if (!r.height) return [];
        // the hero photo may fill up to 80% of the screen; every other picture up to 60%, except a project page's
        // pictures on a short landscape screen, which may use 86% so they aren't shrunk to a corner (Jason, 2026-10-24)
        // a project page's top video may use 68% (Jason, 2026-10-24: make it bigger; 2026-10-25: never crop it)
        const short = innerWidth > innerHeight && innerHeight < 600;
        const limit = m.closest('.cover') ? 0.8 : m.closest('.hero-media, .pfig') && short ? 0.86 : m.closest('.hero-media') ? 0.68 : 0.6;
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
      // All projects (Jason, 2026-10-23: cropped on a landscape phone): no picture is cut down to a strip by a capped height
      const strips = location.pathname !== '/projects' ? [] : [...document.querySelectorAll('.thumb, .card .media, .origin .blk')].flatMap((m) => {
        const r = m.getBoundingClientRect();
        const what = m.closest('[data-id]')?.getAttribute('data-id') ?? m.closest('.course')?.querySelector('.cn b')?.textContent ?? m.className;
        return r.height && r.width / r.height > 2 ? [`${what} ${Math.round(r.width)}×${Math.round(r.height)}`] : [];
      });
      // project pages (Jason, 2026-10-24: pictures scaled badly in landscape; 2026-10-25: never crop the top picture):
      // the top picture keeps its own shape and is as big as it can be: the column's width, or its height cap
      const hero = document.querySelector('.hero-media')?.getBoundingClientRect();
      const col = document.querySelector('.phead')?.getBoundingClientRect();
      const cap = innerHeight * (innerWidth > innerHeight && innerHeight < 600 ? 0.84 : 0.58 * 1.14);
      if (hero && col && hero.width < col.width - 2 && hero.height < cap - 2) narrow.push(`top picture ${Math.round(hero.width)}×${Math.round(hero.height)} in a ${Math.round(col.width)}px column`);
      if (hero && hero.width / hero.height > 2.4) strips.push(`top picture ${Math.round(hero.width)}×${Math.round(hero.height)}`);
      // the key numbers belong to the video: always its width, also where a short screen caps the video (Jason,
      // 2026-10-24: on real phones and tablets held sideways the toolbars shorten the screen and the video came out
      // narrower than the numbers)
      const nums = document.querySelector('.knums')?.getBoundingClientRect();
      if (hero && nums && Math.abs(nums.width - hero.width) > 2) narrow.push(`key numbers ${Math.round(nums.width)}px wide under a ${Math.round(hero.width)}px video`);
      // on a short landscape screen a section picture either fills the text's width or most of the screen's height
      const textW = document.querySelector('.psec > p')?.getBoundingClientRect().width ?? 0;
      if (innerWidth > innerHeight && innerHeight < 600) for (const f of document.querySelectorAll('.psec > .pfig')) {
        const r = f.getBoundingClientRect();
        const full = f.matches('.drawn, .square') ? Math.min(textW, 520) : textW;
        if (r.width < full - 2 && r.height < innerHeight * 0.8 - 2) narrow.push(`section picture ${Math.round(r.width)}×${Math.round(r.height)}, small for the screen`);
      }
      return { nameBottom: Math.round(name.bottom), tall, narrow, strips };
    });
    if (f.nameBottom > h) failures.push(`${w}×${h}: the page's h1 is below the first screen (bottom at ${f.nameBottom}px)`);
    for (const t of f.tall) failures.push(`${w}×${h}: picture taller than allowed: ${t}`);
    for (const n of f.narrow) failures.push(`${w}×${h}: picture doesn't fill its place: ${n}`);
    for (const n of f.strips) failures.push(`${w}×${h}: picture cropped to a strip: ${n}`);
  }
  await ctx.close();
  expect(failures).toEqual([]);
});
