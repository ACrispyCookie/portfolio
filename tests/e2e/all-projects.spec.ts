import { expect, test } from '@playwright/test';

test('All projects: counts, personal first, then courses by importance as on home', async ({ page }) => {
  await page.goto('/projects');
  // header counts are computed: 29 projects and 11 courses today
  await expect(page.locator('main h1')).toHaveText('Projects');
  await expect(page.locator('.counts')).toHaveText('29 projects and 11 courses');
  // personal first, then courses by importance, never by grade (Jason, 2026-10-22); ECE333 under Distributed Systems and
  // Operating Systems above Concurrent Programming (Jason, 2026-10-23)
  await expect(page.locator('#beyond .card h3')).toHaveText(['GPGPU v2', 'Homelab', 'Live FPGA Lab', 'DVD Logo FPGA']);
  await expect(page.locator('.course a.ch .cn b')).toHaveText(['ECE338', 'ECE415', 'ECE455', 'ECE436', 'ECE433', 'ECE348', 'ECE333', 'ECE318', 'ECE321', 'ECE494', 'ECE340']);
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
  // the Live FPGA Lab card goes to the lab itself, as on home
  for (const h of hrefs) expect(h).toMatch(/^(\/projects\/[a-z0-9-]+|\/courses\/ece\d{3}(\/[a-z0-9-]+|#[a-z0-9-]+)?|#[a-z0-9-]+|https:\/\/fpga\.njason\.dev)$/);
});

test('the way to it: top bar, menu, hero button, footer, and two "See all" links on home', async ({ page }) => {
  await page.goto('/');
  // every Projects link goes to the page, home's included (Jason, 2026-10-23)
  await expect(page.locator('.topbar nav a', { hasText: 'Projects' })).toHaveAttribute('href', '/projects');
  await expect(page.locator('.menu-sheet a', { hasText: 'Projects' })).toHaveAttribute('href', '/projects');
  await expect(page.locator('.cta a', { hasText: 'See my projects' })).toHaveAttribute('href', '/projects');
  await expect(page.locator('.foot .links a').first()).toHaveText('Projects');
  await expect(page.locator('.foot .links a').first()).toHaveAttribute('href', '/projects');
  const seeAll = page.locator('main a.seeall');
  await expect(seeAll).toHaveCount(2);
  for (const id of ['projects', 'people']) {
    await expect(page.locator(`#${id} a.seeall`)).toHaveAttribute('href', '/projects');
    // it's the section's last link, and it reads the full wording where it fits (the short one below 420px)
    const last = page.locator(`#${id} a`).last();
    await expect(last).toHaveText(page.viewportSize()!.width > 420 ? 'See all 29 projects and 11 courses' : 'See all projects and courses', { useInnerText: true });
  }
  await page.goto('/projects');
  await expect(page.locator('.topbar nav a', { hasText: 'Projects' })).toHaveAttribute('href', '/projects');
});

test('All projects: the older portfolio, as on home', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('#beyond a.origin')).toHaveAttribute('href', 'https://acrispycookie.dev');
});

test('All projects: each course names its collaborators (solo courses: tests/e2e/beyond.spec.ts)', async ({ page }) => {
  await page.goto('/projects');
  const course = (code: string) => page.locator('.course', { has: page.locator('a.ch .cn b', { hasText: code }) });
  await expect(course('ECE415').locator('.with')).toHaveText('With Dimitrios Tsiantos and Panagiotis Nikolaos Tsogkas', { useInnerText: true });
  await expect(course('ECE415').locator('.with .av a')).toHaveCount(3); // me and the two of them
  await expect(course('ECE340').locator('.with')).toHaveText('With Panagiotis Nikolaos Tsogkas', { useInnerText: true });
});

test('All projects: every project shows its tools, six at most', async ({ page }) => {
  await page.goto('/projects');
  const rows = page.locator('#beyond .card, .course li');
  await expect(rows).toHaveCount(29);
  for (const r of await rows.all()) {
    const tags = r.locator('.tools .tag');
    const n = await tags.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(6);
  }
  // up to six tools show in full (N-body has six); a longer list shows five and "+N" (Homelab has 13)
  const row = (t: string) => page.locator('#beyond .card, .course li', { has: page.locator('h3, a', { hasText: t }) });
  await expect(row('N-body on GPUs').locator('.tools .tag')).toHaveText(['C', 'Python', 'Bash', 'CUDA', 'OpenMP', 'Git']);
  await expect(row('Homelab').locator('.tools .tag')).toHaveText(['JavaScript', 'Bash', 'Docker', 'Nginx', 'WireGuard', '+8']);
  await expect(row('Homelab').locator('.tools .more')).toHaveAttribute('title', 'Pi-hole, Ansible, Proxmox, PostgreSQL, MySQL, Git, Traefik, SQLite');
});

const course = (page: import('@playwright/test').Page, code: string) => page.locator('.course', { has: page.locator('a.ch .cn b', { hasText: code }) });

test('All projects: one course per row, so a short course never sits beside a tall one (Jason, 2026-10-22)', async ({ page }) => {
  await page.goto('/projects');
  const boxes = await page.locator('.course').evaluateAll((cs) => cs.map((c) => { const r = c.getBoundingClientRect(); return { x: Math.round(r.x), w: Math.round(r.width), top: r.top, bottom: r.bottom }; }));
  const list = (await page.locator('.courses').boundingBox())!;
  for (const b of boxes) {
    expect(b.x).toBe(Math.round(list.x));
    expect(Math.abs(b.w - list.width)).toBeLessThanOrEqual(1);
  }
  for (let i = 1; i < boxes.length; i++) expect(boxes[i].top).toBeGreaterThanOrEqual(boxes[i - 1].bottom);
});

test('All projects: course pictures are large, at the home card size or the full width when stacked', async ({ page }) => {
  await page.goto('/projects');
  for (const t of await page.locator('.course .thumb').all()) {
    const r = (await t.boundingBox())!;
    const c = (await t.locator('xpath=ancestor::div[contains(@class,"course")][1]').boundingBox())!;
    const body = (await t.locator('xpath=ancestor::div[contains(@class,"course")][1]').locator('.cbody').boundingBox())!;
    const vh = page.viewportSize()!.height;
    if (r.y + r.height <= body.y + 1) expect(Math.abs(r.width - Math.min(c.width, vh * 0.96))).toBeLessThanOrEqual(1); // stacked: the full width (narrowed only on a short screen)
    else expect(r.width).toBeGreaterThanOrEqual(Math.min(c.width * 0.45, 520, vh * 0.96) - 1); // beside the course: about 46% of it, up to 520px
    // always 16:10: a short screen narrows the picture rather than cropping it (Jason, 2026-10-23)
    expect(Math.abs(r.height / r.width - 0.625)).toBeLessThan(0.02);
  }
});

test('All projects: three or more projects sit in two columns wherever the list is 440px or wider', async ({ page }) => {
  await page.goto('/projects');
  const columns = (code: string) => course(page, code).locator('ul > li').evaluateAll((ls) => new Set(ls.map((l) => Math.round(l.getBoundingClientRect().x))).size);
  const roomy = async (code: string) => (await course(page, code).locator('.cbody').boundingBox())!.width >= 440;
  for (const code of ['ECE415', 'ECE333']) expect(await columns(code)).toBe((await roomy(code)) ? 2 : 1);
  const vw = page.viewportSize()!.width;
  if (vw >= 1440) expect(await columns('ECE415')).toBe(2); // desktop: always two
  if (vw <= 420) expect(await columns('ECE415')).toBe(1); // phone: always one
  expect(await columns('ECE318')).toBe(1); // two projects stay in one column
});

test('All projects: every course and personal project has a real picture (no placeholder pad)', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('.thumb .pad')).toHaveCount(0);
  await expect(course(page, 'ECE338').locator('.thumb video')).toHaveAttribute('src', '/media/gpgpu.mp4');
  await expect(course(page, 'ECE494').locator('.thumb img')).toHaveCount(1);
  for (const [code, kind] of [['ECE318', 'dedup'], ['ECE340', 'alignment'], ['ECE348', 'runtime'], ['ECE321', 'threads']])
    await expect(course(page, code).locator(`.thumb svg.diagram[data-kind="${kind}"]`)).toHaveCount(1);
});

