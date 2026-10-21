// Port of docs/superpowers/mocks/check.js (spec §7.3) plus the trace's home-page rules.
import { expect, test } from '@playwright/test';
import { JSON_URL, STREAM, event, serveStream } from './helpers/lab';

const BOXES = 'main .card, main .w, main .read, main .ccard, main .cproj, main .rc, main .skx2, main .origin, main .mini a, main .board, main .cover, main figure, main .people';

test('check.js: no errors or overflow, one content edge, trace clear of content and ≥28px from it, smooth pulse', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await serveStream(page, event());
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const r = await page.evaluate((sel) => {
    const W = innerWidth;
    const ov = Math.max(document.documentElement.scrollWidth, W) - W;
    const main = document.querySelector('main')!;
    const firstKids = [...new Set([...main.children].filter((e) => (e as HTMLElement).offsetParent).map((e) => Math.round(e.getBoundingClientRect().left)))];
    const svg = document.querySelector('svg.trace')!, path = document.querySelector<SVGPathElement>('.t-drawn')!;
    const sb = svg.getBoundingClientRect(), L = path.getTotalLength();
    const boxes = [...document.querySelectorAll(sel)].map((e) => e.getBoundingClientRect());
    const hits: number[][] = [];
    for (let l = 12; l < L; l += 10) {
      const pt = path.getPointAtLength(l), x = pt.x + sb.left, y = pt.y + sb.top;
      if (boxes.some((b) => x > b.left - 6 && x < b.right + 6 && y > b.top - 6 && y < b.bottom + 6)) hits.push([Math.round(x), Math.round(y + scrollY)]);
    }
    const traceX = Math.round(path.getPointAtLength(L).x + sb.left);
    const contentLeft = Math.min(...[...main.querySelectorAll('h1, h2')].map((e) => e.getBoundingClientRect().left));
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
  await page.evaluate(() => {
    const w = window as unknown as { __l: number[] };
    w.__l = [];
    const pu = document.querySelector<SVGPathElement>('.t-pulse')!;
    (function f() { w.__l.push(parseFloat(pu.style.strokeDashoffset)); requestAnimationFrame(f); })();
  });
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 70); await page.waitForTimeout(16); }
  await page.waitForTimeout(400);
  const l = await page.evaluate(() => (window as unknown as { __l: number[] }).__l.filter((x) => !isNaN(x)));
  expect(l.length).toBeGreaterThan(10);
  let jumps = 0;
  for (let i = 1; i < l.length; i++) if (l[i] - l[i - 1] > 30 || (l[i - 1] - l[i] > 30 && !(l[i] > l[i - 1]))) jumps++;
  expect(jumps).toBeLessThanOrEqual(2);
});

test('pads, vias and stubs are SVG; each pad lights when the copper reaches it', async ({ page }) => {
  await page.goto('/');
  const n = await page.locator('main section[id] h2[data-pad]').count();
  await expect(page.locator('svg.trace .t-pad[data-i]')).toHaveCount(n);
  await expect(page.locator('svg.trace .t-via')).toHaveCount(2 * n);
  await expect(page.locator('svg.trace .t-stub')).toHaveCount(2 * n);
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
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(100);
    ops.push(await page.locator('.t-pulse').evaluate((e) => getComputedStyle(e).opacity));
  }
  expect([...new Set(ops)]).toEqual(['0']);
});

test('home: the pulse runs while the board is online', async ({ page }) => {
  await serveStream(page, event());
  await page.goto('/');
  await page.locator('.hero .board').scrollIntoViewIfNeeded();
  await expect(page.locator('.hero .board')).toHaveAttribute('data-state', 'online');
  // scroll until copper is drawn (on phone the trace starts under the Now rows, below the widget)
  await page.locator('#glance').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.t-pulse').evaluate((e) => (e as SVGPathElement).style.opacity), { timeout: 3000 }).toBe('1');
});

test('a deep link lights every section up to and including its target', async ({ page }) => {
  await page.goto('/');
  const id = await page.locator('main > section[id]').last().getAttribute('id');
  const fresh = await page.context().newPage();
  await fresh.goto(`/#${id}`);
  await fresh.waitForTimeout(800);
  const states = await fresh.evaluate((target) => {
    const out: [string, boolean][] = [];
    for (const s of document.querySelectorAll('main > section:not(.hero)')) {
      out.push([s.id, s.classList.contains('lit')]);
      if (s.id === target) break;
    }
    return out;
  }, id);
  expect(states.length).toBeGreaterThan(0);
  for (const [sid, lit] of states) expect(lit, sid).toBe(true);
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
        pulse: getComputedStyle(document.querySelector('.t-pulse')!).opacity,
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
