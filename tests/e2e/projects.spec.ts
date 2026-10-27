import { expect, test } from '@playwright/test';
import { phoneLayout } from './helpers/layout';

const ORDER = [
  ['gpgpu', 'wide'], ['nbody', 'large'], ['rambo', 'large'], ['wifi', 'large'], ['house', 'large'],
  ['runtime', 'compact'], ['threads', 'compact'],
  ['gpgpu-v2', 'wide'], ['homelab', 'personal'], ['live-fpga-lab', 'personal'], ['dvd-logo-fpga', 'personal'],
];

test('cards follow spec §5.1 items 3–4 in order and size, then the Minecraft origin card', async ({ page }) => {
  await page.goto('/');
  const cards = await page.locator('#projects .card').evaluateAll((els) => els.map((e) => [(e as HTMLElement).dataset.id, (e as HTMLElement).dataset.size]));
  expect(cards).toEqual(ORDER);
  const origin = page.locator('#projects a.origin');
  await expect(origin).toHaveAttribute('href', 'https://acrispycookie.dev');
  await expect(origin.locator('h3')).toHaveText('Where I started: Minecraft plugins');
});

test("each card is one stretched link to the project's own page (Jason, 2026-10-24; the lab's site is its Live pill)", async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#projects .card a.hit').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual([
    '/courses/ece338/gpgpu', '/courses/ece415/nbody', '/courses/ece455/rambo', '/courses/ece436/wifi', '/courses/ece433/house',
    '/courses/ece348/runtime', '/courses/ece321/threads',
    '/projects/gpgpu-v2', '/projects/homelab', '/projects/live-fpga-lab', '/projects/dvd-logo-fpga',
  ]);
  // clicking the card body (not a nested link) follows the title link
  const card = page.locator('#projects .card[data-id="house"]');
  await card.scrollIntoViewIfNeeded();
  await expect(page.locator('#projects')).toHaveClass(/lit/);
  const box = (await card.locator('p.head').boundingBox())!;
  await page.mouse.click(box.x + 4, box.y + box.height / 2);
  await expect(page).toHaveURL(/\/courses\/ece433\/house$/);
});

test('GPGPU card: Run the demo goes to the lab', async ({ page }) => {
  await page.goto('/');
  const demo = page.locator('#projects .card[data-id="gpgpu"] a.btn-live');
  await expect(demo).toHaveText('Run the demo');
  await expect(demo).toHaveAttribute('href', 'https://fpga.njason.dev/?start=gpgpu-nbody'); // straight into that demo's queue (Jason, 2026-10-24)
});

test('course tags, team avatars (Jason first); solo work shows only Jason (no Solo pill)', async ({ page }) => {
  await page.goto('/');
  const tag = page.locator('#projects .card[data-id="nbody"] a.tag');
  await expect(tag).toHaveText('ECE415Grade 9.5');
  await expect(tag).toHaveAttribute('href', '/courses/ece415');
  const threads = await page.locator('#projects .card[data-id="threads"] .av a').evaluateAll((as) => as.map((a) => a.getAttribute('title')));
  expect(threads).toEqual(['Jason Nikas', 'Panagiotis Nikolaos Tsogkas', 'Thodoris Vangos']);
  // Jason (2026-10-21): solo course work shows his avatar alone instead of a "Solo" pill
  await expect(page.locator('#projects .tag', { hasText: /^Solo$/ })).toHaveCount(0);
  const solo = await page.locator('#projects .card[data-id="runtime"] .av a').evaluateAll((as) => as.map((a) => a.getAttribute('title')));
  expect(solo).toEqual(['Jason Nikas']);
  await expect(page.locator('#projects .card[data-id="dvd-logo-fpga"] .tag', { hasText: 'From ECE333' })).toHaveCount(1);
});

test('no card headline wraps past two lines, at any width', async ({ page }) => {
  await page.goto('/');
  const lines = await page.locator('#projects p.head').evaluateAll((ps) => ps.map((p) => {
    const cs = getComputedStyle(p);
    return [p.textContent, Math.round(p.getBoundingClientRect().height / parseFloat(cs.lineHeight))];
  }));
  for (const [text, n] of lines) expect(n, String(text)).toBeLessThanOrEqual(2);
});

