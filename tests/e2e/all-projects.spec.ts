import { expect, test } from '@playwright/test';

test('All projects: counts, personal first, then courses in report-card order', async ({ page }) => {
  await page.goto('/projects');
  // header counts are computed: 28 projects and 11 courses today
  await expect(page.locator('main h1')).toHaveText('Projects');
  await expect(page.locator('.counts')).toHaveText('28 projects and 11 courses');
  // personal first, then courses in report-card order (courses.order)
  await expect(page.locator('.personal a b')).toHaveText(['Homelab', 'Live FPGA Lab', 'DVD Logo FPGA']);
  await expect(page.locator('.course a.ch b')).toHaveText(['ECE494', 'ECE436', 'ECE433', 'ECE318', 'ECE321', 'ECE415', 'ECE455', 'ECE348', 'ECE338', 'ECE333', 'ECE340']);
  // ECE415: grade, main project first to its page, then the four smaller to their sections
  const ece415 = page.locator('.course', { has: page.locator('b', { hasText: 'ECE415' }) });
  await expect(ece415.locator('.g')).toHaveText('9.5');
  expect(await ece415.locator('ul li a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(
    ['/courses/ece415/nbody', '/courses/ece415#sobel', '/courses/ece415#kmeans', '/courses/ece415#conv', '/courses/ece415#clahe']);
  await expect(ece415.locator('a.ch')).toHaveAttribute('href', '/courses/ece415');
});

test('All projects: every link stays on the site, as a page or a section', async ({ page }) => {
  await page.goto('/projects');
  const hrefs = await page.locator('main a').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThan(30);
  for (const h of hrefs) expect(h).toMatch(/^(\/projects\/[a-z0-9-]+|\/courses\/ece\d{3}(\/[a-z0-9-]+|#[a-z0-9-]+)?|#[a-z0-9-]+)$/);
});

test('the way to it: top bar, footer, and two "See all" links on home', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topbar nav a', { hasText: 'Projects' })).toHaveAttribute('href', '#projects');
  await expect(page.locator('.foot .links a').first()).toHaveText('Projects');
  await expect(page.locator('.foot .links a').first()).toHaveAttribute('href', '/projects');
  const seeAll = page.locator('main a.seeall');
  await expect(seeAll).toHaveCount(2);
  for (const id of ['projects', 'other']) {
    await expect(page.locator(`#${id} a.seeall`)).toHaveAttribute('href', '/projects');
    // it's the section's last link, and it reads the full wording where it fits (the short one below 420px)
    const last = page.locator(`#${id} a`).last();
    await expect(last).toHaveText(page.viewportSize()!.width > 420 ? 'See all 28 projects and 11 courses' : 'See all projects and courses', { useInnerText: true });
  }
  await page.goto('/projects');
  await expect(page.locator('.topbar nav a', { hasText: 'Projects' })).toHaveAttribute('href', '/projects');
});
