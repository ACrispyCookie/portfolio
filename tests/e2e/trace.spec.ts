// Port of docs/superpowers/mocks/check.js (spec §7.3) plus the trace's home-page rules.
import { expect, test, type Page } from '@playwright/test';
import { JSON_URL, STREAM, event, serveStream } from './helpers/lab';

const BOXES = 'main .card, main .w, main .read, main .ccard, main .cproj, main .rc, main .skx2, main .origin, main .mini a, main .board, main .cover, main figure, main .people';

// mobile WebKit has no wheel events in Playwright: scroll by script there
const wheel = (page: Page, dy: number) =>
  page.context().browser()?.browserType().name() === 'webkit' && page.viewportSize()!.width < 500
    ? page.evaluate((d) => scrollBy(0, d), dy)
    : page.mouse.wheel(0, dy);

test('check.js: no errors or overflow, one edge for traced sections, trace clear of content and ≥28px from it, smooth pulse', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStream(page, event());
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const r = await page.evaluate((sel) => {
    const W = innerWidth;
    const ov = Math.max(document.documentElement.scrollWidth, W) - W;
    const main = document.querySelector('main')!;
    const firstKids = [...new Set([...main.querySelectorAll(':scope > section:not(.hero)')].map((e) => Math.round(e.getBoundingClientRect().left)))];
    const svg = document.querySelector('svg.trace')!, path = document.querySelector<SVGPathElement>('.t-drawn')!;
    const sb = svg.getBoundingClientRect(), L = path.getTotalLength();
    const boxes = [...document.querySelectorAll(sel)].map((e) => e.getBoundingClientRect());
    const hits: number[][] = [];
    for (let l = 12; l < L; l += 10) {
      const pt = path.getPointAtLength(l), x = pt.x + sb.left, y = pt.y + sb.top;
      if (boxes.some((b) => x > b.left - 6 && x < b.right + 6 && y > b.top - 6 && y < b.bottom + 6)) hits.push([Math.round(x), Math.round(y + scrollY)]);
    }
    const traceX = Math.round(path.getPointAtLength(L).x + sb.left);
    const contentLeft = Math.min(...[...main.querySelectorAll(':scope > section:not(.hero) h2')].map((e) => e.getBoundingClientRect().left));
    return { ov, firstKids, hits: hits.slice(0, 5), traceX, contentLeft, L };
  }, BOXES);
  expect(errors).toEqual([]);
  expect(r.ov).toBe(0);
  expect(r.firstKids).toHaveLength(1);
  expect(r.L).toBeGreaterThan(100);
  expect(r.hits).toEqual([]);
  expect(r.contentLeft - r.traceX).toBeGreaterThanOrEqual(28);

  await page.locator('.hero .board').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, 0));
  // pulses run only once the board is powered, which waits for the lab's first status
  await expect(page.locator('html')).toHaveAttribute('data-lab', 'running');
  await page.evaluate(() => {
    const w = window as unknown as { __l: number[] };
    w.__l = [];
    // every pulse's offset per frame; a pulse may restart at the trace's start, but never jump ahead along it
    (function f() { for (const pu of document.querySelectorAll<SVGPathElement>('.t-pulse')) w.__l.push(parseFloat(pu.style.strokeDashoffset)); w.__l.push(NaN); requestAnimationFrame(f); })();
  });
  // scroll until the copper is drawn well past where pulses may start (the trace begins below the first screen on a
  // phone, ~800px down at 390×844): a fixed number of wheel steps fell short when WebKit dropped some under load
  const drawnPast = () => page.evaluate(() => { const d = document.querySelector<SVGPathElement>('.t-drawn')!; return d.getTotalLength() - parseFloat(d.style.strokeDashoffset || '0'); });
  for (let i = 0; i < 30 || (i < 150 && (await drawnPast()) < 600); i++) { await wheel(page, 70); await page.waitForTimeout(16); }
  await page.waitForTimeout(400);
  const raw = await page.evaluate(() => (window as unknown as { __l: number[] }).__l);
  // split into frames, then follow each pulse (same index) from frame to frame
  const frames: number[][] = [];
  let cur: number[] = [];
  for (const x of raw) { if (isNaN(x)) { frames.push(cur); cur = []; } else cur.push(x); }
  const diag = await page.evaluate((x) => JSON.stringify({ ...x, lab: document.documentElement.dataset.lab, pulses: document.querySelectorAll('.t-pulse').length, group: (document.querySelector('.t-pulses') as SVGGElement | null)?.style.opacity, drawn: (document.querySelector('.t-drawn') as SVGPathElement | null)?.style.strokeDashoffset, y: scrollY, vis: document.visibilityState }), { frames: frames.length, errors });
  expect(frames.filter((f) => f.length).length, `frames with a pulse (${diag})`).toBeGreaterThan(5); // headless WebKit draws few frames
  let jumps = 0;
  for (let i = 1; i < frames.length; i++)
    frames[i].forEach((o, k) => { const p = frames[i - 1][k]; if (p !== undefined && p - o > 40) jumps++; }); // ahead by >40px in a frame
  expect(jumps).toBeLessThanOrEqual(2);
});

test('pads, vias and stubs are SVG; each pad lights when the copper reaches it', async ({ page }) => {
  await page.goto('/');
  const n = await page.locator('main section[id] h2[data-pad]').count();
  await expect(page.locator('svg.trace .t-pad[data-i]')).toHaveCount(n);
  await expect(page.locator('svg.trace .t-via')).toHaveCount(2 * n - 1); // none below the last pad, where the copper ends
  await expect(page.locator('svg.trace .t-stub')).toHaveCount(2 * n - 1);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('svg.trace .t-pad[data-i]').last()).toHaveClass(/on/);
  for (const s of await page.locator('main > section:not(.hero)').all()) await expect(s).toHaveClass(/lit/);
});

