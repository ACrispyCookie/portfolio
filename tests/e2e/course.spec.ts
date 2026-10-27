import { expect, test, type Page } from '@playwright/test';
import { auditContrast } from './helpers/contrast';
import { phoneLayout } from './helpers/layout';

// Course pages (spec §5.3, Plan 2 Task 5): one page per course, every project of it in full.
const HPC = '/courses/ece415';
// newest first, the cards and the strip alike (Jason, 2026-10-27)
const STEPS = ['N-body on GPUs', 'CLAHE', 'CUDA convolution', 'K-means', 'Sobel filter'];
const SMALL = ['clahe', 'conv', 'kmeans', 'sobel'];
const text = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const sideways = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

test('header: breadcrumb to All projects, the course name, its intro and its grade', async ({ page }) => {
  await page.goto(HPC);
  const crumb = page.locator('main nav.crumb');
  expect(text(await crumb.textContent())).toBe('Projects / ECE415'); // every course lives on /projects (ruling, 2026-10-27)
  await expect(crumb.locator('a')).toHaveAttribute('href', '/projects');
  await expect(page.locator('main h1')).toHaveText('High Performance Computing');
  await expect(page.locator('main .chead .lead')).toHaveText('Five projects that build on each other, from tuning C code on one CPU to running a galaxy simulation on four GPUs at once.');
  await expect(page.locator('main .chead .grade b')).toHaveText('9.5');
  await expect(page.locator('main .chead .avatars, main .chead .av')).toHaveCount(0); // teams differ per project
});

test('header spacing matches the project pages: the breadcrumb sits as far under the bar, 14px above the title', async ({ page }) => {
  const gaps = async (url: string) => {
    await page.goto(url);
    return page.evaluate(() => {
      const bar = document.querySelector('.topbar')!.getBoundingClientRect(), c = document.querySelector('main .crumb')!.getBoundingClientRect();
      return [c.top - bar.bottom, document.querySelector('main h1')!.getBoundingClientRect().top - c.bottom];
    });
  };
  const [course, project] = [await gaps(HPC), await gaps('/courses/ece415/nbody')];
  expect(Math.abs(course[0] - project[0])).toBeLessThanOrEqual(2);
  expect(Math.abs(course[1] - 14)).toBeLessThanOrEqual(3);
});

test('step strip: the five projects newest first, each linking to its card; no "Project N of M" anywhere', async ({ page }) => {
  await page.goto(HPC);
  const steps = page.locator('main .strip li a');
  expect((await page.locator('main .strip li a b').allTextContents()).map(text)).toEqual(STEPS);
  expect(await steps.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(['#nbody', '#clahe', '#conv', '#kmeans', '#sobel']);
  expect(await page.locator('main').textContent()).not.toMatch(/Project \d+ of \d+/);
});

test('a course that is not a sequence has no strip', async ({ page }) => {
  await page.goto('/courses/ece436');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('main .strip')).toHaveCount(0);
});

test('at 320px the strip wraps inside its box and the page never scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(HPC);
  const over = await page.locator('main .strip').evaluate((s) => {
    const r = s.getBoundingClientRect();
    return [...s.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.right > r.right + 1 || b.left < r.left - 1; }).length;
  });
  expect(over).toBe(0);
  expect(await sideways(page)).toBeLessThanOrEqual(0);
});

test('cards: newest first, each id its project id', async ({ page }) => {
  await page.goto(HPC);
  const ids = await page.locator('main section.cproj').evaluateAll((s) => s.map((x) => [x.id, x.getAttribute('data-id')]));
  expect(ids).toEqual(['nbody', ...SMALL].map((id) => [id, id]));
});

// the copper runs unbroken from pad to pad, in a row or down a phone (Jason, 2026-10-27: the phone strip was broken)
test('the strip\'s copper joins every pad to the next', async ({ page }) => {
  await page.goto(HPC);
  const gaps = await page.locator('main .strip li').evaluateAll((lis) => lis.slice(0, -1).flatMap((li, i) => {
    const r = li.getBoundingClientRect(), n = lis[i + 1].getBoundingClientRect(), cs = getComputedStyle(li, '::before');
    const top = r.top + parseFloat(cs.top), left = r.left + parseFloat(cs.left);
    const bottom = top + parseFloat(cs.height), right = left + parseFloat(cs.width);
    const down = n.top >= r.bottom - 1; // the next pad is on a later row (a phone: one a row)
    if (down && Math.abs(n.left - r.left) > 2) return []; // a new row of a wrapped strip starts its own line
    const reach = down ? bottom >= n.top + 6 : right >= n.left + 6;
    return reach ? [] : [`${i}: ends ${Math.round(down ? n.top - bottom : n.left - right)}px short`];
  }));
  expect(gaps).toEqual([]);
});

