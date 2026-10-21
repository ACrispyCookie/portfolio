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
  await expect(board).toHaveAttribute('data-state', 'running');
  await expect(board.locator('[data-f="headline"]')).toHaveText('GPGPU n-body');
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
  await expect(board.locator('[data-f="headline"]')).toHaveText('Status unavailable');
  await expect(board.locator('[data-f="temp-tag"]')).toBeHidden();
  await expect(board.getByRole('link', { name: 'Open the lab' })).toHaveAttribute('href', 'https://fpga.njason.dev');
  expect(errors).toEqual([]);
});

test('a missing temperature hides its tag instead of guessing', async ({ page }) => {
  await serveStream(page, event({ temperature_c: null }));
  await open(page);
  await expect(page.locator('.hero .board')).toHaveAttribute('data-state', 'running');
  await expect(page.locator('.hero [data-f="temp-tag"]')).toBeHidden();
});

test('a long board name does not overflow at 360px', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await serveStream(page, event({ name: 'A very long board name that keeps going past any sane width', active_demo: 'an-unlisted-demo-with-a-very-long-identifier' }));
  await open(page);
  await expect(page.locator('.hero .board')).toHaveAttribute('data-state', 'running');
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

// Jason (2026-10-21): the status updates live, without a reload, wherever you are on the site.
// The stream answers with one event and ends; the browser reconnects after `retry` ms and gets the next one.
async function serveSequence(page: Page, events: Record<string, unknown>[]) {
  let n = 0;
  await page.route(STREAM, (route) => {
    const e = events[Math.min(n++, events.length - 1)];
    return route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-cache' }, body: `retry: 300\nevent: board\ndata: ${JSON.stringify(e)}\n\n` });
  });
  await page.route(JSON_URL, (r) => r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify(events[0]) }));
}
const cssColor = (page: Page, v: string) => page.evaluate((v) => { const p = document.createElement('i'); p.style.color = `var(${v})`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; }, v);

test('home: the status updates live, even with the widget scrolled away', async ({ page }) => {
  await serveSequence(page, [event({ active_demo: null }), event({ active_demo: null }), event()]); // free, free, then a demo starts
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, 4000)); // the widget is off screen; the pill shows
  const cyan = await cssColor(page, '--color-cyan');
  await expect.poll(() => page.locator('.topbar .labpill .sdot').evaluate((d) => getComputedStyle(d).backgroundColor), { timeout: 5000 }).toBe(cyan);
  await expect(page.locator('.hero .board [data-f="headline"]')).toHaveText('GPGPU n-body');
});

test('other pages: the pill updates live too', async ({ page }) => {
  await serveSequence(page, [event({ mode: 'project' }), event({ mode: 'project' }), event({ mode: 'project' }), event({ mode: 'project' }), event()]);
  await page.goto('/pill-test/');
  const [amber, cyan] = [await cssColor(page, '--color-amber'), await cssColor(page, '--color-cyan')];
  const dot = () => page.locator('.topbar .labpill .sdot').evaluate((d) => getComputedStyle(d).backgroundColor);
  await expect.poll(dot, { timeout: 5000 }).toBe(amber);
  await expect.poll(dot, { timeout: 5000 }).toBe(cyan);
});