test('home: the pulse stays dark while the lab is offline', async ({ page }) => {
  await page.route(STREAM, (r) => r.abort());
  await page.route(JSON_URL, (r) => r.abort());
  await page.goto('/');
  await page.locator('.hero .board').scrollIntoViewIfNeeded();
  const ops: string[] = [];
  for (let i = 0; i < 20; i++) {
    await wheel(page, 60);
    await page.waitForTimeout(100);
    ops.push(await page.locator('.t-pulses').evaluate((e) => getComputedStyle(e).opacity));
  }
  expect([...new Set(ops)]).toEqual(['0']);
});

test('home: the pulse runs while the board is online', async ({ page }) => {
  await serveStream(page, event());
  await page.goto('/');
  await page.locator('.hero .board').scrollIntoViewIfNeeded();
  await expect(page.locator('.hero .board')).toHaveAttribute('data-state', 'running');
  // scroll until copper is drawn (on phone the trace starts under the Now rows, below the widget)
  await page.locator('#glance').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.t-pulses').evaluate((e) => (e as SVGGElement).style.opacity), { timeout: 3000 }).toBe('1');
});

test('a deep link lights every section up to and including its target', async ({ page }) => {
  await page.goto('/');
  const id = await page.locator('main > section[id]').last().getAttribute('id');
  const fresh = await page.context().newPage();
  await fresh.goto(`/#${id}`);
  // the copper catches up in well under a second; poll so a busy machine doesn't fail it
  const unlit = () => fresh.evaluate((target) => {
    const out: string[] = [];
    for (const s of document.querySelectorAll('main > section:not(.hero)')) {
      if (!s.classList.contains('lit')) out.push(s.id);
      if (s.id === target) break;
    }
    return out;
  }, id);
  await expect.poll(unlit, { timeout: 3000 }).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('the whole trace is drawn, every pad lit, no pulse, nothing hidden', async ({ page }) => {
    await serveStream(page, event());
    await page.goto('/');
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const d = document.querySelector<SVGPathElement>('.t-drawn')!;
      return {
        offset: parseFloat(d.style.strokeDashoffset),
        unlit: document.querySelectorAll('.t-pad[data-i]:not(.on)').length,
        pulse: getComputedStyle(document.querySelector('.t-pulses')!).opacity,
        hidden: [...document.querySelectorAll('main *')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 1).length,
      };
    });
    expect(r).toEqual({ offset: 0, unlit: 0, pulse: '0', hidden: 0 });
  });
});

test.describe('no JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('no trace, and every section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('svg.trace')).toHaveCount(0);
    const hidden = await page.locator('main > section').evaluateAll((ss) => ss.filter((s) => getComputedStyle(s.lastElementChild!).opacity !== '1').length);
    expect(hidden).toBe(0);
  });
});

test('a section the trace cannot reach is never left hidden', async ({ page }) => {
  // serve home with the Contact heading's pad removed: the trace can't list that section
  await page.route((u) => u.pathname === '/', async (route) => {
    const res = await route.fetch();
    const html = (await res.text()).replace(/(<h2 id="contact-h"[^>]*?) data-pad/, '$1');
    await route.fulfill({ response: res, body: html });
  });
  await page.goto('/');
  expect(await page.locator('#contact-h').getAttribute('data-pad')).toBeNull();
  for (let y = 0; y < 20000; y += 500) await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
  await page.waitForTimeout(800);
  const faint = await page.evaluate(() => [...document.querySelectorAll('#contact > *')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 1).length);
  expect(faint).toBe(0);
});

test('printing shows every section, lit or not', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  const faint = await page.evaluate(() => [...document.querySelectorAll('main > section > *')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 1).length);
  expect(faint).toBe(0);
});

test('home: pulses leave at a fixed interval, however long the drawn trace (Jason, 2026-10-21)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await serveStream(page, event());
  await page.goto('/');
  // record the time each pulse sets off (its dash offset resets to the start)
  const launches = async () => {
    await page.evaluate(() => {
      const w = window as unknown as { __t: number[]; __seen: Map<Element, number> };
      w.__t = []; w.__seen = new Map();
      const f = () => {
        for (const p of document.querySelectorAll<SVGPathElement>('.t-pulse')) {
          const o = parseFloat(p.style.strokeDashoffset || 'NaN'); const prev = w.__seen.get(p);
          if (!isNaN(o) && prev !== undefined && o > prev + 20) w.__t.push(performance.now()); // reset to the start
          w.__seen.set(p, o);
        }
        if (w.__t.length < 6) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
    await expect.poll(() => page.evaluate(() => (window as unknown as { __t: number[] }).__t.length), { timeout: 15000 }).toBeGreaterThanOrEqual(5);
    const t = await page.evaluate(() => (window as unknown as { __t: number[] }).__t);
    const gaps = t.slice(1).map((x, i) => x - t[i]);
    return gaps.reduce((a, b) => a + b, 0) / gaps.length;
  };
  await page.locator('#glance').scrollIntoViewIfNeeded(); // a short drawn trace
  await page.waitForTimeout(800);
  const short = await launches();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); // the whole trace drawn
  await page.waitForTimeout(1500);
  const long = await launches();
  expect(Math.abs(long - short) / short, `short ${Math.round(short)}ms, long ${Math.round(long)}ms`).toBeLessThan(0.15);
  expect(short).toBeLessThan(1400); // a bit more often than before on a short trace
});
