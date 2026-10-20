import { test, expect } from '@playwright/test';

test('home has doctype, title and one content edge', async ({ page, request }) => {
  // the page never scrolls sideways, and nothing hides overflow
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.body).overflowX)).toBe('visible');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const res = await request.get('/');
  expect((await res.text()).trimStart().toLowerCase().startsWith('<!doctype html>')).toBe(true);
  await page.goto('/');
  await expect(page).toHaveTitle('Jason Nikas');
  const xs = await page.evaluate(() => {
    const left = (el: Element) => Math.round(el.getBoundingClientRect().left);
    return [
      left(document.querySelector('.topbar .name')!),
      ...[...document.querySelectorAll('main > *')].map(left),
      left(document.querySelector('.foot-in > div')!),
    ];
  });
  for (const x of xs) expect(Math.abs(x - xs[0])).toBeLessThanOrEqual(1);
});

test('top bar matches spec', async ({ page }, info) => {
  await page.goto('/');
  const nav = await page.locator('.topbar nav a, .topbar .menu-sheet a:not(.lab)').allTextContents();
  expect([...new Set(nav.map((t) => t.trim()))]).toEqual(['Projects', 'Timeline', 'Skills', 'Contact']);
  if (info.project.name === 'desktop') {
    const bar = await page.locator('.topbar').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { blur: cs.backdropFilter, bg: cs.backgroundColor };
    });
    expect(bar.blur).toBe('none');
    expect(bar.bg).toBe('rgb(11, 29, 33)');
  }
});

test('footer links', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('.foot .links a');
  expect((await links.allTextContents()).map((t) => t.trim())).toEqual(['GitHub', 'LinkedIn', 'Email', 'Older portfolio']);
  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))) {
    expect(href).not.toContain('fpga.njason.dev');
  }
});
