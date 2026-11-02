import { test, expect } from '@playwright/test';
import { auditContrast } from './helpers/contrast';

const PAGES = ['/'];

test('the audit catches a low-contrast element', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const p = document.createElement('p');
    p.id = 'bad';
    p.textContent = 'barely visible';
    p.style.cssText = 'color:#1f4248;background:#11282d;font-size:16px';
    document.querySelector('main')!.append(p);
  });
  const fails = await auditContrast(page);
  expect(fails.map((f) => f.text)).toContain('barely visible');
});

for (const path of PAGES) {
  test(`rendered text meets WCAG AA on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    const fails = await auditContrast(page);
    expect(fails, JSON.stringify(fails, null, 1)).toEqual([]);
  });
}
