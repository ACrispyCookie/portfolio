import { expect, test } from '@playwright/test';

// Links to other sites open in a new tab, so the portfolio stays open behind them (Jason, 2026-10-23).
// Links within the site keep the same tab.

for (const path of ['/', '/projects']) {
  test(`${path}: every link to another site opens in a new tab, safely; links within the site stay in this tab`, async ({ page }) => {
    await page.goto(path);
    const links = await page.locator('a[href]').evaluateAll((as) => as.map((a) => ({ href: a.getAttribute('href')!, target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '' })));
    const out = links.filter((l) => /^https?:/.test(l.href));
    expect(out.length).toBeGreaterThan(5);
    for (const l of out) {
      expect(l.target, l.href).toBe('_blank');
      expect(l.rel.split(' '), l.href).toContain('noopener');
    }
    for (const l of links.filter((l) => !/^https?:/.test(l.href))) expect(l.target, l.href).toBeNull();
  });
}
