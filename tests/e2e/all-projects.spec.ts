import { expect, test } from '@playwright/test';

test('All projects: counts, personal first, then courses by importance as on home', async ({ page }) => {
  await page.goto('/projects');
  // header counts are computed: 28 projects and 11 courses today
  await expect(page.locator('main h1')).toHaveText('Projects');
  await expect(page.locator('.counts')).toHaveText('28 projects and 11 courses');
  // personal first, then courses by importance: the order of their best-placed project on home, never by grade
  // (Jason, 2026-10-22)
  await expect(page.locator('.personal a b')).toHaveText(['Homelab', 'Live FPGA Lab', 'DVD Logo FPGA']);
  await expect(page.locator('.course a.ch .cn b')).toHaveText(['ECE338', 'ECE415', 'ECE455', 'ECE436', 'ECE433', 'ECE348', 'ECE321', 'ECE318', 'ECE494', 'ECE333', 'ECE340']);
  // ECE415: grade, main project first to its page, then the four smaller to their sections
  const ece415 = page.locator('.course', { has: page.locator('b', { hasText: 'ECE415' }) });
  // the grade says what it is
  await expect(ece415.locator('.g')).toHaveText('Grade 9.5 / 10', { useInnerText: true });
  expect(await ece415.locator('ul li a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(
    ['/courses/ece415/nbody', '/courses/ece415#sobel', '/courses/ece415#kmeans', '/courses/ece415#conv', '/courses/ece415#clahe']);
  await expect(ece415.locator('a.ch')).toHaveAttribute('href', '/courses/ece415');
});

test('All projects: every link stays on the site, as a page or a section (apart from people and the older portfolio)', async ({ page }) => {
  await page.goto('/projects');
  const hrefs = await page.locator('main a:not(.av a):not(.origin)').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
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

test('All projects: the older portfolio, as on home', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('#personal a.origin')).toHaveAttribute('href', 'https://acrispycookie.dev');
});

test('All projects: each course names its collaborators, and solo courses name none', async ({ page }) => {
  await page.goto('/projects');
  const course = (code: string) => page.locator('.course', { has: page.locator('a.ch .cn b', { hasText: code }) });
  await expect(course('ECE415').locator('.with')).toHaveText('With Dimitrios Tsiantos and Panagiotis Nikolaos Tsogkas', { useInnerText: true });
  await expect(course('ECE415').locator('.with .av a')).toHaveCount(2);
  await expect(course('ECE340').locator('.with')).toHaveText('With Panagiotis Nikolaos Tsogkas', { useInnerText: true });
  for (const solo of ['ECE348', 'ECE333']) await expect(course(solo).locator('.with')).toHaveCount(0);
});

test('All projects: every project shows its tools, six at most', async ({ page }) => {
  await page.goto('/projects');
  const rows = page.locator('.personal li, .course li');
  await expect(rows).toHaveCount(28);
  for (const r of await rows.all()) {
    const tags = r.locator('.tools .tag');
    const n = await tags.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(6);
  }
  // up to six tools show in full (N-body has six); a longer list shows five and "+N" (Homelab has 13)
  const row = (t: string) => page.locator('.personal li, .course li', { has: page.locator('a', { hasText: t }) });
  await expect(row('N-body on GPUs').locator('.tools .tag')).toHaveText(['C', 'Python', 'Bash', 'CUDA', 'OpenMP', 'Git']);
  await expect(row('Homelab').locator('.tools .tag')).toHaveText(['JavaScript', 'Bash', 'Docker', 'Nginx', 'WireGuard', '+8']);
  await expect(row('Homelab').locator('.tools .more')).toHaveAttribute('title', 'Pi-hole, Ansible, Proxmox, PostgreSQL, MySQL, Git, Traefik, SQLite');
});
