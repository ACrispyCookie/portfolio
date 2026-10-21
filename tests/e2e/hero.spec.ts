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
  await expect(cta.first()).toHaveAttribute('href', '#projects');
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

test('phone layout: 5:4 photo and order photo, name, widget, now', async ({ page }) => {
  test.skip(!phoneLayout(page));
  await page.goto('/');
  const r = await page.evaluate(() => {
    const b = (s: string) => document.querySelector(s)!.getBoundingClientRect();
    return { ratio: b('.cover').width / b('.cover').height, tops: ['.cover', '.who', '.side', '.now'].map((s) => b(s).top) };
  });
  expect(Math.abs(r.ratio - 1.25)).toBeLessThanOrEqual(0.02);
  expect([...r.tops].sort((a, b) => a - b)).toEqual(r.tops);
});
