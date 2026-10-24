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
// Verification before Results, and named for what it is (Jason, 2026-10-24)
const GPGPU_SECTIONS = ['What it is', 'Inside the GPGPU', 'From C code to the board', 'Verification', 'Results', "What's next", ...(GPGPU_DOCS.length ? [DOCS_TITLE] : []), 'Team', 'Tools'];
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
  await expect(btn.first()).toHaveAttribute('href', 'https://fpga.njason.dev/?start=gpgpu-nbody'); // starts this demo in the lab (Jason, 2026-10-24)
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

test('GPGPU pictures: the design filling the chip inside the GPGPU; the block design where the board wiring is explained (Jason, 2026-10-23/24)', async ({ page }) => {
  await page.goto(GPGPU);
  await expect(page.locator('#inside-the-gpgpu figure img')).toHaveCount(1);
  await expect(page.locator('#from-c-code-to-the-board figure img')).toHaveCount(1);
  const imgs = page.locator('#inside-the-gpgpu figure img, #from-c-code-to-the-board figure img');
  for (const img of await imgs.all()) {
    expect((await img.getAttribute('alt'))!.length).toBeGreaterThan(10);
    await img.scrollIntoViewIfNeeded(); // it loads lazily
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

test('GPGPU From C code to the board draws the execution flow (Jason, 2026-10-23)', async ({ page }) => {
  await page.goto(GPGPU);
  const figs = page.locator('#from-c-code-to-the-board figure');
  await expect(figs).toHaveCount(2);
  const flow = figs.first().locator('svg[role="img"]');
  await expect(flow).toHaveCount(1);
  const label = (await flow.getAttribute('aria-label'))!;
  for (const step of ['C', 'RISC-V', 'UART', 'ARM', 'AXI', 'instruction memory', 'GPGPU']) expect(label).toContain(step);
});

// Jason, 2026-10-24: the GPGPU pictures were hard to see on every device
test('a section picture uses the column\'s width while the screen is tall enough', async ({ page }) => {
  await page.goto(GPGPU);
  const fig = page.locator('#from-c-code-to-the-board figure').nth(1); // the block design, wider than tall
  const [w, col, h] = await fig.evaluate((f) => [f.getBoundingClientRect().width, f.parentElement!.getBoundingClientRect().width, f.getBoundingClientRect().height]);
  if (h < page.viewportSize()!.height * 0.55) expect(w).toBeGreaterThanOrEqual(col - 2);
});

test('tap a picture to see it full screen at full size, then close it', async ({ page }) => {
  await page.goto(GPGPU);
  const open = page.locator('#from-c-code-to-the-board figure a.zoom'); // the block design
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
    expect(await viewer.locator('.stage').evaluate((v) => v.scrollLeft)).toBeGreaterThan(0);
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

// Jason, 2026-10-24: a drawing for Verification, redrawn from the final presentation's end-to-end test flow (slide 32)
test('GPGPU Verification draws the end-to-end test flow from the presentation', async ({ page }) => {
  await page.goto(GPGPU);
  const svg = page.locator('#verification figure svg[role="img"]');
  await expect(svg).toHaveCount(1);
  const label = (await svg.getAttribute('aria-label'))!;
  for (const part of ['assembly', 'binary generator', 'expected generator', 'UART', 'ARM core', 'FPGA logic', 'memory dump', 'comparator', 'pass or fail']) expect(label).toContain(part);
  const words = text(await svg.textContent());
  for (const w of ['assembly', 'binary', 'expected', 'UART', 'PS', 'PL', 'dump', 'comparator', 'pass / fail']) expect(words).toContain(w);
});

test('the drawings stay readable on a phone: their words at least 13px on screen', async ({ page }) => {
  await page.goto(GPGPU);
  const sizes = await page.locator('main .psec figure svg[role="img"] text').evaluateAll((ts) => ts.map((t) => t.getBoundingClientRect().height));
  expect(sizes.length).toBeGreaterThan(12); // the flow and the verification drawing
  for (const h of sizes) expect(h).toBeGreaterThanOrEqual(13);
});

test('Team is one panel with a row per person, not a row of identical icon cards (taste inspector)', async ({ page }) => {
  await page.goto(GPGPU);
  const xs = await page.locator('#team .member').evaluateAll((ms) => ms.map((m) => Math.round(m.getBoundingClientRect().left)));
  expect(new Set(xs).size).toBe(1); // stacked rows
  await expect(page.locator('#team .members.panel')).toHaveCount(1);
  expect(await page.locator('#team .member').first().evaluate((m) => getComputedStyle(m).backgroundColor)).toBe('rgba(0, 0, 0, 0)'); // rows on the panel, not cards of their own
});

// Jason, 2026-10-24: What's next is more than a sentence and a link: a card for the project that continues this one
test("GPGPU's What's next is a card for GPGPU v2: its roadmap, title, headline and summary", async ({ page }) => {
  await page.goto(GPGPU);
  const card = page.locator('#whats-next a.nextcard');
  await expect(card).toHaveCount(1);
  await expect(card).toHaveAttribute('href', '/projects/gpgpu-v2');

  await expect(card.locator('h3')).toHaveText('GPGPU v2');
  await expect(card).toContainText('In progress');
  // the roadmap: every milestone with where it stands, as text that keeps its size on any screen (≥13px)
  const road = card.locator('ol.road li');
  expect(await road.evaluateAll((ls) => ls.map((l) => `${l.getAttribute('data-state')} ${l.querySelector('.nm')!.textContent!.trim()}`))).toEqual([
    'done Host controller over AXI', 'done CLI for tests and synthesis', 'now Memory controller', 'next DDR memory and graphics', 'next Branch divergence, warp scheduling',
  ]);
  for (const size of await road.evaluateAll((ls) => ls.map((l) => parseFloat(getComputedStyle(l).fontSize)))) expect(size).toBeGreaterThanOrEqual(13);
  await expect(card.locator('.sum')).toContainText('memory controller is next');
});

test('a link inside the copy is underlined, unlike the text around it (Jason, 2026-10-24)', async ({ page }) => {
  await page.goto('/projects/live-fpga-lab');
  const a = page.locator('#what-it-is p a').first();
  expect(await a.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('underline');
  // buttons are not text links: no underline
  await page.goto(GPGPU);
  for (const b of await page.locator('main .psec a.btn').all()) expect(await b.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('none');
});

test('GPGPU explains each part: Inside the GPGPU and From C code to the board each have their own sub-parts', async ({ page }) => {
  await page.goto(GPGPU);
  for (const id of ['inside-the-gpgpu', 'from-c-code-to-the-board', 'verification']) expect(await page.locator(`#${id} h3`).count(), id).toBeGreaterThanOrEqual(2);
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
  // wide screens start the trace under the title; phones under the video and numbers, which use the full width there
  await expect(page.locator('main [data-trace-start="wide"] h1')).toHaveCount(1);
  await expect(page.locator('main [data-trace-start="phone"] .hero-media')).toHaveCount(1);
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

// Jason, 2026-10-24: the spacing around the video and the key numbers looked off on a phone, upright and sideways
test('the key numbers sit close under the video they belong to, at every phone shape', async ({ page }) => {
  for (const [w, h] of [[390, 844], [844, 390], [360, 740], [932, 430], [1440, 900]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(GPGPU);
    const v = (await page.locator('main .hero-media').boundingBox())!;
    const k = (await page.locator('main .knums').boundingBox())!;
    expect(k.y - (v.y + v.height), `${w}×${h}`).toBeLessThanOrEqual(24);
    expect(k.y - (v.y + v.height), `${w}×${h}`).toBeGreaterThanOrEqual(12);
  }
});

// Jason, 2026-10-24: the video could be bigger on a phone, where it sat in the trace's gutter beside empty space
test('phone: the video and the numbers use the full width, and the trace starts below them', async ({ page }) => {
  for (const [w, h] of [[390, 844], [360, 740], [430, 932]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(GPGPU);
    const bar = (await page.locator('.topbar .in').boundingBox())!;
    for (const sel of ['main .hero-media', 'main .knums']) {
      const b = (await page.locator(sel).boundingBox())!;
      expect(Math.abs(b.x - bar.x), `${w} ${sel} left`).toBeLessThanOrEqual(1);
      expect(Math.abs(b.width - bar.width), `${w} ${sel} width`).toBeLessThanOrEqual(2);
    }
    const nums = (await page.locator('main .knums').boundingBox())!;
    await expect(page.locator('svg.trace .t-pad.on').first()).toBeAttached();
    // the start pad is centred on the block's bottom edge, as it is on the title's on wide screens
    const start = await page.locator('svg.trace circle.t-pad:not([data-i])').evaluate((c) => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; });
    expect(Math.abs(start - (nums.y + nums.height)), `${w}: the trace starts at the numbers' bottom`).toBeLessThanOrEqual(1);
  }
});

test('zoomed picture: a fitted picture never scrolls, a zoomed one scrolls both ways under a finger', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'raw touch events through Chrome DevTools');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(GPGPU);
  const cdp = await page.context().newCDPSession(page);
  const swipe = async (x: number, y: number, dx: number, dy: number) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 10, y: y + (dy * i) / 10 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const stage = page.locator('dialog.viewer .stage');
  const pos = () => stage.evaluate((s) => [s.scrollLeft, s.scrollTop, s.scrollWidth - s.clientWidth, s.scrollHeight - s.clientHeight]);
  const open = page.locator('#inside-the-gpgpu a.zoom'); // the device view
  await open.scrollIntoViewIfNeeded();
  await open.click();
  await expect.poll(() => page.locator('dialog.viewer img').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
  const [, , ow, oh] = await pos();
  expect([ow, oh]).toEqual([0, 0]); // fitted: nothing to scroll
  const box = (await page.locator('dialog.viewer img').boundingBox())!;
  await page.locator('dialog.viewer img').click({ position: { x: box.width / 2, y: box.height / 2 } });
  await expect(page.locator('dialog.viewer')).toHaveClass(/actual/);
  const [l0] = await pos();
  await swipe(195, 420, -120, 0);
  await expect.poll(async () => (await pos())[0]).toBeGreaterThan(l0);
});

// Lighthouse, 2026-10-24: on a phone the page jumped when the web fonts arrived (the breadcrumb rewrapped); the
// fonts are preloaded so the first paint already uses them
test('loading the page on a phone barely shifts it (layout shift under 0.05)', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 823 });
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) w.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(GPGPU);
  await page.waitForTimeout(2000);
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.05);
});

// taste inspector, 2026-10-24: at the video's foot the caption read as a label above the key numbers just below it;
// on the project page it sits at the top, which also leaves the board and the laptop in view
test('the video caption sits at the top of the video, clear of the numbers under it', async ({ page }) => {
  await page.goto(GPGPU);
  const v = (await page.locator('main .hero-media').boundingBox())!;
  const c = (await page.locator('main .hero-media .onfpga').boundingBox())!;
  expect(c.y + c.height).toBeLessThan(v.y + v.height / 2);
});

// Jason, 2026-10-24: on a phone held upright the buttons and the video sat far apart; the trace no longer runs between
// them there, so they keep a normal gap
test('phone, upright: the video follows the buttons at a normal gap', async ({ page }) => {
  for (const [w, h] of [[390, 844], [360, 740], [430, 932]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(GPGPU);
    const b = (await page.locator('main .phead .btns').boundingBox())!;
    const v = (await page.locator('main .hero-media').boundingBox())!;
    const gap = v.y - (b.y + b.height);
    expect(gap, `${w}×${h}`).toBeGreaterThanOrEqual(20);
    expect(gap, `${w}×${h}`).toBeLessThanOrEqual(32);
  }
});

// Jason, 2026-10-24: turning a phone from sideways to upright left the trace starting under the title
test('turning the phone moves the trace start to where that layout puts it, and back', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto(GPGPU);
  const startY = () => page.locator('svg.trace circle.t-pad:not([data-i])').evaluate((c) => { const r = c.getBoundingClientRect(); return r.top + r.height / 2 + scrollY; });
  const bottom = (sel: string) => page.locator(sel).evaluate((e) => e.getBoundingClientRect().bottom + scrollY);
  await expect.poll(async () => Math.abs((await startY()) - (await bottom('main .phead')))).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => Math.abs((await startY()) - (await bottom('main .ptop')))).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(async () => Math.abs((await startY()) - (await bottom('main .phead')))).toBeLessThanOrEqual(1);
});

// Jason, 2026-10-24: on a tablet held upright the numbers sat far above the first section title
test('tablet width: the contents list follows the numbers at a short gap', async ({ page }) => {
  for (const [w, h] of [[768, 1024], [820, 1180], [834, 1194]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(GPGPU);
    const k = (await page.locator('main .knums').boundingBox())!;
    const t = (await page.locator('main nav.toc').boundingBox())!;
    expect(t.y - (k.y + k.height), `${w}×${h}`).toBeLessThanOrEqual(36);
  }
});
