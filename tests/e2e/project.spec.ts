import { existsSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { docsFor } from '../../src/lib/docs';

// Project pages (spec §5.2, Plan 2 Task 3). Header pills and buttons come from the project's data, the same pills as
// its card (Jason, 2026-10-23): no hand-set "Team of 3" or "Live demo" tags.
const GPGPU = '/courses/ece338/gpgpu';
// each project has its own sections (Jason, 2026-10-24): What it is first, then its own, then Team and Tools last
// the report and presentation show once Jason has put their PDFs in public/reports
const GPGPU_DOCS = docsFor({ id: 'gpgpu', course: 'ece338' }, existsSync);
const DOCS_TITLE = GPGPU_DOCS.map((d) => d.label).join(' and ');
const GPGPU_SECTIONS = ['What it is', 'Inside the GPGPU', 'From C code to the board', 'Results', 'How we tested it', "What's next", ...(GPGPU_DOCS.length ? [DOCS_TITLE] : []), 'Team', 'Tools'];
const framed = (hs: string[]) => hs[0] === 'What it is' && hs.at(-2) === 'Team' && hs.at(-1) === 'Tools';
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
  await expect(page.locator('main .phead .tag')).toHaveCount(0); // the breadcrumb names the course; its pill is for cards (Jason, 2026-10-24)
  const btn = page.locator('main .phead .btns a');
  expect((await btn.allTextContents()).map(text)).toEqual(['Run the demo', 'Code', ...GPGPU_DOCS.map((d) => d.label)]); // only my own repo (Jason, 2026-10-24)
  for (const [i, d] of GPGPU_DOCS.entries()) await expect(btn.nth(2 + i)).toHaveAttribute('href', d.href);
  await expect(btn.nth(1)).toHaveAttribute('href', 'https://github.com/ACrispyCookie/GPGPU');
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
  expect(hs).toEqual(GPGPU_SECTIONS);
  expect((await page.locator('main nav.toc a').allTextContents()).map(text)).toEqual(hs);
  const bars = page.locator('#results .bars .bar');
  await expect(bars).toHaveCount(2);
  expect((await page.locator('#results .bars .val').allTextContents()).map(text)).toEqual(['129 µs', '308 µs']);
  for (const f of await page.locator('#results .bars .fill').all()) expect(await f.evaluate((e) => getComputedStyle(e).backgroundImage)).toBe('none');
});

