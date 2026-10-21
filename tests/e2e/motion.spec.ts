import { test, expect, type Page } from '@playwright/test';
import { phoneLayout } from './helpers/layout';

// shown = laid out, opaque and reachable; off = transparent and inert (no visibility switch: Safari repaints it badly)
const pillShown = (page: Page) => page.locator('.topbar .labpill').evaluate((e) => { const c = getComputedStyle(e); return c.display !== 'none' && parseFloat(c.opacity) > 0.5 && !(e as HTMLElement).inert; });
const widgetOnScreen = (page: Page) =>
  page.evaluate(() => {
    const r = document.querySelector('.hero .board')!.getBoundingClientRect();
    return r.bottom > 64 && r.top < innerHeight;
  });

test('home: the pill is shown exactly when the widget is off screen (v5 rule)', async ({ page }) => {
  await page.route('https://fpga.njason.dev/**', (r) => r.abort());
  await page.goto('/');
  // the pill fades both ways, so wait for it to settle rather than a fixed time
  await expect.poll(async () => (await pillShown(page)) === !(await widgetOnScreen(page))).toBe(true);
  await page.locator('.hero .board').scrollIntoViewIfNeeded();
  await expect.poll(() => pillShown(page)).toBe(false);
  // until the rest of the page exists, a spacer stands in for it so the widget can scroll away
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.height = '3000px';
    document.querySelector('main')!.append(d);
    scrollTo(0, document.querySelector('.hero')!.getBoundingClientRect().bottom + scrollY + 200);
  });
  await expect.poll(() => pillShown(page)).toBe(true);
});

test('desktop: the pill is hidden at the very top', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  await page.waitForTimeout(400);
  expect(await pillShown(page)).toBe(false);
});

test('other pages show the pill at once', async ({ page }) => {
  await page.goto('/pill-test/');
  await expect(page.locator('.topbar .labpill')).toBeVisible();
});

test('reduced motion: nothing in main is see-through and the hidden pill is display:none', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(400);
  const faint = await page.evaluate(() => [...document.querySelectorAll('main *')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 1).map((e) => e.className));
  expect(faint).toEqual([]);
  expect(await page.locator('.topbar .labpill').evaluate((el) => getComputedStyle(el).display)).toBe('none');
  await ctx.close();
});

test('without JavaScript nothing in main is see-through and the pill is visible', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  const faint = await page.evaluate(() => [...document.querySelectorAll('main *')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 1).length);
  expect(faint).toBe(0);
  await expect(page.locator('.topbar .labpill')).toBeVisible();
  await ctx.close();
});

test('home: the pill fades out when the widget comes back, then ends invisible', async ({ page }) => {
  await page.route('https://fpga.njason.dev/**', (r) => r.abort());
  await page.goto('/');
  await page.evaluate(() => scrollTo({ top: 1400, behavior: 'instant' }));
  await expect(page.locator('.topbar .labpill')).toBeVisible();
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const pill = document.querySelector('.topbar .labpill')!;
    (window as any).__fade = [];
    pill.addEventListener('transitionrun', (e) => { if ((e as TransitionEvent).propertyName === 'opacity') (window as any).__fade.push('run'); });
    pill.addEventListener('transitionend', (e) => { if ((e as TransitionEvent).propertyName === 'opacity') (window as any).__fade.push('end'); });
  });
  await page.evaluate(() => document.querySelector('.hero .board')!.scrollIntoView({ block: 'center', behavior: 'instant' }));
  // a real fade: the browser reports an opacity transition starting and ending (events, not frame sampling, so a
  // browser that draws few frames can't skip past it)
  await expect.poll(() => page.evaluate(() => (window as any).__fade), { timeout: 2000 }).toEqual(['run', 'end']);
  // then transparent and inert, keeping its place in the bar (nothing beside it moves), never visibility:hidden
  await expect.poll(() => page.locator('.topbar .labpill').evaluate((el) => { const c = getComputedStyle(el); return `${c.opacity} ${(el as HTMLElement).inert} ${c.visibility}`; }), { timeout: 2000 }).toBe('0 true visible');
});

test('home: with the widget on screen, the pill never shows, not even for a frame at load', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'the widget is on the first screen on desktop');
  await page.addInitScript(() => {
    (window as any).__pillSeen = false;
    const sample = () => {
      const p = document.querySelector('.topbar .labpill');
      if (p) { const cs = getComputedStyle(p); if (cs.display !== 'none' && parseFloat(cs.opacity) > 0.01) (window as any).__pillSeen = true; }
      if (performance.now() < 3000) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  // a slow phone: the page's scripts arrive a second after the first paint
  await page.route(/\/_astro\/.*\.js$/, async (r) => { await new Promise((ok) => setTimeout(ok, 1000)); await r.continue(); });
  await page.goto('/');
  await page.waitForTimeout(3200);
  expect(await page.evaluate(() => (window as any).__pillSeen)).toBe(false);
});

test('home: the pill fades in and out, and nothing else in the top bar moves', async ({ page }) => {
  await page.route('https://fpga.njason.dev/**', (r) => r.abort());
  await page.goto('/');
  const board = page.locator('.hero .board');
  const bar = () => page.locator('.topbar .name, .topbar nav a, .menu summary').evaluateAll((els) =>
    els.filter((e) => (e as HTMLElement).offsetParent).map((e) => Math.round(e.getBoundingClientRect().left)));
  // record the pill's opacity every frame while it changes
  const frames = async (move: () => Promise<void>) => {
    await page.evaluate(() => {
      (window as any).__ev = [];
      const pill = document.querySelector('.topbar .labpill')!;
      if (!(window as any).__listening) {
        (window as any).__listening = true;
        for (const t of ['transitionrun', 'transitionend']) pill.addEventListener(t, (e) => { if ((e as TransitionEvent).propertyName === 'opacity') (window as any).__ev.push(t); });
      }
      (window as any).__o = [];
      const s = () => { const e = document.querySelector('.topbar .labpill') as HTMLElement; const c = getComputedStyle(e); (window as any).__o.push(c.display === 'none' || (e.inert && +c.opacity === 0) ? -1 : +c.opacity); if ((window as any).__o.length < 40) requestAnimationFrame(s); };
      requestAnimationFrame(s);
    });
    await move();
    await page.waitForTimeout(900);
    return page.evaluate(() => ({ o: (window as any).__o as number[], ev: (window as any).__ev as string[] }));
  };
  await board.evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(600);
  const before = await bar();
  const appear = await frames(() => page.evaluate(() => scrollTo({ top: 4000, behavior: 'instant' })));
  expect(appear.ev, `appear: an opacity transition runs and ends (frames ${appear.o.join(' ')})`).toEqual(['transitionrun', 'transitionend']);
  expect(await bar(), 'the name, links and Menu stay put when the pill appears').toEqual(before);
  const disappear = await frames(() => board.evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'instant' })));
  expect(disappear.ev, `disappear: an opacity transition runs and ends (frames ${disappear.o.join(' ')})`).toEqual(['transitionrun', 'transitionend']);
  expect(disappear.o.at(-1)).toBe(-1); // ends invisible
  expect(await bar(), 'and stay put when it disappears').toEqual(before);
});

test('home: Tab never lands on the pill while it is off', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'the pill is off at the top only where the widget is on the first screen');
  await page.goto('/');
  await expect.poll(() => page.locator('.topbar .labpill').evaluate((e) => (e as HTMLElement).inert)).toBe(true);
  const stops: string[] = [];
  for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); stops.push(await page.evaluate(() => document.activeElement?.className ?? '')); }
  expect(stops.join(' ')).not.toContain('labpill');
});
