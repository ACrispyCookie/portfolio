import { expect, test } from '@playwright/test';
import { phoneLayout, railsLayout } from './helpers/layout';

test('Other projects: 7 course cards, 18 rows linking to course sections, no borders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#other .group')).toHaveCount(7);
  const rows = page.locator('#other .mini a');
  await expect(rows).toHaveCount(18);
  for (const href of await rows.evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) expect(href).toMatch(/^\/courses\/ece\d{3}#[a-z0-9-]+$/);
  const borders = await rows.evaluateAll((as) => as.filter((a) => parseFloat(getComputedStyle(a).borderTopWidth) > 0 || getComputedStyle(a).boxShadow !== 'none').length);
  expect(borders).toBe(0);
  await expect(page.locator('#other .group h3').first()).toHaveText('ECE415 High Performance Computing');
});

test('section order: glance, projects, other, timeline, skills, contact', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('main > section[id]').evaluateAll((s) => s.map((e) => e.id));
  expect(ids).toEqual(['glance', 'projects', 'other', 'timeline', 'skills', 'contact']);
});

test('lanes layout: under 1000px, the gap is a plain break, no gradients', async ({ page }) => {
  test.skip(railsLayout(page));
  await page.goto('/');
  const h = await page.locator('#timeline').evaluate((e) => e.getBoundingClientRect().height);
  expect(h).toBeLessThan(1000);
  await expect(page.locator('#timeline .tlw')).toBeVisible();
  await expect(page.locator('#timeline .tll')).toBeHidden();
  await expect(page.locator('#timeline .lane .brk')).toHaveCount(3);
  const grads = await page.locator('#timeline, #timeline *').evaluateAll((els) => els.filter((e) => getComputedStyle(e).backgroundImage !== 'none').length);
  expect(grads).toBe(0);
  const labels = await page.locator('#timeline .axis span').allTextContents();
  expect(labels).not.toContain('2024');
});

test('rails layout: three git-graph rails instead of lanes', async ({ page }) => {
  test.skip(!railsLayout(page));
  await page.goto('/');
  await expect(page.locator('#timeline .tll')).toBeVisible();
  await expect(page.locator('#timeline .tlw')).toBeHidden();
  await expect(page.locator('#timeline .tll .it')).toHaveCount(8);
  await expect(page.locator('#timeline .tll .it small').nth(3)).toHaveText('Education: University of Thessaly, 09/2022 – now');
});

test('wide layout: first rows of the groups in one grid row line up', async ({ page }) => {
  test.skip(phoneLayout(page));
  await page.goto('/');
  // groups whose headings start on the same line share a grid row; their first rows must line up too
  const rows = await page.locator('#other .group').evaluateAll((gs) => {
    const by = new Map<number, number[]>();
    for (const g of gs) {
      const t = Math.round(g.getBoundingClientRect().top);
      by.set(t, [...(by.get(t) ?? []), Math.round(g.querySelector('.mini a')!.getBoundingClientRect().top)]);
    }
    return [...by.values()];
  });
  expect(rows.some((r) => r.length > 1)).toBe(true);
  for (const r of rows) expect(new Set(r).size).toBe(1);
});

test('every teaching entry says it was a lab-assistant role', async ({ page }) => {
  await page.goto('/');
  const sel = railsLayout(page) ? '#timeline .tll .it:has(.r.teaching.n)' : '#timeline .lane.teaching .ev';
  const texts = await page.locator(sel).allInnerTexts();
  expect(texts).toHaveLength(3);
  for (const t of texts) expect(t).toMatch(/Lab assistant/);
});

test('lanes layout: entries in a lane never overlap', async ({ page }) => {
  test.skip(railsLayout(page));
  await page.goto('/');
  const overlaps = await page.locator('#timeline .lane').evaluateAll((lanes) => lanes.flatMap((l) => {
    const r = [...l.querySelectorAll('.ev > div')].map((d) => d.getBoundingClientRect()).sort((a, b) => a.top - b.top);
    return r.slice(1).filter((b, i) => b.top < r[i].bottom - 0.5).map((b) => `${l.className} @${Math.round(b.top)}`);
  }));
  expect(overlaps).toEqual([]);
});

test('ECE433 has no Other projects card: its homeworks are not projects (Jason, 2026-10-21)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#other .group h3', { hasText: 'ECE433' })).toHaveCount(0);
});

test('ECE333 lists all four labs, Lab 1 first', async ({ page }) => {
  await page.goto('/');
  const g = page.locator('#other .group', { has: page.locator('h3', { hasText: 'ECE333' }) });
  await expect(g.locator('.mini a b')).toHaveText(['Seven-segment display', 'UART', 'VGA controller', 'Accelerometer over SPI']);
});

test('lanes that would overlap give way to the rails, at any text size', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  await expect(page.locator('#timeline .tlw')).toBeVisible();
  // a reader with larger text: the lanes no longer fit, so the rails take over
  await page.evaluate(() => (document.documentElement.style.fontSize = '150%'));
  await page.setViewportSize({ width: 1300, height: 900 }); // zoom changes the column width, which runs the check
  await expect(page.locator('#timeline')).toHaveClass(/\brails\b/);
  await expect(page.locator('#timeline .tll')).toBeVisible();
  // back to normal text: the lanes return
  await page.evaluate(() => (document.documentElement.style.fontSize = ''));
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#timeline')).not.toHaveClass(/\brails\b/);
});
