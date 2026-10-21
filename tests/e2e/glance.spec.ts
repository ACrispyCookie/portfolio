import { expect, test } from '@playwright/test';

test('At a glance: three readouts with the spec §5.1 sentences', async ({ page }) => {
  await page.goto('/');
  const reads = page.locator('#glance .read');
  await expect(reads).toHaveCount(3);
  const rows = await reads.evaluateAll((els) => els.map((e) => [e.querySelector('b')!.textContent!.trim(), e.querySelector('span')!.textContent!.trim()]));
  expect(rows).toEqual([
    ['27', 'projects on this site, 10 main and 17 smaller'],
    ['4', 'volunteer teaching-assistant roles since 2025'],
    ['8', 'courses graded 9.5 or higher, each with a project on this site'],
  ]);
});

test('report card is folded, opens to 11 flat-bar rows linking to projects', async ({ page }) => {
  await page.goto('/');
  const rc = page.locator('details.rc');
  await expect(rc).not.toHaveAttribute('open', /.*/);
  await expect(rc.locator('li').first()).toBeHidden();
  await rc.locator('summary').click();
  const rows = rc.locator('li');
  await expect(rows).toHaveCount(11);
  await expect(rows.first()).toBeVisible();
  const bars = await rc.locator('.bars i').evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundImage));
  expect(bars).toHaveLength(11);
  for (const b of bars) expect(b).toBe('none');
  const first = await rows.first().evaluate((li) => ({ code: li.querySelector('b')!.textContent, grade: li.querySelector('.g')!.textContent, href: li.querySelector('a')!.getAttribute('href') }));
  expect(first).toEqual({ code: 'ECE494', grade: '10', href: '/courses/ece494#cv32' });
  const dvd = await rc.locator('li', { hasText: 'ECE333' }).locator('a').getAttribute('href');
  expect(dvd).toBe('/projects/dvd-logo-fpga');
});

test('report card summary is a keyboard-reachable 44px target', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('details.rc summary').boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});
