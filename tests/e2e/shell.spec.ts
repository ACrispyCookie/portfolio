import { test, expect } from '@playwright/test';
import { phoneLayout } from './helpers/layout';

test('home has doctype, title and its content edges', async ({ page, request }) => {
  // the page never scrolls sideways, and nothing hides overflow
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.body).overflowX)).toBe('visible');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const res = await request.get('/');
  expect((await res.text()).trimStart().toLowerCase().startsWith('<!doctype html>')).toBe(true);
  await page.goto('/');
  await expect(page).toHaveTitle('Jason Nikas');
  // Jason (2026-10-21): what isn't beside the trace is centred; sections beside it start one trace gutter in.
  // On desktop the gutter is mirrored on the right, so both groups share one edge there.
  const r = await page.evaluate(() => {
    const box = (el: Element) => el.getBoundingClientRect();
    const centred = [document.querySelector('.topbar .name')!, document.querySelector('main > .hero')!, document.querySelector('.foot-in > div')!];
    const traced = [...document.querySelectorAll('main > section:not(.hero)')];
    const hero = box(document.querySelector('main > .hero')!);
    return {
      centred: centred.map((e) => Math.round(box(e).left)),
      traced: traced.map((e) => Math.round(box(e).left)),
      heroRight: Math.round(innerWidth - hero.right),
      rail: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rail')),
    };
  });
  for (const x of r.centred) expect(Math.abs(x - r.centred[0]), 'centred blocks share an edge').toBeLessThanOrEqual(1);
  for (const x of r.traced) expect(Math.abs(x - r.traced[0]), 'traced sections share an edge').toBeLessThanOrEqual(1);
  expect(Math.abs(r.centred[0] - r.heroRight), 'the hero is centred').toBeLessThanOrEqual(1);
  const inset = phoneLayout(page) ? r.rail : 0;
  expect(Math.abs(r.traced[0] - r.centred[0] - inset), 'sections start one trace gutter in on phone').toBeLessThanOrEqual(1);
});

test('top bar matches spec', async ({ page }) => {
  await page.goto('/');
  const nav = await page.locator('.topbar nav a, .topbar .menu-sheet a').allTextContents();
  expect([...new Set(nav.map((t) => t.trim()))]).toEqual(['Projects', 'Timeline', 'Skills', 'Contact']);
  {
    const bar = await page.locator('.topbar').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { blur: cs.backdropFilter, bg: cs.backgroundColor };
    });
    expect(bar.blur).toBe('none');
    expect(bar.bg).toBe('rgb(11, 29, 33)');
  }
});

test('footer links', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('.foot .links a');
  expect((await links.allTextContents()).map((t) => t.trim())).toEqual(['Projects', 'GitHub', 'LinkedIn', 'Email', 'Older portfolio']);
  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))) {
    expect(href).not.toContain('fpga.njason.dev');
  }
});
