import { test, expect, type Page } from '@playwright/test';
import { phoneLayout } from './helpers/layout';

import { STREAM, JSON_URL, event, serveStream } from './helpers/lab';

// The stream opens only while the widget is on screen (spec §7.2), so bring it into view.
async function open(page: Page) {
  await page.goto('/');
  await page.locator('.hero .board').scrollIntoViewIfNeeded();
}
async function failLab(page: Page) {
  await page.route(STREAM, (r) => r.abort());
  await page.route(JSON_URL, (r) => r.abort());
}

test('an online board shows the running demo by name', async ({ page }) => {
  await serveStream(page, event());
  await open(page);
  const board = page.locator('.hero .board');
  await expect(board).toHaveAttribute('data-state', 'online');
  await expect(board.locator('[data-f="running"]')).toHaveText('GPGPU n-body');
  await expect(board.locator('[data-f="sub"]')).toHaveText('on the Smart Zynq SL');
  await expect(board.locator('[data-f="queue"]')).toHaveText('1');
  await expect(board.locator('[data-f="temp"]')).toHaveText('47 °C');
});

test('an unreachable lab says so, keeps the button and throws nothing', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await failLab(page);
  await open(page);
  const board = page.locator('.hero .board');
  await expect(board).toHaveAttribute('data-state', 'offline');
  await expect(board.locator('[data-f="running"]')).toHaveText('Status unavailable');
  await expect(board.locator('[data-f="temp-tag"]')).toBeHidden();
  await expect(board.getByRole('link', { name: 'Open the lab' })).toHaveAttribute('href', 'https://fpga.njason.dev');
  expect(errors).toEqual([]);
});

test('a missing temperature hides its tag instead of guessing', async ({ page }) => {
  await serveStream(page, event({ temperature_c: null }));
  await open(page);
  await expect(page.locator('.hero .board')).toHaveAttribute('data-state', 'online');
  await expect(page.locator('.hero [data-f="temp-tag"]')).toBeHidden();
});

test('a long board name does not overflow at 360px', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await serveStream(page, event({ name: 'A very long board name that keeps going past any sane width', active_demo: 'an-unlisted-demo-with-a-very-long-identifier' }));
  await open(page);
  await expect(page.locator('.hero .board')).toHaveAttribute('data-state', 'online');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await ctx.close();
});

test('without JavaScript the static panel is complete', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  const board = page.locator('.hero .board');
  await expect(board.locator('.what')).toHaveText('A real FPGA board in my homelab. Anyone can run demos on it from the browser.');
  await expect(board.getByRole('link', { name: 'Open the lab' })).toBeVisible();
  await expect(board.locator('.running')).toBeHidden();
  await ctx.close();
});

test('the widget is set apart by a flat cyan band, not a ring or shadow', async ({ page }) => {
  await failLab(page);
  await page.goto('/');
  const s = await page.locator('.hero .board').evaluate((el) => {
    const band = el.querySelector('.band')!;
    return { shadow: getComputedStyle(el).boxShadow, border: getComputedStyle(el).borderTopWidth, bg: getComputedStyle(band).backgroundColor, ink: getComputedStyle(band).color };
  });
  expect(s).toEqual({ shadow: 'none', border: '0px', bg: 'rgb(65, 226, 242)', ink: 'rgb(5, 37, 42)' });
});

test('board:status reports online for the trace pulse', async ({ page }) => {
  await serveStream(page, event());
  await page.addInitScript(() => {
    (window as unknown as { __status: boolean[] }).__status = [];
    document.addEventListener('board:status', (e) => (window as unknown as { __status: boolean[] }).__status.push((e as CustomEvent<{ online: boolean }>).detail.online));
  });
  await open(page);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __status: boolean[] }).__status.at(-1))).toBe(true);
});

test('the stream stays closed while the widget is off screen', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 500 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  let hits = 0;
  await page.route(STREAM, (r) => { hits++; return r.abort(); });
  await page.goto('/');
  await page.waitForTimeout(1000);
  expect(hits).toBe(0);
  await ctx.close();
});