test('the stream closes while the tab is hidden and reopens when it is shown', async ({ page }) => {
  let opened = 0;
  await page.route(STREAM, (r) => { opened++; return r.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' }, body: `retry: 200\nevent: board\ndata: ${JSON.stringify(event())}\n\n` }); });
  await page.goto('/');
  await expect.poll(() => opened).toBeGreaterThan(0);
  const setHidden = (hidden: boolean) => page.evaluate((h) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  await setHidden(true);
  const atHide = opened;
  await page.waitForTimeout(1000); // with retry 200 an open stream would reconnect several times
  expect(opened - atHide).toBeLessThanOrEqual(1);
  await setHidden(false);
  await expect.poll(() => opened, { timeout: 3000 }).toBeGreaterThan(atHide + 1);
});


for (const outcome of ['running', 'offline'] as const) {
  test(`the widget keeps its height from load until the lab answers (${outcome})`, async ({ page }) => {
    if (outcome === 'running') await serveStream(page, event()); else await failLab(page);
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
  await expect(board.locator('[data-f="headline"]')).toHaveText('Status unavailable');
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
  await expect(board).toHaveAttribute('data-state', 'running');
  const first = calls;
  await page.clock.fastForward(11_000);
  await expect.poll(() => calls).toBeGreaterThan(first); // a snapshot is not presented as live forever
  up = false;
  const before = calls;
  // advance until a poll has actually failed (a request already in flight may still land as a success)
  await expect.poll(async () => { await page.clock.fastForward(6_000); return calls; }).toBeGreaterThan(before + 1);
  await expect(board).toHaveAttribute('data-state', 'offline');
});

// Jason (2026-10-21): only a running demo is "Running now"; every other state is its own message, and every lab dot on
// the page shows the same status colour, without blinking.
const STATES = [
  { name: 'running', patch: {}, label: 'Running now', headline: 'GPGPU n-body' },
  { name: 'available', patch: { active_demo: null }, label: '', headline: 'Free to use' },
  { name: 'testing', patch: { mode: 'project' }, label: '', headline: 'Reserved for owner projects' }, // the lab's own words
  { name: 'fault', patch: { healthy: false }, label: '', headline: 'Board fault' },
] as const;
const DOT = { running: '--color-cyan', available: '--color-mint', testing: '--color-amber', fault: '--color-fault', offline: '--color-dim' };

for (const s of STATES) {
  test(`${s.name}: its own message, and every lab dot in the ${s.name} colour, still`, async ({ page }) => {
    await serveStream(page, event(s.patch));
    await page.route(JSON_URL, (r) => r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify(event(s.patch)) }));
    await open(page);
    const board = page.locator('.hero .board');
    await expect(board).toHaveAttribute('data-state', s.name);
    await expect(board.locator('[data-f="label"]')).toHaveText(s.label);
    await expect(board.locator('[data-f="headline"]')).toHaveText(s.headline);
    const read = () => page.locator('.sdot').evaluateAll((ds, v) => {
      const want = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
      const probe = document.createElement('i'); probe.style.color = want; document.body.append(probe);
      const rgb = getComputedStyle(probe).color; probe.remove();
      return { n: ds.length, off: ds.filter((d) => getComputedStyle(d).backgroundColor !== rgb).length, animated: ds.filter((d) => getComputedStyle(d).animationName !== 'none').length };
    }, DOT[s.name]);
    // the dots ease to the new colour; once settled every one matches and none animates
    await expect.poll(async () => (await read()).off, { timeout: 3000 }).toBe(0);
    const r = await read();
    expect(r.n).toBeGreaterThanOrEqual(3); // widget band, top-bar pill, the lab card's tag
    expect(r.animated).toBe(0); // the dot itself never dims or flashes
    // Jason (2026-10-21): a ripple grows out of every dot while the board is in use or free; none on a fault
    const ripples = await page.locator('.sdot').evaluateAll((ds) => ds.map((d) => getComputedStyle(d, '::after').animationName));
    for (const a of ripples) expect(a === 'none', `ripple: ${a}`).toBe(s.name === 'fault');
  });
}

test('offline: the dots are grey, and the widget says so', async ({ page }) => {
  await failLab(page);
  await open(page);
  await expect(page.locator('.hero .board [data-f="headline"]')).toHaveText('Status unavailable');
  const dim = await page.evaluate(() => { const p = document.createElement('i'); p.style.color = 'var(--color-dim)'; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; });
  await expect.poll(() => page.locator('.sdot').evaluateAll((ds, c) => ds.filter((d) => getComputedStyle(d).backgroundColor !== c).length, dim), { timeout: 3000 }).toBe(0);
  const ripples = await page.locator('.sdot').evaluateAll((ds) => ds.map((d) => getComputedStyle(d, '::after').animationName));
  for (const a of ripples) expect(a).toBe('none'); // unreachable: no ripple
});

test("other pages: the pill's dot shows the lab's status from one request", async ({ page }) => {
  let calls = 0;
  await page.route(STREAM, (r) => r.abort());
  await page.route(JSON_URL, (r) => { calls++; return r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify(event({ mode: 'project' })) }); });
  await page.goto('/pill-test/');
  const amber = await page.evaluate(() => { const p = document.createElement('i'); p.style.color = 'var(--color-amber)'; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; });
  await expect.poll(() => page.locator('.topbar .labpill .sdot').evaluate((d) => getComputedStyle(d).backgroundColor)).toBe(amber);
  expect(calls).toBe(1);
});

test('reduced motion: the dots keep their colour but never ripple', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await serveStream(page, event());
  await open(page);
  await expect(page.locator('.hero .board')).toHaveAttribute('data-state', 'running');
  const ripples = await page.locator('.sdot').evaluateAll((ds) => ds.map((d) => getComputedStyle(d, '::after').animationName));
  for (const a of ripples) expect(a).toBe('none');
  await ctx.close();
});
