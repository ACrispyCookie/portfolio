import { expect, test } from '@playwright/test';

test('Other projects: 7 course cards, 17 rows linking to course sections, no borders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#other .group')).toHaveCount(7);
  const rows = page.locator('#other .mini a');
  await expect(rows).toHaveCount(17);
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

test('desktop: lanes under 1000px, the gap is a plain break, no gradients', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
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

test('phone: three git-graph rails instead of lanes', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone');
  await page.goto('/');
  await expect(page.locator('#timeline .tll')).toBeVisible();
  await expect(page.locator('#timeline .tlw')).toBeHidden();
  await expect(page.locator('#timeline .tll .it')).toHaveCount(8);
  await expect(page.locator('#timeline .tll .it small').nth(3)).toHaveText('Education: University of Thessaly, 09/2022 – now');
});

test('desktop: first rows of the groups in one row line up', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  const tops = await page.locator('#other .group').evaluateAll((gs) => gs.slice(0, 4).map((g) => Math.round(g.querySelector('.mini a')!.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
});

test('every teaching entry says it was a lab-assistant role', async ({ page }, info) => {
  await page.goto('/');
  const sel = info.project.name === 'phone' ? '#timeline .tll .it:has(.r.teaching.n)' : '#timeline .lane.teaching .ev';
  const texts = await page.locator(sel).allInnerTexts();
  expect(texts).toHaveLength(3);
  for (const t of texts) expect(t).toMatch(/Lab assistant/);
});

test('desktop: entries in a lane never overlap', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
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