test('the main card: its video, key numbers and the way to its full page, no tabs (the page has it all)', async ({ page }) => {
  await page.goto(HPC);
  const card = page.locator('#nbody');
  await expect(card.locator('h2')).toHaveText('N-body on GPUs');
  await expect(card.locator('video')).toHaveCount(1);
  await expect(card.locator('.knum')).toHaveCount(4);
  await expect(card.locator('a', { hasText: 'Read the full page' })).toHaveAttribute('href', '/courses/ece415/nbody');
  await expect(card.locator('[role="tablist"]')).toHaveCount(0);
});

test('every card has its own team: me first, then its people', async ({ page }) => {
  await page.goto(HPC);
  for (const id of ['nbody', ...SMALL]) await expect(page.locator(`#${id} .av a`)).toHaveCount(3);
});

test('a solo course shows my avatar alone, with no "Solo" text', async ({ page }) => {
  await page.goto('/courses/ece348');
  const card = page.locator('section.cproj').first();
  await expect(card.locator('.av a')).toHaveCount(1);
  expect(await card.textContent()).not.toMatch(/\bSolo\b/);
});

test('each smaller project in full, nothing behind a click: its description, its own sections, results and code', async ({ page }) => {
  await page.goto(HPC);
  await expect(page.locator('main [role="tab"], main [role="tablist"]')).toHaveCount(0);
  for (const id of SMALL) {
    const hs = (await page.locator(`#${id} h3`).allTextContents()).map(text);
    expect(hs[0], id).toBe('What it is');
    expect(hs.length, id).toBeGreaterThanOrEqual(5);
    expect(hs.slice(-2), id).toEqual(['Results', 'Code']);
    await expect(page.locator(`#${id} .bars`)).toBeVisible();
    await expect(page.locator(`#${id} .excerpt`)).toBeVisible();
  }
});

test('section ids are unique on the page: every project has its own "what-it-is"', async ({ page }) => {
  await page.goto(HPC);
  const ids = await page.locator('main [id]').evaluateAll((e) => e.map((x) => x.id));
  expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
});

test('a deep link lands on its project below the bar, its section lit', async ({ page }) => {
  await page.goto(`${HPC}#conv`);
  const bar = await page.locator('.topbar').evaluate((e) => e.getBoundingClientRect().bottom);
  await expect.poll(() => page.locator('#conv h2').evaluate((e) => e.getBoundingClientRect().top)).toBeGreaterThanOrEqual(bar);
  await expect(page.locator('#conv')).toHaveClass(/\blit\b/, { timeout: 3000 });
});

test('code: a highlighted excerpt linked to GitHub at a pinned commit; on a phone it scrolls in its own box', async ({ page }) => {
  await page.goto(HPC);
  for (const id of SMALL) {
    const link = page.locator(`#${id} .excerpt a`);
    expect(await link.getAttribute('href'), id).toMatch(/^https:\/\/github\.com\/ACrispyCookie\/[^/]+\/blob\/[0-9a-f]{40}\/.+#L\d+-L\d+$/);
    const lines = await page.locator(`#${id} .excerpt pre .line`).count();
    expect(lines, id).toBeGreaterThanOrEqual(10);
    expect(lines, id).toBeLessThanOrEqual(25);
  }
  if (phoneLayout(page)) {
    const pre = page.locator('#clahe .excerpt pre');
    expect(await pre.evaluate((e) => e.scrollWidth > e.clientWidth && getComputedStyle(e).overflowX === 'auto')).toBe(true);
  }
  expect(await sideways(page)).toBeLessThanOrEqual(0);
});

test('tools: only the course projects\' tools', async ({ page }) => {
  await page.goto(HPC);
  const chips = await page.locator('#tools .chip').evaluateAll((c) => c.map((x) => x.getAttribute('data-tool')));
  expect(new Set(chips)).toEqual(new Set(['CUDA', 'OpenMP', 'C', 'C++', 'Python', 'Bash', 'Git']));
});

test('ECE333: DVD Logo FPGA follows the labs as their continuation', async ({ page }) => {
  await page.goto('/courses/ece333');
  const next = page.locator('main a[href="/projects/dvd-logo-fpga"]');
  await expect(next.first()).toBeVisible();
  const order = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('main section.cproj')], link = document.querySelector('main .cont a[href="/projects/dvd-logo-fpga"]')!;
    return cards.every((c) => c.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('rendered text, code included, meets WCAG AA', async ({ page }) => {
    await page.goto(HPC);
    const fails = await auditContrast(page);
    expect(fails, JSON.stringify(fails, null, 1)).toEqual([]);
  });
});

test('code starts at its box\'s edge: the indent the file gives it is taken off, tabs lined up as spaces', async ({ page }) => {
  await page.goto(HPC);
  for (const id of SMALL) {
    const lines = await page.locator(`#${id} .excerpt pre .line`).allTextContents();
    expect(lines.some((l) => l.trim() && !/^\s/.test(l)), id).toBe(true);
    expect(lines.join('\n'), id).not.toContain('\t');
  }
});

// Jason, 2026-10-27: "there isn't a way of going to a project subsection I want faster"
test('each smaller project has its own contents: one link per section, each landing on it', async ({ page }) => {
  await page.goto(HPC);
  for (const id of SMALL) {
    const links = page.locator(`#${id} nav.toc a`);
    const hs = (await page.locator(`#${id} .csec > h3`).allTextContents()).map(text);
    expect((await links.allTextContents()).map(text), id).toEqual(hs);
    for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) await expect(page.locator(href), `${id} ${href}`).toHaveCount(1);
  }
  const last = page.locator('#clahe nav.toc a').last();
  await last.click();
  const bar = await page.locator('.topbar').evaluate((e) => e.getBoundingClientRect().bottom);
  await expect.poll(() => page.locator('#clahe-code h3').evaluate((e) => e.getBoundingClientRect().top)).toBeGreaterThanOrEqual(bar - 1);
  if (await page.locator('#clahe nav.toc').evaluate((e) => getComputedStyle(e).position === 'sticky')) {
    // where there is room beside the text, the contents stay there while the project scrolls past
    await page.locator('#clahe-results').scrollIntoViewIfNeeded();
    const r = await page.locator('#clahe nav.toc').evaluate((e) => e.getBoundingClientRect().top);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThan(200);
  }
});