test('the GPGPU video says the FPGA does the work, on /projects and on home', async ({ page }) => {
  for (const [path, box] of [['/projects', '.course .thumb'], ['/', '#projects .card[data-id="gpgpu"] .media']]) {
    await page.goto(path);
    const strip = page.locator(`${box} .onfpga`);
    await expect(strip).toHaveCount(1);
    await expect(strip).toContainText('32-core RISC-V GPGPU'); // its name, not just its cores (Jason, 2026-10-23)
    await expect(strip).toContainText('laptop');
    // the strip sits over the bottom of the video, inside it
    const v = (await page.locator(`${box}:has(.onfpga) video`).boundingBox())!;
    const s = (await strip.boundingBox())!;
    expect(s.x).toBeGreaterThanOrEqual(v.x - 1);
    expect(s.x + s.width).toBeLessThanOrEqual(v.x + v.width + 1);
    expect(Math.abs(s.y + s.height - (v.y + v.height))).toBeLessThanOrEqual(12);
    // it explains the video without hiding it: at most 30% of its height at any width (Jason saw half on a phone)
    expect(s.height).toBeLessThanOrEqual(v.height * 0.3);
  }
});

test('the origin card shows Minecraft and plugin work, on /projects and on home', async ({ page }) => {
  for (const path of ['/projects', '/']) {
    await page.goto(path);
    await expect(page.locator('a.origin svg[data-kind="minecraft"]')).toHaveCount(1);
  }
});

