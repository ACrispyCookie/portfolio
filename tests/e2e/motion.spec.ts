import { test, expect, type Page } from '@playwright/test';

const pillShown = (page: Page) => page.locator('.topbar .labpill').isVisible();
const widgetOnScreen = (page: Page) =>
  page.evaluate(() => {
    const r = document.querySelector('.hero .board')!.getBoundingClientRect();
    return r.bottom > 64 && r.top < innerHeight;
  });

test('home: the pill is shown exactly when the widget is off screen (v5 rule)', async ({ page }) => {
  await page.route('https://fpga.njason.dev/**', (r) => r.abort());
  await page.goto('/');
  await page.waitForTimeout(400);
  expect(await pillShown(page)).toBe(!(await widgetOnScreen(page)));
  await page.locator('.hero .board').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(await pillShown(page)).toBe(false);
  // until the rest of the page exists, a spacer stands in for it so the widget can scroll away
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.height = '3000px';
    document.querySelector('main')!.append(d);
    scrollTo(0, document.querySelector('.hero')!.getBoundingClientRect().bottom + scrollY + 200);
  });
  await page.waitForTimeout(400);
  expect(await pillShown(page)).toBe(true);
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
