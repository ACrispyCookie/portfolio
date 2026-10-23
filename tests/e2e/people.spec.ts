import { expect, test } from '@playwright/test';

// People I build with (Jason, 2026-10-23): in place of Other projects, derived from the projects' teams.

test('the section replaces Other projects, with its lead', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#other')).toHaveCount(0);
  await expect(page.locator('#people h2')).toHaveText('People I build with');
  await expect(page.locator('#people > .lead')).toHaveText('The teammates I keep building with, and what we made together.');
  const ids = await page.locator('main > section').evaluateAll((ss) => ss.map((s) => s.id).filter(Boolean));
  expect(ids).toEqual(['glance', 'projects', 'timeline', 'skills', 'people', 'contact']); // the closing credits before Contact (Jason, 2026-10-23)
});

test('people by projects shared: the regulars large, the rest small', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('#people .person .name').allTextContents()).toEqual(['Panagiotis Nikolaos Tsogkas', 'Dimitrios Tsiantos', 'Tvangos', 'Panagiotis Balamotis', 'Anastasios Kalousis']);
  expect(await page.locator('#people .person').evaluateAll((ps) => ps.map((p) => p.classList.contains('regular')))).toEqual([true, true, false, false, false]);
  const tsogkas = page.locator('#people .person').first();
  await expect(tsogkas.locator('.count b')).toHaveText('17');
  await expect(tsogkas.locator('.courses')).toHaveText('Together in 8 courses: ECE318, ECE321, ECE338, ECE340, ECE415, ECE433, ECE455, ECE494');
  await expect(tsogkas.locator('a.tag').first()).toHaveAttribute('href', '/courses/ece338/gpgpu');
  await expect(tsogkas.locator('a.tag', { hasText: 'GPGPU v2' })).toHaveAttribute('href', '/projects/gpgpu-v2');
});

test('each person links to their site or GitHub, and the one-course people show that course', async ({ page }) => {
  await page.goto('/');
  const tsiantos = page.locator('#people .person', { hasText: 'Dimitrios Tsiantos' });
  expect(await tsiantos.locator('.where a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(['https://tsiantosd.tech', 'https://www.linkedin.com/in/tsiantosd/', 'https://github.com/TsiantosD']);
  await expect(tsiantos.locator('.where a').nth(1)).toHaveText('LinkedIn');
  // LinkedIn only where the person agreed to it (Jason, 2026-10-23)
  const tsogkas = page.locator('#people .person', { hasText: 'Panagiotis Nikolaos Tsogkas' });
  expect(await tsogkas.locator('.where a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(['https://www.linkedin.com/in/panagiotis-nikolaos-tsogkas-650871293/', 'https://github.com/PANAGIVTHS']);
  const tvangos = page.locator('#people .person', { hasText: 'Tvangos' });
  await expect(tvangos.locator('.where a')).toHaveAttribute('href', 'https://github.com/Tvangos');
  await expect(tvangos.locator('.count b')).toHaveText('4');
  await expect(tvangos.locator('a.tag')).toHaveText('ECE321 User-level threads', { useInnerText: true });
  await expect(page.locator('#people .person', { hasText: 'Anastasios Kalousis' }).locator('.count span')).toHaveText('project'); // one, singular
});

test('it ends with the way to every project', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#people a').last()).toHaveAttribute('href', '/projects');
});

test('no middle-dot meta strings anywhere (spec §11), on home and on /projects', async ({ page }) => {
  for (const path of ['/', '/projects']) {
    await page.goto(path);
    expect(await page.locator('body').evaluate((b) => b.textContent!.includes('·')), path).toBe(false);
  }
});