test('the origin drawing: every code line stays inside its window, and the drawing is centred', async ({ page }) => {
  for (const path of ['/projects', '/']) {
    await page.goto(path);
    const f = await page.locator('a.origin svg[data-kind="minecraft"]').evaluate((svg) => {
      const win = (svg.querySelector('.win') as SVGGraphicsElement).getBBox();
      const lines = [...svg.querySelectorAll('.win ~ g text')].map((t) => (t as SVGGraphicsElement).getBBox());
      const art = (svg.querySelector('.art') as SVGGraphicsElement).getBBox();
      return { inside: lines.every((b) => b.x >= win.x + 6 && b.x + b.width <= win.x + win.width - 6), n: lines.length, left: art.x, right: 320 - (art.x + art.width) };
    });
    expect(f.n).toBeGreaterThan(0);
    expect(f.inside).toBe(true);
    expect(Math.abs(f.left - f.right)).toBeLessThanOrEqual(4);
  }
});

test('the Homelab drawing has no live dot (Jason, 2026-10-23: it only lists service categories)', async ({ page }) => {
  for (const path of ['/projects', '/']) {
    await page.goto(path);
    await expect(page.locator('svg.diagram[data-kind="homelab"]').first()).toBeAttached();
    await expect(page.locator('svg.diagram[data-kind="homelab"] circle')).toHaveCount(0);
  }
});

