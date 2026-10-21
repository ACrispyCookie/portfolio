import { expect, test } from '@playwright/test';
import { phoneLayout } from './helpers/layout';

test('the Menu sheet holds only the four sections; the lab lives in the pill', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.menu-sheet a')).toHaveText(['Projects', 'Timeline', 'Skills', 'Contact']);
  await expect(page.locator('.menu-sheet a[href*="fpga.njason.dev"]')).toHaveCount(0);
});

test('section links scroll smoothly, and jump under reduced motion', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/glide/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('a section link glides there and lands its heading below the sticky bar', async ({ page }) => {
  await page.goto('/');
  const viaMenu = phoneLayout(page); // the links fold into Menu at phone width only
  if (viaMenu) { await page.locator('.menu summary').tap(); await page.locator('.menu-sheet a', { hasText: 'Skills' }).tap(); }
  else await page.locator('.topbar nav a', { hasText: 'Skills' }).click();
  // mid-flight: smooth scrolling has not arrived yet
  const early = await page.evaluate(() => document.querySelector('#skills h2')!.getBoundingClientRect().top);
  expect(early).toBeGreaterThan(200);
  await expect.poll(() => page.evaluate(() => Math.round(document.querySelector('#skills h2')!.getBoundingClientRect().top)), { timeout: 5000 }).toBeLessThan(140);
  const barBottom = await page.locator('.topbar').evaluate((e) => e.getBoundingClientRect().bottom);
  const top = await page.evaluate(() => document.querySelector('#skills h2')!.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(barBottom);
  if (viaMenu) await expect(page.locator('.menu')).not.toHaveAttribute('open', '');
});