// Jason, 2026-10-27: "the strip and the grade still look too bad on mobile"
test('on a phone the grade is one compact line, and the strip lists each project with its headline', async ({ page }) => {
  test.skip(!phoneLayout(page), 'phone layout');
  await page.goto(HPC);
  const g = await page.locator('main .chead .grade').evaluate((e) => { const r = e.getBoundingClientRect(), b = e.querySelector('b')!.getBoundingClientRect(), s = e.querySelector('span')!.getBoundingClientRect(); return { h: r.height, same: Math.abs(b.top + b.height / 2 - (s.top + s.height / 2)) < 6 }; });
  expect(g.h).toBeLessThanOrEqual(48);
  expect(g.same).toBe(true); // number and words side by side
  // and a bar filled to the grade out of 10, as on home's grade report
  const fill = await page.locator('main .chead .gbar').evaluate((e) => e.firstElementChild!.getBoundingClientRect().width / e.getBoundingClientRect().width);
  expect(fill).toBeCloseTo(0.95, 2);
  const heads = (await page.locator('main .strip li .sub').allTextContents()).map(text);
  expect(heads).toEqual(['2,910× faster than the single-core version', 'Contrast enhancement on GPU', 'Image filters on GPU', 'Clustering on 56 threads', 'Image edges, 21× faster']);
});

// Jason, 2026-10-27: every list always marks one section, on a phone too: its first before the reader gets there ("it
// should be highlighted even before it comes into view"), then the one being read
test('every contents list marks one section at all times: the first before you reach it, then the one you are reading', async ({ page }) => {
  for (const url of [HPC, '/courses/ece338/gpgpu']) {
    await page.goto(url);
    const navs = page.locator('main nav.toc');
    for (let i = 0; i < await navs.count(); i++) {
      const nav = navs.nth(i);
      await expect(nav.locator('a[aria-current]'), `${url} list ${i}`).toHaveCount(1);
      await expect(nav.locator('a[aria-current]'), `${url} list ${i}`).toHaveAttribute('href', (await nav.locator('a').first().getAttribute('href'))!);
    }
  }
  await page.goto(HPC);
  await page.locator('#clahe-results').evaluate((e) => scrollBy(0, e.getBoundingClientRect().top - 140));
  await expect(page.locator('#clahe nav.toc a[aria-current]')).toHaveText('Results');
  await page.locator('#conv-what-it-is').evaluate((e) => scrollBy(0, e.getBoundingClientRect().top - 140));
  await expect(page.locator('#conv nav.toc a[aria-current]')).toHaveText('What it is');
  await expect(page.locator('#clahe nav.toc a[aria-current]')).toHaveText('Code'); // read past: its last
});

// Jason, 2026-10-27: after tapping a section, "What it is" and the tapped one both stayed highlighted. The jump landed
// the section 170px down (the page's 84px offset plus the section's own 88px), still under the reading line on a short
// phone, and a tap leaves the link looking hovered.
test('choosing a section lands it right under the bar, and only that link is highlighted', async ({ page, isMobile }) => {
  await page.goto(HPC);
  const link = page.locator('#clahe nav.toc a', { hasText: 'Results' });
  await link.scrollIntoViewIfNeeded();
  if (isMobile) await link.tap(); else await link.click();
  await page.mouse.move(0, 0).catch(() => {});
  const bar = await page.locator('.topbar').evaluate((e) => e.getBoundingClientRect().bottom);
  await expect.poll(() => page.locator('#clahe-results').evaluate((e) => Math.round(e.getBoundingClientRect().top))).toBeLessThanOrEqual(Math.round(bar) + 24);
  await expect.poll(() => page.locator('#clahe nav.toc a').evaluateAll((as) => as.filter((a) => getComputedStyle(a).backgroundColor !== 'rgba(0, 0, 0, 0)').map((a) => a.textContent))).toEqual(['Results']);
  await expect(page.locator('#clahe nav.toc a[aria-current]')).toHaveText('Results');
});
