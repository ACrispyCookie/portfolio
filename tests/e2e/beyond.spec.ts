import { expect, test, type Page } from '@playwright/test';

// Beyond coursework (Jason, 2026-10-23): the projects outside any course, solo or with teammates, led by GPGPU v2.
// Pills, avatars and "Currently working on" all come from each project's data, so the same project shows the same
// pills wherever it appears.

const card = (page: Page, id: string) => page.locator(`main .card[data-id="${id}"]`);
const tags = (page: Page, sel: string) => page.locator(`${sel} .tag`).evaluateAll((ts) => ts.map((t) => (t as HTMLElement).innerText.replace(/\s+/g, ' ').trim()));

test('the section is "Beyond coursework", led by GPGPU v2 as a wide card, on home and on /projects', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#projects .mine .sub-h')).toHaveText('Beyond coursework');
  await expect(page.locator('#projects .mine > .lead')).toHaveText('Built outside any course, on my own or with teammates.');
  await expect(page.locator('#projects .mine .card').first()).toHaveAttribute('data-id', 'gpgpu-v2');
  await expect(page.locator('#projects .mine .card').first()).toHaveClass(/\bwide\b/);
  await page.goto('/projects');
  await expect(page.locator('#beyond h2')).toHaveText('Beyond coursework');
  expect(await page.locator('#beyond .card').evaluateAll((cs) => cs.map((c) => c.getAttribute('data-id')))).toEqual(['gpgpu-v2', 'homelab', 'live-fpga-lab', 'dvd-logo-fpga']);
});

test('projects that grew out of a course both say so, linked to the course', async ({ page }) => {
  for (const path of ['/', '/projects']) {
    await page.goto(path);
    for (const [id, code] of [['gpgpu-v2', 'ece338'], ['dvd-logo-fpga', 'ece333']]) {
      const from = card(page, id).locator('a.tag', { hasText: 'From' });
      await expect(from).toHaveText(`From ${code.toUpperCase()}`, { useInnerText: true });
      await expect(from).toHaveAttribute('href', `/courses/${code}`);
    }
  }
});

test('no "Personal" pill anywhere: a solo project shows only my avatar', async ({ page }) => {
  for (const path of ['/', '/projects']) {
    await page.goto(path);
    await expect(page.locator('main .tag', { hasText: /^Personal$/ })).toHaveCount(0);
    for (const id of ['homelab', 'live-fpga-lab', 'dvd-logo-fpga']) {
      const av = card(page, id).locator('.av a');
      await expect(av).toHaveCount(1);
      await expect(av).toHaveAttribute('href', 'https://github.com/ACrispyCookie');
    }
    await expect(card(page, 'gpgpu-v2').locator('.av a')).toHaveCount(3); // the same team as v1
  }
});

test('in-progress projects say so wherever they appear, and "Currently working on" is every one of them', async ({ page }) => {
  await page.goto('/');
  const now = page.locator('.now a');
  expect(await now.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(['/projects/gpgpu-v2', '/projects/homelab']);
  for (const [i, id] of ['gpgpu-v2', 'homelab'].entries()) {
    const onCard = await tags(page, `main .card[data-id="${id}"]`);
    expect(onCard).toContain('In progress');
    // the row shows the card's pills, less "In progress", which the section's title already says (Jason, 2026-10-23)
    expect(await now.nth(i).locator('.tag').evaluateAll((ts) => ts.map((t) => (t as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).toEqual(onCard.filter((t) => t !== 'In progress'));
  }
  expect(await tags(page, 'main .card[data-id="gpgpu"]')).not.toContain('In progress'); // v1 is finished
});

test('GPGPU v2 shows its progress, from its milestones', async ({ page }) => {
  await page.goto('/');
  const svg = card(page, 'gpgpu-v2').locator('svg.diagram[data-kind="roadmap"]');
  await expect(svg).toHaveCount(1);
  expect(await svg.locator('[data-state]').evaluateAll((ms) => ms.map((m) => m.getAttribute('data-state')))).toEqual(['done', 'done', 'now', 'next', 'next']);
  await expect(svg).toContainText('Memory controller');
});

test('/projects: a solo course says "Solo" beside my avatar, where team courses say "With …"', async ({ page }) => {
  await page.goto('/projects');
  for (const code of ['ECE348', 'ECE333']) {
    const w = page.locator('.course', { has: page.locator('a.ch .cn b', { hasText: code }) }).locator('.with');
    await expect(w).toHaveText('Solo', { useInnerText: true });
    await expect(w.locator('.av a')).toHaveCount(1);
    await expect(w.locator('.av a')).toHaveAttribute('href', 'https://github.com/ACrispyCookie');
  }
});

test('a deployed project has a Live pill that alone leads to its site; the card leads to the project (Jason, 2026-10-23)', async ({ page }) => {
  for (const path of ['/', '/projects']) {
    await page.goto(path);
    const lab = card(page, 'live-fpga-lab');
    await expect(lab.locator('a.hit')).toHaveAttribute('href', '/projects/live-fpga-lab');
    const live = lab.locator('a.tag', { hasText: 'Live' });
    await expect(live).toHaveAttribute('href', 'https://fpga.njason.dev');
    await expect(live.locator('.sdot')).toHaveCount(1);
    // only projects with a deployed site get one (the lab today)
    expect(await page.locator('main .card a.tag', { hasText: /^Live$/ }).count()).toBe(1);
  }
});

test('hovering a card, the origin card or a "Currently working on" row never hides what is inside it (Jason, 2026-10-23)', async ({ page }) => {
  test.skip(!(await page.evaluate(() => matchMedia('(hover: hover)').matches)), 'no hover on touch screens');
  await page.goto('/');
  const boxes = ['#projects .card[data-id="homelab"]', '#projects .card[data-id="gpgpu-v2"]', '#projects .card[data-id="nbody"]', '#projects a.origin', '.now a'];
  for (const sel of boxes) {
    const box = page.locator(sel).first();
    await box.evaluate((e) => e.scrollIntoView({ block: 'center' })); // clear of the sticky top bar
    await box.hover();
    await page.waitForTimeout(350); // the background fades in .25s
    const same = await box.evaluate((b) => {
      const bg = getComputedStyle(b).backgroundColor;
      const fill = (e: Element) => { const svgBg = e.querySelector(':scope > svg > rect:first-child, :scope svg.diagram > rect:first-child'); return svgBg ? getComputedStyle(svgBg).fill : getComputedStyle(e).backgroundColor; };
      return [...b.querySelectorAll('.tag, .media, .blk, .t, .btn-secondary')].filter((e) => fill(e) === bg).map((e) => e.className || e.tagName);
    });
    expect(same, sel).toEqual([]);
  }
});

test('a click anywhere on a card opens it, unless it lands on a pill, button or avatar with its own link (Jason, 2026-10-23)', async ({ page }) => {
  for (const path of ['/', '/projects']) {
    await page.goto(path);
    for (const c of await page.locator('main .card, main a.origin, .now a').all()) {
      await c.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      const dead = await c.evaluate((card) => {
        const b = card.getBoundingClientRect(), out = new Set<string>();
        for (let x = b.left + 3; x < b.right - 3; x += 6) for (let y = b.top + 3; y < b.bottom - 3; y += 6) {
          const e = document.elementFromPoint(x, y);
          if (e && card.contains(e) && !e.closest('a, button')) out.add(`${e.tagName.toLowerCase()}.${typeof e.className === 'string' ? e.className : ''}`);
        }
        return [...out];
      });
      expect(dead, `${path} ${await c.getAttribute('data-id') ?? await c.getAttribute('class')}`).toEqual([]);
    }
  }
});