test('an observer batch of "out" then "in" still opens the stream', async ({ page }) => {
  await serveStream(page, event());
  await page.addInitScript(() => {
    window.IntersectionObserver = class {
      constructor(private cb: IntersectionObserverCallback) {}
      observe(target: Element) {
        const e = (isIntersecting: boolean) => ({ isIntersecting, target }) as IntersectionObserverEntry;
        setTimeout(() => this.cb([e(false), e(true)], this as unknown as IntersectionObserver), 50);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    } as unknown as typeof IntersectionObserver;
  });
  await page.goto('/');
  await expect(page.locator('.hero .board')).toHaveAttribute('data-state', 'online');
});

for (const outcome of ['online', 'offline'] as const) {
  test(`the widget keeps its height from load until the lab answers (${outcome})`, async ({ page }) => {
    if (outcome === 'online') await serveStream(page, event()); else await failLab(page);
    // record every height the widget takes, from first paint on
    await page.addInitScript(() => {
      (window as any).__h = [];
      document.addEventListener('DOMContentLoaded', () => {
        const b = document.querySelector('.hero .board')!;
        new ResizeObserver(() => (window as any).__h.push(Math.round(b.getBoundingClientRect().height))).observe(b);
      });
    });
    await page.goto('/');
    const board = page.locator('.hero .board');
    // a widget that starts below the fold waits, saying so
    const below = await board.evaluate((b) => b.getBoundingClientRect().top > innerHeight);
    if (below) await expect(board.locator('[data-f="running"]')).toHaveText('Checking the board…');
    await board.scrollIntoViewIfNeeded();
    await expect(board).toHaveAttribute('data-state', outcome);
    await page.waitForTimeout(300);
    const hs: number[] = await page.evaluate(() => (window as any).__h);
    expect(Math.max(...hs) - Math.min(...hs), `heights ${hs.join(', ')}`).toBeLessThanOrEqual(1);
  });
}

test('with one status line the text sits centred, with no blank line reserved below', async ({ page }) => {
  await failLab(page);
  await open(page);
  const board = page.locator('.hero .board');
  await expect(board).toHaveAttribute('data-state', 'offline');
  const gaps = await board.locator('.running').evaluate((r) => {
    const box = r.getBoundingClientRect();
    const kids = [...r.children].filter((k) => k.textContent!.trim() && k.getBoundingClientRect().height > 0).map((k) => k.getBoundingClientRect());
    return { top: kids[0].top - box.top, bottom: box.bottom - kids[kids.length - 1].bottom };
  });
  expect(Math.abs(gaps.top - gaps.bottom), JSON.stringify(gaps)).toBeLessThanOrEqual(2);
});

test('a stream that opens but never sends gives up after the staleness limit', async ({ page }) => {
  await page.clock.install();
  let opened!: () => void;
  const streamOpened = new Promise<void>((r) => (opened = r));
  await page.route(STREAM, () => { opened(); return new Promise(() => {}); }); // hangs: no event, no error
  await page.route(JSON_URL, (r) => r.abort());
  await open(page);
  const board = page.locator('.hero .board');
  await expect(board).toHaveAttribute('data-state', 'connecting');
  // the stream opens once the widget is seen on screen; only then is its staleness timer running
  await streamOpened;
  await page.clock.fastForward(21_000);
  await expect(board).toHaveAttribute('data-state', 'offline');
  await expect(board.locator('[data-f="running"]')).toHaveText('Status unavailable');
});

test('without the stream, the JSON fallback keeps refreshing, and goes offline when it stops answering', async ({ page }) => {
  await page.clock.install();
  let calls = 0;
  let up = true;
  await page.route(STREAM, (r) => r.abort());
  await page.route(JSON_URL, (r) => {
    calls++;
    return up ? r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify(event()) }) : r.abort();
  });
  await open(page);
  const board = page.locator('.hero .board');
  await expect(board).toHaveAttribute('data-state', 'online');
  const first = calls;
  await page.clock.fastForward(11_000);
  await expect.poll(() => calls).toBeGreaterThan(first); // a snapshot is not presented as live forever
  up = false;
  const before = calls;
  // advance until a poll has actually failed (a request already in flight may still land as a success)
  await expect.poll(async () => { await page.clock.fastForward(6_000); return calls; }).toBeGreaterThan(before + 1);
  await expect(board).toHaveAttribute('data-state', 'offline');
});
