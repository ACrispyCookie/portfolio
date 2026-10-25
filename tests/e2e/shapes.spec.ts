import { expect, test } from '@playwright/test';
import { inspect, type Finding } from './helpers/shapes';

// Every main page at every window shape, not only the devices someone thought of (Jason, 2026-10-25: a split screen on
// a Pixel 6 Pro broke pictures, pills and labels; "I want it to work fluidly"). Widths 200–2560 (by 40px from 280), heights
// 300–1400, with and without touch, reduced motion so reveals don't move things. Nothing may overlap, clip, shrink
// below 13px, break a pill or button whose row has room, set a heading one word a line, crop a picture past 60%,
// or scroll the page sideways (helpers/shapes.ts).

const PAGES = ['/', '/projects', '/courses/ece338/gpgpu', '/courses/ece415/nbody', '/courses/ece455/rambo', '/courses/ece433/house',
  '/courses/ece436/wifi', '/courses/ece348/runtime', '/courses/ece321/threads', '/projects/live-fpga-lab', '/projects/dvd-logo-fpga',
  '/projects/homelab', '/projects/gpgpu-v2'];
const WIDTHS = [200, 240, ...Array.from({ length: 30 }, (_, i) => 280 + i * 40), 1600, 1920, 2560]; // down to a narrow split screen
const HEIGHTS = [300, 360, 420, 520, 660, 800, 1000, 1400];

// RAMBO's photo is portrait, so a landscape card or thumbnail shows under half of it: Jason (2026-10-25) keeps the crop
const KNOWN = (f: Finding) => f.kind === 'picture cropped' && /rambo|ECE455/i.test(f.what);

for (const url of PAGES) {
  test(`${url}: nothing breaks at any window shape, touch or not`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'desktop', 'one sweep is enough; it makes its own touch and non-touch windows');
    test.setTimeout(900_000); // ~2 min alone, much longer while the gate runs everything at once
    const found = new Map<string, string[]>();
    for (const touch of [true, false]) {
      const ctx = await browser.newContext({ reducedMotion: 'reduce', hasTouch: touch, isMobile: touch, viewport: { width: 400, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(url);
      for (const h of HEIGHTS) for (const w of WIDTHS) {
        if (touch && w > 1100) continue; // touch windows up to tablet size; wider ones are the desktop pass
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(60); // a timed settle: headless Chrome may never deliver an animation frame
        // the name on the first screen beats the photo: on a window too short for both, the home photo may be trimmed
        const nameFirst = (f: Finding) => f.kind === 'picture cropped' && f.what.includes('div.cover') && h < 560;
        for (const f of (await page.evaluate(inspect)).filter((x) => !KNOWN(x) && !nameFirst(x))) {
          const k = `${f.kind}: ${f.what} (${f.detail})`;
          found.set(k, [...(found.get(k) ?? []), `${w}×${h}${touch ? ' touch' : ''}`]);
        }
      }
      await ctx.close();
    }
    expect([...found].map(([k, at]) => `${k} at ${at.slice(0, 3).join(', ')}${at.length > 3 ? ` and ${at.length - 3} more` : ''}`)).toEqual([]);
  });
}
