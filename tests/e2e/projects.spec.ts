import { expect, test } from '@playwright/test';
import { phoneLayout } from './helpers/layout';

const ORDER = [
  ['gpgpu', 'wide'], ['nbody', 'large'], ['rambo', 'large'], ['wifi', 'large'], ['house', 'large'],
  ['runtime', 'compact'], ['threads', 'compact'],
  ['homelab', 'personal'], ['live-fpga-lab', 'personal'], ['dvd-logo-fpga', 'personal'],
];

test('cards follow spec §5.1 items 3–4 in order and size, then the Minecraft origin card', async ({ page }) => {
  await page.goto('/');
  const cards = await page.locator('#projects .card').evaluateAll((els) => els.map((e) => [(e as HTMLElement).dataset.id, (e as HTMLElement).dataset.size]));
  expect(cards).toEqual(ORDER);
  const origin = page.locator('#projects a.origin');
  await expect(origin).toHaveAttribute('href', 'https://acrispycookie.dev');
  await expect(origin.locator('h3')).toHaveText('Where I started: Minecraft plugins');
});

test('each card is one stretched link to its section, page or the lab', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#projects .card a.hit').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual([
    '/courses/ece338#gpgpu', '/courses/ece415#nbody', '/courses/ece455#rambo', '/courses/ece436#wifi', '/courses/ece433#house',
    '/courses/ece348#runtime', '/courses/ece321#threads',
    '/projects/homelab', 'https://fpga.njason.dev', '/projects/dvd-logo-fpga',
  ]);
  // clicking the card body (not a nested link) follows the title link
  const card = page.locator('#projects .card[data-id="house"]');
  await card.scrollIntoViewIfNeeded();
  await expect(page.locator('#projects')).toHaveClass(/lit/);
  const box = (await card.locator('p.head').boundingBox())!;
  await page.mouse.click(box.x + 4, box.y + box.height / 2);
  await expect(page).toHaveURL(/\/courses\/ece433#house$/);
});

test('GPGPU card: Run the demo goes to the lab', async ({ page }) => {
  await page.goto('/');
  const demo = page.locator('#projects .card[data-id="gpgpu"] a.btn-live');
  await expect(demo).toHaveText('Run the demo');
  await expect(demo).toHaveAttribute('href', 'https://fpga.njason.dev');
});

test('course tags, team avatars (Jason first); solo work shows only Jason (no Solo pill)', async ({ page }) => {
  await page.goto('/');
  const tag = page.locator('#projects .card[data-id="nbody"] a.tag');
  await expect(tag).toHaveText('ECE415Grade 9.5');
  await expect(tag).toHaveAttribute('href', '/courses/ece415');
  const threads = await page.locator('#projects .card[data-id="threads"] .av a').evaluateAll((as) => as.map((a) => a.getAttribute('title')));
  expect(threads).toEqual(['Jason Nikas', 'Panagiotis Nikolaos Tsogkas', 'Tvangos']);
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

test('videos are muted inline loops with a poster that play on screen', async ({ page }) => {
  await page.goto('/');
  const vids = await page.locator('#projects video').evaluateAll((vs) => vs.map((v) => {
    const x = v as HTMLVideoElement;
    return { muted: x.muted, inline: x.playsInline, loop: x.loop, poster: !!x.getAttribute('poster') };
  }));
  expect(vids).toHaveLength(2);
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
    expect(await page.locator('#projects video').evaluateAll((vs) => vs.map((x) => (x as HTMLVideoElement).paused))).toEqual([true, true]);
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
