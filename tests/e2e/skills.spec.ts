import { expect, test, type Page } from '@playwright/test';

const EMAIL = 'nikasjason1@gmail.com';
const tap = (page: Page, sel: string, isMobile: boolean) => (isMobile ? page.locator(sel).tap() : page.locator(sel).click());

test('section order ends Timeline, Skills, Contact', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('main > section[id]').evaluateAll((s) => s.map((e) => e.id));
  expect(ids.slice(-3)).toEqual(['timeline', 'skills', 'contact']);
});

test('skills: intro, the first 14 chips, and a hint until a tap', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#skills .lead')).toHaveText('Tools from my projects. The number is how many projects on this site use each one.');
  await expect(page.locator('#skills .chip:visible')).toHaveCount(14);
  await expect(page.locator('#skills .usedline')).toHaveText('Tap a tool to see where I used it.');
});

test('tapping a chip presses it and writes where it was used', async ({ page, isMobile }) => {
  await page.goto('/');
  const first = page.locator('#skills .chip').first();
  const tool = (await first.getAttribute('data-tool'))!;
  await first.scrollIntoViewIfNeeded();
  await tap(page, '#skills .chip >> nth=0', isMobile);
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#skills .usedline')).toContainText(new RegExp(`^${tool.replace(/[+]/g, '\\+')}\\s*Used in `));
  await tap(page, '#skills .chip[data-tool="CUDA"]', isMobile);
  await expect(first).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#skills .usedline')).toHaveText('CUDA Used in N-body on GPUs (ECE415), CUDA convolution (ECE415) and CLAHE (ECE415).');
  await expect(page.locator('#skills .usedline a')).toHaveCount(3);
});

test('coursework-only tools name the course; used tools add coursework after the projects', async ({ page }) => {
  await page.goto('/');
  await page.locator('#skills .more').click();
  await page.locator('#skills .chip[data-tool="MATLAB"]').click();
  await expect(page.locator('#skills .usedline')).toHaveText('MATLAB Not in a project on this site.');
  await expect(page.locator('#skills .cwline')).toHaveText('In other coursework: Numerical Analysis.');
  await page.locator('#skills .chip[data-tool="MySQL"]').click();
  await expect(page.locator('#skills .usedline')).toHaveText('MySQL Used in Homelab and Minecraft plugins.');
  await expect(page.locator('#skills .cwline')).toHaveText('In other coursework: ECE311 Databases.');
});

test('a long coursework list waits behind "Show N courses"', async ({ page }) => {
  await page.goto('/?tool=C');
  const cw = page.locator('#skills .cwline');
  const btn = cw.locator('button.showcw');
  await expect(btn).toHaveText(/^Show \d+ courses$/);
  await expect(cw).toHaveText(/^In other coursework: Show \d+ courses$/);
  await expect(cw).not.toContainText('ECE115');
  await btn.click();
  await expect(cw).toContainText('In other coursework: ECE115 Programming I');
  await expect(cw.locator('button.showcw')).toHaveCount(0);
});

test('a tool with no coursework has no coursework line', async ({ page }) => {
  await page.goto('/?tool=CUDA');
  await expect(page.locator('#skills .cwline')).toBeHidden();
});

test('a long list shows the first three, and "N more" opens the rest', async ({ page }) => {
  await page.goto('/?tool=C');
  const line = page.locator('#skills .usedline');
  await expect(line.locator('a')).toHaveCount(3);
  const more = line.locator('button.morelinks');
  const total = Number((await page.locator('#skills .chip[data-tool="C"] .ct').innerText()).match(/\d+/)![0]);
  await expect(more).toHaveText(`${total - 3} more`);
  await more.click();
  await expect(line.locator('a')).toHaveCount(total);
  await expect(line.locator('button.morelinks')).toHaveCount(0);
});

test('Show all reveals every chip, Show fewer folds them back', async ({ page }) => {
  await page.goto('/');
  const more = page.locator('#skills .more');
  const n = await page.locator('#skills .chip').count();
  expect(n).toBeGreaterThan(14);
  await expect(more).toHaveText(`Show all ${n}`);
  await more.click();
  await expect(page.locator('#skills .chip:visible')).toHaveCount(n);
  await expect(more).toHaveText('Show fewer');
  await more.click();
  await expect(page.locator('#skills .chip:visible')).toHaveCount(14);
});

test('?tool= preselects a chip, even one past the first 14', async ({ page }) => {
  await page.goto('/?tool=MATLAB');
  const chip = page.locator('#skills .chip[data-tool="MATLAB"]');
  await expect(chip).toBeVisible();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/?tool=CUDA');
  await expect(page.locator('#skills .chip[data-tool="CUDA"]')).toHaveAttribute('aria-pressed', 'true');
});

test('the used-in line is set apart by space, not a border', async ({ page }) => {
  await page.goto('/');
  const border = await page.locator('#skills .usedline').evaluate((e) => parseFloat(getComputedStyle(e).borderTopWidth));
  expect(border).toBe(0);
});

test('without JS every chip is visible', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/');
  await expect(page.locator('#skills .chip:visible')).toHaveCount(await page.locator('#skills .chip').count());
  await ctx.close();
});

test('contact: email, then GitHub, LinkedIn and Older portfolio, no lab link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact .mail span')).toHaveText(EMAIL);
  await expect(page.locator('#contact .clink b')).toHaveText(['GitHub', 'LinkedIn', 'Older portfolio']);
  await expect(page.locator('#contact a[href*="fpga.njason.dev"]')).toHaveCount(0);
});

test('Copy puts the email on the clipboard', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t: string) => { (window as any).__copied = t; return Promise.resolve(); } } });
  });
  await page.goto('/');
  await page.locator('#contact .copy').click();
  await expect.poll(() => page.evaluate(() => (window as any).__copied)).toBe(EMAIL);
  await expect(page.locator('#contact .copy')).toHaveText('Copied');
});

test('if the clipboard is refused, Copy selects the email instead', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } });
  });
  await page.goto('/');
  await page.locator('#contact .copy').click();
  await expect.poll(() => page.evaluate(() => getSelection()!.toString())).toBe(EMAIL);
});