test('no shadows, borders or gradients in #projects', async ({ page }) => {
  await page.goto('/');
  const bad = await page.locator('#projects, #projects *').evaluateAll((els) => els.flatMap((e) => {
    const cs = getComputedStyle(e);
    const out: string[] = [];
    if (cs.boxShadow !== 'none') out.push(`shadow ${e.className}`);
    if (['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs.getPropertyValue(`border-${s.toLowerCase()}-width`)) > 0)) out.push(`border ${e.className}`);
    if (cs.backgroundImage.includes('gradient')) out.push(`gradient ${e.className}`);
    return out;
  }));
  expect(bad).toEqual([]);
});

test('videos are muted inline loops over their still, and play on screen', async ({ page }) => {
  await page.goto('/');
  const vids = await page.locator('#projects video').evaluateAll((vs) => vs.map((v) => {
    const x = v as HTMLVideoElement;
    return { muted: x.muted, inline: x.playsInline, loop: x.loop, poster: !!x.previousElementSibling?.matches('img.still') };
  }));
  expect(vids).toHaveLength(3); // GPGPU, N-body and DVD
  for (const v of vids) expect(v).toEqual({ muted: true, inline: true, loop: true, poster: true });
  const v = page.locator('#projects .card[data-id="nbody"] video');
  await v.scrollIntoViewIfNeeded();
  await expect.poll(() => v.evaluate((x) => (x as HTMLVideoElement).paused)).toBe(false);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('videos stay paused on their poster', async ({ page }) => {
    await page.goto('/');
    const v = page.locator('#projects .card[data-id="nbody"] video');
    await v.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(await page.locator('#projects video').evaluateAll((vs) => vs.map((x) => (x as HTMLVideoElement).paused))).toEqual([true, true, true]);
  });
});

test('cards sit on the grid gap only (no stray margins from size classes)', async ({ page }) => {
  await page.goto('/');
  const margins = await page.locator('#projects .card').evaluateAll((cs) => cs.map((c) => getComputedStyle(c).marginTop));
  expect([...new Set(margins)]).toEqual(['0px']);
});

test('phone layout: Run the demo is a full-width button under the summary, tag and avatars share the row below', async ({ page }) => {
  test.skip(!phoneLayout(page));
  await page.goto('/');
  const r = await page.locator('#projects .card[data-id="gpgpu"]').evaluate((card) => {
    const b = (s: string) => card.querySelector(s)!.getBoundingClientRect();
    const btn = b('a.btn-live'), sum = b('.sum'), tag = b('.meta .tag'), av = b('.av'), body = b('.body');
    return { btnW: Math.round(btn.width), bodyW: Math.round(body.width), btnBelowSum: btn.top >= sum.bottom, tagBelowBtn: tag.top >= btn.bottom, sameRow: Math.abs((tag.top + tag.bottom) / 2 - (av.top + av.bottom) / 2) < 4, avRight: Math.round(body.right - av.right) };
  });
  expect(r.btnW).toBe(r.bodyW);
  expect(r).toMatchObject({ btnBelowSum: true, tagBelowBtn: true, sameRow: true });
  expect(r.avRight).toBeLessThanOrEqual(1);
});

test('a demo button wherever a project runs in the lab, except the card that already goes there', async ({ page }) => {
  await page.goto('/');
  const demo = (id: string) => page.locator(`#projects .card[data-id="${id}"] a.btn-live`);
  await expect(demo('gpgpu')).toHaveText('Run the demo');
  // Jason (2026-10-21): the DVD logo runs in the lab too
  await expect(demo('dvd-logo-fpga')).toHaveText('Run the demo');
  await expect(demo('dvd-logo-fpga')).toHaveAttribute('href', 'https://fpga.njason.dev/?start=dvd-logo-video');
  await expect(demo('live-fpga-lab')).toHaveCount(0);
  // the button is above the card's stretched link: a real click on it goes to the lab, not the project
  await demo('dvd-logo-fpga').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // the section's reveal settles
  const box = (await demo('dvd-logo-fpga').boundingBox())!;
  const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('a')?.getAttribute('href'), [box.x + box.width / 2, box.y + box.height / 2]);
  expect(hit).toBe('https://fpga.njason.dev/?start=dvd-logo-video');
});

test('a card video\'s still loads only as the card nears the screen, at full quality (Lighthouse, 2026-10-25)', async ({ page }) => {
  // a poster loads with the page at full priority and held back the hero photo (home LCP 3.4–3.9 s → 1.8–2.3 s);
  // a lazy still is fetched at low priority, and only when the card is within the browser's lazy-load distance
  await page.goto('/');
  // each card video has its still as a lazy picture under it, the same full-size file the video was cut from
  for (const v of await page.locator('#projects .card video').all()) {
    expect(await v.getAttribute('poster')).toBeNull();
    const still = v.locator('xpath=preceding-sibling::img[1]');
    await expect(still).toHaveAttribute('loading', 'lazy');
    expect(await still.getAttribute('src')).toBe((await v.getAttribute('src'))!.replace(/\.mp4$/, '.jpg'));
  }
  // and it arrives once the card is near
  await page.locator('#projects .card[data-id="nbody"]').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('#projects .card[data-id="nbody"] img.still').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
});

for (const [w, h, phone] of [[734, 343, 'iPhone 15'], [932, 400, 'iPhone 15 Pro Max']] as const) {
  test(`phone held sideways (${phone}): every card picture is whole, never a cropped strip (Jason, 2026-10-25)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    const cards = await page.locator('#projects .card').evaluateAll((cs) => cs.map((c) => {
      const m = c.querySelector('.media')!.getBoundingClientRect(), t = c.querySelector('.body')!.getBoundingClientRect();
      const [aw, ah = aw] = getComputedStyle(c.querySelector('.media')!).aspectRatio.split('/').map(Number);
      return { id: (c as HTMLElement).dataset.id, ratio: m.width / m.height, own: aw / ah, h: m.height, beside: t.left >= m.right - 1 || m.bottom <= t.top + 1 };
    }));
    for (const c of cards) {
      expect(Math.abs(c.ratio - c.own), c.id).toBeLessThan(0.05); // whole: its own shape, never cut down
      expect(c.beside, c.id).toBe(true); // beside its text, or above it whole; taller than the screen is fine: it scrolls (2026-10-26)
    }
  });
}

// The Minecraft drawing is a card picture like the others: it may not shrink below the personal cards' pictures above
// it at any window shape (Jason, 2026-10-26: "still smaller on some dimensions")
test('the Minecraft drawing is as big as the personal cards\' pictures, and no project picture is smaller, at every window shape', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'one sweep is enough; it sets its own window sizes');
  test.setTimeout(600_000);
  const small: string[] = [];
  for (const url of ['/', '/projects']) {
    await page.goto(url);
    for (const h of [360, 520, 800, 1000]) for (let w = 280; w <= 1920; w += 40) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(40);
      const r = await page.evaluate(() => {
        const o = document.querySelector('.origin .blk')!.getBoundingClientRect();
        const m = document.querySelector('.grid.three .card .media')!.getBoundingClientRect();
        // every project picture in its section is at least as wide and as tall as the drawing (Jason, 2026-10-26: in a
        // half-width window the lead project's picture was half the drawing's width, and stacked it was shorter)
        const narrower = [...document.querySelector('.origin')!.parentElement!.querySelectorAll('.cards .card .media')].map((e) => e.getBoundingClientRect())
          .filter((m) => m.width < o.width - 1 || m.height < o.height - 1).map((m) => `${Math.round(m.width)}×${Math.round(m.height)}`);
        return { o: [Math.round(o.width), Math.round(o.height)], m: [Math.round(m.width), Math.round(m.height)], narrower };
      });
      if (r.o[0] < r.m[0] * 0.95 || r.o[1] < r.m[1] * 0.95) small.push(`${url} ${w}×${h}: drawing ${r.o.join('×')}, card picture ${r.m.join('×')}`);
      if (r.narrower.length) small.push(`${url} ${w}×${h}: drawing ${r.o.join('×')}, smaller project pictures ${r.narrower.join(', ')}`);
    }
  }
  expect(small).toEqual([]);
});