test('the lab screenshot and the DVD video are 16:10 at the source, so the box never crops or stretches them (Jason, 2026-10-23)', async ({ page }) => {
  await page.goto('/');
  const lab = page.locator('#projects .card[data-id="live-fpga-lab"] .media img');
  await lab.scrollIntoViewIfNeeded();
  await expect.poll(() => lab.evaluate((i) => (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const [w, h] = await lab.evaluate((i) => [(i as HTMLImageElement).naturalWidth, (i as HTMLImageElement).naturalHeight]);
  expect(Math.abs(w / h - 1.6)).toBeLessThan(0.01);
  // the video's poster is its own frame at its own size; it loads as an image in every browser (this machine's WebKit
  // can't decode H.264, so it never reports the video's size)
  const poster = await page.locator('#projects .card[data-id="dvd-logo-fpga"] video').getAttribute('poster');
  const [vw, vh] = await page.evaluate((src) => new Promise<number[]>((ok) => { const i = new Image(); i.onload = () => ok([i.naturalWidth, i.naturalHeight]); i.src = src!; }), poster);
  expect(Math.abs(vw / vh - 1.6)).toBeLessThan(0.01);
});

test('the house screenshot and the n-body video are 16:10 at the source: no window frame, the galaxy filling the frame (Jason, 2026-10-23)', async ({ page }) => {
  await page.goto('/');
  const house = page.locator('#projects .card[data-id="house"] .media img');
  await house.scrollIntoViewIfNeeded();
  await expect.poll(() => house.evaluate((i) => (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const [w, h] = await house.evaluate((i) => [(i as HTMLImageElement).naturalWidth, (i as HTMLImageElement).naturalHeight]);
  expect(Math.abs(w / h - 1.6)).toBeLessThan(0.01);
  const poster = await page.locator('#projects .card[data-id="nbody"] video').getAttribute('poster');
  const [vw, vh] = await page.evaluate((src) => new Promise<number[]>((ok) => { const i = new Image(); i.onload = () => ok([i.naturalWidth, i.naturalHeight]); i.src = src!; }), poster);
  expect(Math.abs(vw / vh - 1.6)).toBeLessThan(0.01);
});

test('the GPGPU card names it: a 32-core RISC-V GPGPU (Jason, 2026-10-23)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#projects .card[data-id="gpgpu"] .head')).toHaveText('Our 32-core RISC-V GPGPU, running on a real FPGA');
});

test('the origin picture fills the card when it sits above the text (phones)', async ({ page }) => {
  for (const path of ['/projects', '/']) {
    await page.goto(path);
    const card = page.locator('a.origin').first();
    const [blk, h3, inner] = await card.evaluate((c) => {
      const cs = getComputedStyle(c);
      return [c.querySelector('.blk')!.getBoundingClientRect(), c.querySelector('h3')!.getBoundingClientRect(), c.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)].map((r) => (typeof r === 'number' ? r : { w: r.width, bottom: r.bottom, top: r.top }));
    }) as [{ w: number; bottom: number }, { top: number }, number];
    if (blk.bottom <= h3.top) expect(Math.abs(blk.w - inner)).toBeLessThanOrEqual(1); // stacked: full width
  }
});

test('All projects: Beyond coursework uses the same cards as on home, lighter on hover and never underlined (Jason, 2026-10-23)', async ({ page }) => {
  await page.goto('/projects');
  const cards = page.locator('#beyond .card');
  await expect(cards).toHaveCount(4);
  test.skip(!!page.viewportSize() && (await page.evaluate(() => !matchMedia('(hover: hover)').matches)), 'no hover on touch screens');
  const card = cards.first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.evaluate((c) => getComputedStyle(c).backgroundColor);
  await card.locator('h3').hover();
  await expect.poll(() => card.evaluate((c) => getComputedStyle(c).backgroundColor)).not.toBe(before);
  const lines = await card.evaluate((c) => [...c.querySelectorAll('*')].filter((e) => getComputedStyle(e).textDecorationLine.includes('underline')).length);
  expect(lines).toBe(0);
});

test('on a phone the page header sits on the page margin like home\'s hero; only what runs beside the trace is inset', async ({ page }) => {
  test.skip(page.viewportSize()!.width > 760, 'phones only');
  await page.goto('/projects');
  const name = (await page.locator('.topbar .name').boundingBox())!;
  const h1 = (await page.locator('main h1').boundingBox())!;
  const h2 = (await page.locator('#beyond h2').boundingBox())!;
  expect(Math.abs(h1.x - name.x)).toBeLessThanOrEqual(1);
  expect(h2.x).toBeGreaterThan(h1.x + 20); // the traced sections keep their gutter
});

test('tablets in portrait: every picture goes above its text at the full width (Jason, 2026-10-23: too small beside it)', async ({ page }) => {
  const { width: vw, height: vh } = page.viewportSize()!;
  test.skip(!(vh > vw && vw >= 560 && vw <= 900), 'tablet portrait only');
  await page.goto('/projects');
  for (const c of await page.locator('.course').all()) {
    const [t, body, box] = [(await c.locator('.thumb').boundingBox())!, (await c.locator('.cbody').boundingBox())!, (await c.boundingBox())!];
    expect(t.y + t.height).toBeLessThanOrEqual(body.y + 1);
    expect(Math.abs(t.width - Math.min(box.width, vh * 0.96))).toBeLessThanOrEqual(1);
  }
  for (const c of await page.locator('#beyond .card').all()) {
    const [m, body, box] = [(await c.locator('.media').boundingBox())!, (await c.locator('.body').boundingBox())!, (await c.boundingBox())!];
    expect(m.y + m.height).toBeLessThanOrEqual(body.y + 1);
    expect(m.width).toBeGreaterThanOrEqual(box.width - 40);
  }
});

test('the trace starts clear of the header text: its pad never touches the last line of the lead', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForFunction(() => document.querySelector('.t-pad.on:not([data-i])')); // the start pad (the others mark sections)
  const gap = await page.evaluate(() => {
    const pad = document.querySelector('.t-pad.on:not([data-i])')!.getBoundingClientRect();
    const r = document.createRange(); r.selectNodeContents(document.querySelector('.allhead .lead')!);
    const lines = [...r.getClientRects()];
    return Math.min(...lines.filter((l) => l.right > pad.left && l.left < pad.right).map((l) => pad.top - l.bottom), pad.top - lines[lines.length - 1].bottom);
  });
  expect(gap).toBeGreaterThanOrEqual(8);
});

test('every pill is the same height: a short project beside a tall one never stretches its pills', async ({ page }) => {
  await page.goto('/projects');
  const hs = await page.locator('main .tag').evaluateAll((ts) => ts.filter((t) => t.getBoundingClientRect().width).map((t) => Math.round(t.getBoundingClientRect().height)));
  expect(Math.max(...hs) - Math.min(...hs)).toBeLessThanOrEqual(1);
});
