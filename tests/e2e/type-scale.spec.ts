import { expect, test } from '@playwright/test';

// Spec §6 and Plan 1's Global Constraints: five text sizes plus the display size, nothing under 13px.
// Every visible text run must use one of the tokens as they compute at this width.
test('every text size on the page is one of the scale tokens, and none is under 13px', async ({ page }) => {
  await page.goto('/');
  for (let y = 0; y < 20000; y += 600) await page.evaluate((y) => scrollTo(0, y), y);
  const r = await page.evaluate(() => {
    const probe = document.createElement('span');
    document.body.append(probe);
    const tokens = ['--text-display', '--text-title', '--text-lead', '--text-body', '--text-small'].map((t) => {
      probe.style.fontSize = `var(${t})`;
      return getComputedStyle(probe).fontSize;
    });
    probe.remove();
    const off = new Map<string, string>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement!;
      if (!n.textContent!.trim() || el.closest('script, style, svg, [hidden], .vh')) continue;
      const c = getComputedStyle(el);
      if (c.display === 'none' || c.visibility === 'hidden') continue;
      if (!tokens.includes(c.fontSize) || parseFloat(c.fontSize) < 13) off.set(c.fontSize, n.textContent!.trim().slice(0, 30));
    }
    return { tokens, off: [...off].map(([s, t]) => `${s} "${t}"`) };
  });
  expect(r.off, `allowed: ${r.tokens.join(', ')}`).toEqual([]);
});
