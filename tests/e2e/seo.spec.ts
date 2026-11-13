// Launch basics (plan Task 7): every built page has its canonical URL, share tags and a title of its own; the sitemap,
// robots.txt, favicon, share image and 404 page exist; the old pill test page is gone. Reads the built site in dist/.
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const SITE = 'https://njason.dev';
const dist = (p: string) => `dist${p}`;
// the sitemap's own pages, as paths
const sitemapPaths = () => {
  const index = readFileSync(dist('/sitemap-index.xml'), 'utf8');
  const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  return maps.flatMap((m) => [...readFileSync(dist(m), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => new URL(x[1]).pathname));
};
// every page the build wrote, as paths
const builtPaths = () => {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) { if (!['_astro', 'reports', 'videos'].includes(e.name)) walk(p); }
      else if (e.name === 'index.html') out.push(p.slice(4, -'index.html'.length) || '/');
    }
  };
  walk('dist');
  return out;
};

// these read files, not a browser: one project is enough
test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop'));

test('the sitemap lists every page and not the 404', () => {
  const listed = sitemapPaths().sort();
  expect(listed).toEqual(builtPaths().sort());
  expect(listed.some((p) => p.includes('404'))).toBe(false);
});

test('robots.txt names the sitemap', () => {
  expect(readFileSync(dist('/robots.txt'), 'utf8')).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
});

test('the old pill test page is gone', () => {
  expect(existsSync(dist('/pill-test'))).toBe(false);
});

test('every page: canonical, share tags, and a title of its own', async ({ page, request }) => {
  test.setTimeout(180_000);
  const titles = new Map<string, string>();
  for (const path of sitemapPaths()) {
    await page.goto(path);
    expect(await page.locator('link[rel=canonical]').getAttribute('href'), path).toBe(SITE + path);
    for (const k of ['og:title', 'og:description', 'og:url', 'og:image']) {
      expect((await page.locator(`meta[property="${k}"]`).getAttribute('content'))?.length, `${path} ${k}`).toBeGreaterThan(0);
    }
    expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(SITE + path);
    const img = (await page.locator('meta[property="og:image"]').getAttribute('content'))!;
    expect(img.startsWith(`${SITE}/`), `${path} og:image is absolute`).toBe(true);
    expect((await request.get(new URL(img).pathname)).status(), img).toBe(200);
    expect(await page.locator('meta[name="twitter:card"]').getAttribute('content')).toBe('summary_large_image');
    const t = await page.title();
    expect(titles.get(t), `${path} shares its title with ${titles.get(t)}`).toBeUndefined();
    titles.set(t, path);
  }
});

test('the favicon and the home-screen icon are served', async ({ page, request }) => {
  for (const f of ['/favicon.svg', '/apple-touch-icon.png', '/og.png']) expect((await request.get(f)).status(), f).toBe(200);
  await page.goto('/');
  expect(await page.locator('link[rel=icon]').getAttribute('href')).toBe('/favicon.svg');
  expect(await page.locator('link[rel=apple-touch-icon]').getAttribute('href')).toBe('/apple-touch-icon.png');
});

test('the share image is 1200 by 630', async ({ page }) => {
  await page.goto('/og.png');
  const size = await page.locator('img').evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight]);
  expect(size).toEqual([1200, 630]);
});

test('the 404 page has a heading and the ways back', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toHaveText("This page isn't on the board");
  await expect(page.locator('main a[href="/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/projects"]')).toHaveCount(1);
  expect(await page.locator('meta[name=robots]').getAttribute('content')).toBe('noindex');
  // an error page names no address of its own for search engines to keep
  await expect(page.locator('link[rel=canonical]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
});
