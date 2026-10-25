import { test, expect } from '@playwright/test';
import { heroColumns, phoneLayout } from './helpers/layout';

const SENTENCE = 'I build systems from code down to hardware: GPUs on FPGAs, CUDA programs, filesystems and distributed runtimes.';
const WIDTHS: [number, number, boolean][] = [
  [1440, 900, false], [1280, 720, false], [1100, 800, false], [1024, 768, false],
  [800, 1000, false], [760, 1000, true], [390, 844, true], [360, 640, true],
];

test.describe('hero layout at every width', () => {
  test.skip(({ isMobile }) => isMobile, 'widths are set per test; run once, on the desktop project');
  for (const [w, h, mobile] of WIDTHS) {
    test(`no overlap and no sideways scroll at ${w}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
      const page = await ctx.newPage();
      await page.goto('/');
      const r = await page.evaluate(() => {
        const sel = ['.cover', '.who', '.side', '.now'];
        const boxes = sel.map((s) => [s, document.querySelector(s)!.getBoundingClientRect()] as const);
        const overlaps: string[] = [];
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const [a, b] = [boxes[i][1], boxes[j][1]];
            if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps.push(`${boxes[i][0]} x ${boxes[j][0]}`);
          }
        return { overlaps, sideways: document.documentElement.scrollWidth - innerWidth };
      });
      expect(r.overlaps).toEqual([]);
      expect(r.sideways).toBeLessThanOrEqual(0);
      await ctx.close();
    });
  }
});

test('hero copy and buttons match the spec', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.who h1')).toHaveText(/Jason\s*Nikas/);
  await expect(page.locator('.who p.does')).toHaveText(SENTENCE);
  await expect(page.locator('.who p.school')).toHaveText('Electrical and Computer Engineering student at the University of Thessaly');
  const cta = page.locator('.cta a');
  expect((await cta.allTextContents()).map((t) => t.trim())).toEqual(['See my projects', 'GitHub', 'LinkedIn']);
  await expect(cta.first()).toHaveClass(/btn-primary/);
  await expect(cta.first()).toHaveAttribute('href', '/projects'); // the page, as every Projects link (Jason, 2026-10-23)
  const now = page.locator('.now a');
  expect((await now.locator('h3').allTextContents()).map((t) => t.trim())).toEqual(['GPGPU v2', 'Homelab']);
});

test('two-column hero: matching column bottoms; at 1440 the photo is 520–560px', async ({ page }) => {
  test.skip(!heroColumns(page));
  await page.goto('/');
  const r = await page.evaluate(() => {
    const b = (s: string) => document.querySelector(s)!.getBoundingClientRect();
    return { w: b('.cover').width, l: b('.lcol').bottom, r: b('.rcol').bottom, nowB: b('.now').bottom, sideB: b('.side').bottom };
  });
  if (page.viewportSize()!.width === 1440) {
    expect(r.w).toBeGreaterThanOrEqual(520);
    expect(r.w).toBeLessThanOrEqual(560);
  }
  expect(Math.abs(r.nowB - r.sideB)).toBeLessThanOrEqual(2);
});

test('phone layout: a square photo while there is room, and order photo, name, widget, now', async ({ page }) => {
  test.skip(!phoneLayout(page));
  await page.goto('/');
  const r = await page.evaluate(() => {
    const b = (s: string) => document.querySelector(s)!.getBoundingClientRect();
    return { ratio: b('.cover').width / b('.cover').height, tops: ['.cover', '.who', '.side', '.now'].map((s) => b(s).top) };
  });
  expect(r.ratio).toBeGreaterThanOrEqual(0.98); // square, or wider where a short screen trims it (Jason, 2026-10-25)
  expect([...r.tops].sort((a, b) => a - b)).toEqual(r.tops);
});

for (const [w, h, phone] of [[734, 343, 'iPhone 15'], [932, 400, 'iPhone 15 Pro Max']] as const) {
  test(`phone held sideways (${phone}): the photo takes half the width and the screen's height, the name beside it (Jason, 2026-10-25: too small)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    const r = await page.evaluate(() => {
      const b = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      return { cover: b('.cover'), top: b('.top'), name: b('h1') };
    });
    expect(r.cover.width / r.top.width).toBeGreaterThan(0.54); // more than half (Jason, 2026-10-25: could be bigger)
    expect(r.name.left).toBeGreaterThan(r.cover.right); // the name beside it
    // exactly as tall as the name and text beside it: no empty strip under either (Jason, 2026-10-25)
    const who = await page.locator('.who').evaluate((e) => e.getBoundingClientRect());
    expect(Math.abs(r.cover.top - who.top)).toBeLessThan(2);
    expect(Math.abs(r.cover.bottom - who.bottom)).toBeLessThan(2);
    expect(r.name.top).toBeGreaterThanOrEqual(0); // and on the first screen
    expect(r.name.bottom).toBeLessThan(h);
    // a box wider than tall trims the photo, but the summit (~14% down) stays in view
    const hidden = await page.locator('.cover img').evaluate((i: HTMLImageElement) => {
      const box = i.getBoundingClientRect(), scale = Math.max(box.width / i.naturalWidth, box.height / i.naturalHeight);
      return ((i.naturalHeight * scale - box.height) * parseFloat(getComputedStyle(i).objectPosition.split(' ')[1]) / 100) / (i.naturalHeight * scale);
    });
    expect(hidden).toBeLessThan(0.1);
  });
}

test('iPhone 15 upright: the photo spans the width, never a narrower box on the left (Jason, 2026-10-25)', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 659 });
  await page.goto('/');
  const r = await page.evaluate(() => ({ cover: document.querySelector('.cover')!.getBoundingClientRect(), top: document.querySelector('.top')!.getBoundingClientRect() }));
  expect(Math.abs(r.cover.width - r.top.width)).toBeLessThan(2);
});

test('iPhone 15 upright: a trimmed photo still shows the top of Fuji (it sits ~14% down the photo; Jason, 2026-10-25)', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 659 });
  await page.goto('/');
  const hidden = await page.locator('.cover img').evaluate((i: HTMLImageElement) => {
    const box = i.getBoundingClientRect();
    const scale = Math.max(box.width / i.naturalWidth, box.height / i.naturalHeight);
    const extra = i.naturalHeight * scale - box.height; // how much the crop trims, in screen px
    const y = parseFloat(getComputedStyle(i).objectPosition.split(' ')[1]) / 100;
    return (extra * y) / (i.naturalHeight * scale); // the share of the photo hidden above the box
  });
  expect(hidden).toBeLessThan(0.1);
});

test('phones upright: the photo is as big as it can be with the name still on the first screen, a full square on an iPhone 15 (Jason, 2026-10-25)', async ({ page }) => {
  for (const [w, h] of [[393, 659], [320, 568], [430, 739]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    const r = await page.evaluate(() => ({ cover: document.querySelector('.cover')!.getBoundingClientRect(), name: document.querySelector('h1')!.getBoundingClientRect() }));
    expect(r.name.bottom, `${w}x${h}`).toBeLessThanOrEqual(h);
    expect(r.cover.height, `${w}x${h}: square, or only as short as the name needs`).toBeGreaterThanOrEqual(Math.min(r.cover.width, h - 230) - 1);
  }
});
