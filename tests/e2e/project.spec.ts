import { expect, test, type Page } from '@playwright/test';

// Project pages (spec §5.2, Plan 2 Task 3). Header pills and buttons come from the project's data, the same pills as
// its card (Jason, 2026-10-23): no hand-set "Team of 3" or "Live demo" tags.
const GPGPU = '/courses/ece338/gpgpu';
const ORDER = ['What it is', "Why it's hard", 'How it works', 'Results', 'How we tested it', 'My part', "What's next", 'Team', 'Tools'];
const MAIN = ['/courses/ece338/gpgpu', '/courses/ece415/nbody', '/courses/ece455/rambo', '/courses/ece436/wifi', '/courses/ece433/house', '/courses/ece348/runtime', '/courses/ece321/threads', '/projects/gpgpu-v2', '/projects/homelab', '/projects/live-fpga-lab', '/projects/dvd-logo-fpga'];
const text = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').replace(/’/g, "'").trim(); // headings set curly apostrophes
const h2s = async (page: Page) => (await page.locator('main h2').allTextContents()).map(text);

test('GPGPU header: breadcrumb to the course, title, its headline, its pills, and its buttons', async ({ page }) => {
  await page.goto(GPGPU);
  const crumb = page.locator('main nav.crumb');
  expect(text(await crumb.textContent())).toBe('ECE338 Parallel Computer Architecture / RISC-V GPGPU');
  await expect(crumb.locator('a').first()).toHaveAttribute('href', '/courses/ece338');
  await expect(page.locator('main h1')).toHaveText('RISC-V GPGPU');
  await expect(page.locator('main .phead .lead')).toHaveText('Our 32-core RISC-V GPGPU, running on a real FPGA');
  expect(await page.locator('main .phead .tag').evaluateAll((ts) => ts.map((t) => (t as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).toEqual(['ECE338 Grade 9']);
  const btn = page.locator('main .phead .btns a');
  expect((await btn.allTextContents()).map(text)).toEqual(['Run the demo', 'Code', 'Team repo']);
  await expect(btn.first()).toHaveAttribute('href', 'https://fpga.njason.dev');
});

test('Homelab header: no breadcrumb, no demo, no Code (the repo is private); In progress from its data', async ({ page }) => {
  await page.goto('/projects/homelab');
  await expect(page.locator('main nav.crumb')).toHaveCount(0);
  await expect(page.locator('main h1')).toHaveText('Homelab');
  await expect(page.locator('main .phead .btns a', { hasText: 'Run the demo' })).toHaveCount(0);
  await expect(page.locator('main .phead .btns a', { hasText: 'Code' })).toHaveCount(0);
  await expect(page.locator('main .phead .tag', { hasText: 'In progress' })).toHaveCount(1);
});

test('GPGPU body: four key numbers with their conditions, sections in order, a matching table of contents, flat result bars', async ({ page }) => {
  await page.goto(GPGPU);
  const nums = page.locator('main .knum');
  await expect(nums).toHaveCount(4);
  for (const n of await nums.all()) {
    expect(text(await n.locator('b').textContent()).length).toBeGreaterThan(0);
    expect(text(await n.locator('span').textContent()).length).toBeGreaterThan(8); // the condition, in words
  }
  const hs = await h2s(page);
  expect(hs).toEqual(ORDER.filter((h) => hs.includes(h)));
  expect(hs).toEqual(ORDER); // GPGPU has every section
  expect((await page.locator('main nav.toc a').allTextContents()).map(text)).toEqual(hs);
  const bars = page.locator('#results .bars .bar');
  await expect(bars).toHaveCount(2);
  expect((await page.locator('#results .bars .val').allTextContents()).map(text)).toEqual(['129 µs', '308 µs']);
  for (const f of await page.locator('#results .bars .fill').all()) expect(await f.evaluate((e) => getComputedStyle(e).backgroundImage)).toBe('none');
});

test('GPGPU How it works shows the block design, the figure approved in the mock (spec §5.2)', async ({ page }) => {
  await page.goto(GPGPU);
  const img = page.locator('#how-it-works figure img');
  await expect(img).toHaveCount(1);
  expect((await img.getAttribute('alt'))!.length).toBeGreaterThan(10);
});

test("GPGPU Why it's hard shows the design filling the chip, from the final presentation (Jason, 2026-10-23)", async ({ page }) => {
  await page.goto(GPGPU);
  const img = page.locator('#why-its-hard figure img');
  await expect(img).toHaveCount(1);
  await img.scrollIntoViewIfNeeded(); // it loads lazily
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
});

test('GPGPU How it works draws the execution flow, then the block design (Jason, 2026-10-23)', async ({ page }) => {
  await page.goto(GPGPU);
  const figs = page.locator('#how-it-works figure');
  await expect(figs).toHaveCount(2);
  const flow = figs.first().locator('svg[role="img"]');
  await expect(flow).toHaveCount(1);
  const label = (await flow.getAttribute('aria-label'))!;
  for (const step of ['C', 'RISC-V', 'UART', 'ARM', 'AXI', 'instruction memory', 'GPGPU']) expect(label).toContain(step);
  await expect(figs.nth(1).locator('img')).toHaveCount(1);
});

test('the execution flow stays readable on a phone: its words at least 13px on screen', async ({ page }) => {
  await page.goto(GPGPU);
  const sizes = await page.locator('#how-it-works svg[role="img"] text').evaluateAll((ts) => ts.map((t) => t.getBoundingClientRect().height));
  expect(sizes.length).toBeGreaterThan(5);
  for (const h of sizes) expect(h).toBeGreaterThanOrEqual(13);
});

test('Team is one panel with a row per person, not a row of identical icon cards (taste inspector)', async ({ page }) => {
  await page.goto(GPGPU);
  const xs = await page.locator('#team .member').evaluateAll((ms) => ms.map((m) => Math.round(m.getBoundingClientRect().left)));
  expect(new Set(xs).size).toBe(1); // stacked rows
  await expect(page.locator('#team .members.panel')).toHaveCount(1);
  expect(await page.locator('#team .member').first().evaluate((m) => getComputedStyle(m).backgroundColor)).toBe('rgba(0, 0, 0, 0)'); // rows on the panel, not cards of their own
});

test("GPGPU's What's next links to GPGPU v2's page", async ({ page }) => {
  await page.goto(GPGPU);
  await expect(page.locator('#whats-next a[href="/projects/gpgpu-v2"]')).toHaveCount(1);
});

test('Tools: only the project\'s own tools; a tool says where else it was used', async ({ page }) => {
  await page.goto(GPGPU);
  const chips = (await page.locator('#tools .chip').evaluateAll((cs) => cs.map((c) => (c as HTMLElement).dataset.tool))).sort();
  expect(chips).toEqual(['ARM/Zynq', 'Bash', 'C', 'Git', 'HTML/CSS', 'JavaScript', 'Python', 'RISC-V', 'SystemVerilog', 'Tcl', 'Vivado/Vitis']);
  const more = page.locator('#tools .more');
  if (await more.isVisible()) await more.click();
  await page.locator('#tools .chip[data-tool="RISC-V"]').click();
  await expect(page.locator('#tools .usedline')).toHaveText(/^RISC-V Also used in/);
});

test('Previous and next follow the main projects in site order, wrapping at the ends', async ({ page }) => {
  await page.goto(GPGPU);
  await expect(page.locator('main .prevnext a.prev')).toHaveAttribute('href', '/projects/dvd-logo-fpga');
  await expect(page.locator('main .prevnext a.next')).toHaveAttribute('href', '/courses/ece415/nbody');
  await page.goto('/projects/dvd-logo-fpga');
  await expect(page.locator('main .prevnext a.next')).toHaveAttribute('href', GPGPU);
});

test('Team: me first, then the team; a solo project lists only me', async ({ page }) => {
  await page.goto(GPGPU);
  expect((await page.locator('#team .member .nm').allTextContents()).map(text)).toEqual(['Jason Nikas', 'Dimitrios Tsiantos', 'Panagiotis Nikolaos Tsogkas']);
  await expect(page.locator('#team .member', { hasText: 'Dimitrios Tsiantos' }).locator('a', { hasText: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/tsiantosd/');
  await page.goto('/projects/homelab');
  expect((await page.locator('#team .member .nm').allTextContents()).map(text)).toEqual(['Jason Nikas']);
});

test('the trace starts at the title and has one pad per section; the Live Lab pill shows from load', async ({ page }) => {
  await page.goto(GPGPU);
  await expect(page.locator('main [data-trace-start]')).toHaveCount(1);
  expect(await page.locator('main [data-trace-start] h1, main h1[data-trace-start]').count()).toBe(1);
  const n = (await h2s(page)).length;
  await expect(page.locator('svg.trace .t-pad[data-i]')).toHaveCount(n);
  await expect(page.locator('.topbar .labpill')).toBeVisible();
});

test('every project page: the contents list matches its sections, and no section is empty (Review Focus 1)', async ({ page }) => {
  for (const url of MAIN) {
    const res = await page.goto(url);
    expect(res!.status(), url).toBe(200);
    const hs = await h2s(page);
    expect(hs, url).toEqual(ORDER.filter((h) => hs.includes(h)));
    expect((await page.locator('main nav.toc a').allTextContents()).map(text), url).toEqual(hs);
    const empty = await page.locator('main h2').evaluateAll((list) => list.filter((h) => { const n = h.nextElementSibling; return !n || n.tagName === 'H2'; }).map((h) => h.textContent));
    expect(empty, url).toEqual([]);
  }
});

test('keyboard: every contents link is reachable, its focus is visible, and Enter lands the section below the bar (Review Focus 3)', async ({ page }) => {
  await page.goto(GPGPU);
  const links = page.locator('main nav.toc a');
  const n = await links.count();
  const reached = new Set<string>();
  for (let i = 0; i < 80 && reached.size < n; i++) {
    await page.keyboard.press('Tab');
    const href = await page.evaluate(() => (document.activeElement?.closest('nav.toc') ? document.activeElement.getAttribute('href') : null));
    if (href) {
      reached.add(href);
      expect(await page.evaluate(() => parseFloat(getComputedStyle(document.activeElement!).outlineWidth))).toBeGreaterThan(0);
    }
  }
  expect(reached.size).toBe(n);
  await links.filter({ hasText: 'Results' }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => page.locator('#results h2').evaluate((h) => h.getBoundingClientRect().top)).toBeGreaterThanOrEqual(68);
  const bar = await page.locator('.topbar').evaluate((b) => b.getBoundingClientRect().bottom);
  expect(await page.locator('#results h2').evaluate((h) => h.getBoundingClientRect().top)).toBeGreaterThanOrEqual(bar);
});

test('phone: the contents list is a strip that scrolls inside itself, and the page never scrolls sideways', async ({ page }) => {
  test.skip(page.viewportSize()!.width > 760, 'phones');
  await page.goto(GPGPU);
  const toc = page.locator('main nav.toc');
  expect(await toc.evaluate((t) => { const s = getComputedStyle(t.querySelector('ol, ul')!); return s.overflowX; })).toMatch(/auto|scroll/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // a too-wide element makes a phone lay the whole page out wider and zoom it out, which the check above can't see
  expect(await page.evaluate(() => innerWidth)).toBe(page.viewportSize()!.width);
  // reading the first section, the strip shows its link whole
  await page.locator('#what-it-is h2').evaluate((h) => h.scrollIntoView());
  await expect(toc.locator('a').first()).toHaveAttribute('aria-current', 'true');
  await page.waitForTimeout(600); // the strip's own smooth scroll
  const [l, a] = await toc.evaluate((t) => [t.querySelector('ol')!.getBoundingClientRect().left, t.querySelector('a')!.getBoundingClientRect().left]);
  expect(a).toBeGreaterThanOrEqual(l - 1);
  // the team cards line up with the text, not indented like a bulleted list
  const [h, m] = await page.locator('#team').evaluate((s) => [s.querySelector('h2')!.getBoundingClientRect().left, s.querySelector('.members')!.getBoundingClientRect().left]);
  expect(Math.abs(m - h)).toBeLessThanOrEqual(1);
});

test.describe('no JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('every section is visible and the contents links are anchors', async ({ page }) => {
    await page.goto(GPGPU);
    expect(await page.locator('main section h2').count()).toBe(ORDER.length);
    for (const s of await page.locator('main section').all()) await expect(s).toBeVisible();
    for (const a of await page.locator('main nav.toc a').all()) expect(await a.getAttribute('href')).toMatch(/^#[a-z-]+$/);
  });
});