test('GPGPU Inside the GPGPU shows the design filling the chip, then the block design (Jason, 2026-10-23/24)', async ({ page }) => {
  await page.goto(GPGPU);
  const imgs = page.locator('#inside-the-gpgpu figure img');
  await expect(imgs).toHaveCount(2);
  for (const img of await imgs.all()) {
    expect((await img.getAttribute('alt'))!.length).toBeGreaterThan(10);
    await img.scrollIntoViewIfNeeded(); // it loads lazily
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

test('GPGPU From C code to the board draws the execution flow (Jason, 2026-10-23)', async ({ page }) => {
  await page.goto(GPGPU);
  const figs = page.locator('#from-c-code-to-the-board figure');
  await expect(figs).toHaveCount(1);
  const flow = figs.first().locator('svg[role="img"]');
  await expect(flow).toHaveCount(1);
  const label = (await flow.getAttribute('aria-label'))!;
  for (const step of ['C', 'RISC-V', 'UART', 'ARM', 'AXI', 'instruction memory', 'GPGPU']) expect(label).toContain(step);
});

// Jason, 2026-10-24: the GPGPU pictures were hard to see on every device
test('a section picture uses the column\'s width while the screen is tall enough', async ({ page }) => {
  await page.goto(GPGPU);
  const fig = page.locator('#inside-the-gpgpu figure').nth(1); // the block design, wider than tall
  const [w, col, h] = await fig.evaluate((f) => [f.getBoundingClientRect().width, f.parentElement!.getBoundingClientRect().width, f.getBoundingClientRect().height]);
  if (h < page.viewportSize()!.height * 0.55) expect(w).toBeGreaterThanOrEqual(col - 2);
});

test('tap a picture to see it full screen at full size, then close it', async ({ page }) => {
  await page.goto(GPGPU);
  const open = page.locator('#inside-the-gpgpu figure a.zoom').nth(1);
  await open.scrollIntoViewIfNeeded();
  await open.click();
  const viewer = page.locator('dialog.viewer');
  await expect(viewer).toBeVisible();
  const big = viewer.locator('img');
  await expect.poll(() => big.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThanOrEqual(1200); // the original, not a resized copy
  const vw = page.viewportSize()!;
  const box = (await big.boundingBox())!;
  expect(Math.max(box.width / vw.width, box.height / vw.height)).toBeGreaterThan(0.9); // fills the screen one way
  // a picture bigger than the screen: a tap on its right edge shows that part at full size
  if (await big.evaluate((i: HTMLImageElement) => i.naturalWidth > innerWidth)) {
    await expect(viewer.locator('.hint')).toBeVisible();
    await big.click({ position: { x: box.width - 4, y: box.height / 2 } });
    await expect(viewer).toHaveClass(/actual/);
    expect(await viewer.evaluate((v) => v.scrollLeft)).toBeGreaterThan(0);
  }
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await expect(open).toBeFocused();
});

test('report and presentation: each has Read in the browser and Download, and the file is served as a PDF', async ({ page, request }) => {
  test.skip(!GPGPU_DOCS.length, 'no cleaned PDF in public/reports yet');
  await page.goto(GPGPU);
  const sec = page.locator('#docs');
  await expect(sec.locator('h2')).toHaveText(DOCS_TITLE);
  for (const d of GPGPU_DOCS) {
    const card = sec.locator('.doc', { hasText: d.label });
    await expect(card.locator('a', { hasText: 'Read' })).toHaveAttribute('href', d.href);
    await expect(card.locator('a', { hasText: 'Download' })).toHaveAttribute('download', /\.pdf$/);
    const res = await request.get(d.href);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
  }
});

test('a project with no cleaned PDF shows no report section or button', async ({ page }) => {
  const homelab = docsFor({ id: 'homelab' }, existsSync);
  test.skip(homelab.length > 0, 'homelab has a PDF');
  await page.goto('/projects/homelab');
  await expect(page.locator('#docs')).toHaveCount(0);
  await expect(page.locator('main .phead .btns a', { hasText: /Report|Presentation/ })).toHaveCount(0);
});

test('the execution flow stays readable on a phone: its words at least 13px on screen', async ({ page }) => {
  await page.goto(GPGPU);
  const sizes = await page.locator('#from-c-code-to-the-board svg[role="img"] text').evaluateAll((ts) => ts.map((t) => t.getBoundingClientRect().height));
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
  expect(chips).toEqual(['ARM/Zynq', 'Bash', 'C', 'Git', 'HTML/CSS', 'JavaScript', 'Python', 'RISC-V', 'Tcl', 'Verilog', 'Vivado/Vitis']);
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
    expect(framed(hs), `${url}: ${hs.join(', ')}`).toBe(true);
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
    expect(await page.locator('main section h2').count()).toBe(GPGPU_SECTIONS.length);
    for (const s of await page.locator('main section').all()) await expect(s).toBeVisible();
    for (const a of await page.locator('main nav.toc a').all()) expect(await a.getAttribute('href')).toMatch(/^#[a-z-]+$/);
    // a picture is still a link to its full-size file
    for (const z of await page.locator('main figure a.zoom').all()) expect(await z.getAttribute('href')).toMatch(/\.(jpe?g|png|webp)$/);
  });
});

// Plan 2 Task 4: every project page has its copy. Pages without two sourced numbers are listed with the reason, for
// Jason to confirm at M7 (never invent facts).
const NO_NUMBERS: Record<string, string> = {
  '/courses/ece433/house': 'the graphics report has no measurements',
  '/courses/ece348/runtime': 'Assignment 4 has no benchmarks; the measured numbers belong to Assignments 1–3',
  '/courses/ece321/threads': 'the concurrency reports have no performance numbers',
  '/projects/homelab': 'privacy: categories only, nothing measured',
  '/projects/gpgpu-v2': 'in progress, nothing measured yet',
};
for (const url of MAIN) {
  test(`${url} has its copy: What it is, and two key numbers unless listed`, async ({ page }) => {
    const res = await page.goto(url);
    expect(res!.status()).toBe(200);
    expect(await h2s(page)).toContain('What it is');
    expect(text(await page.locator('#what-it-is p').first().textContent()).length).toBeGreaterThan(60);
    const n = await page.locator('main .knum').count();
    if (NO_NUMBERS[url]) expect(n).toBe(0);
    else expect(n).toBeGreaterThanOrEqual(2);
  });
}

test("GPGPU v2's What's next is its milestones still to do, from its data", async ({ page }) => {
  await page.goto('/projects/gpgpu-v2');
  expect((await page.locator('#whats-next li').allTextContents()).map(text)).toEqual(['Now: Memory controller', 'Next: DDR memory and graphics', 'Next: Branch divergence, warp scheduling']);
});

test('tablet width: the contents links wrap onto rows, none cut under the strip\'s edge (taste inspector, 2026-10-24)', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(GPGPU);
  const [sw, cw] = await page.locator('main nav.toc ol').evaluate((o) => [o.scrollWidth, o.clientWidth]);
  expect(sw).toBeLessThanOrEqual(cw + 1);
});
