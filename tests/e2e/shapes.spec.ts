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
const HEIGHTS = [230, 300, 360, 420, 520, 580, 660, 800, 1000, 1400]; // 580: short, yet taller than wide at 560 (Jason found 582×592); 230: cut very short (he found 450×230)

// RAMBO's photo is portrait, so a landscape card or thumbnail shows under half of it: Jason (2026-10-25) keeps the crop
const KNOWN = (f: Finding, url: string) => f.kind === 'picture cropped' && /rambo|ECE455/i.test(f.what)
  // the security pages stay as they are until their own plan (Jason, 2026-10-25): RAMBO's results table squeezes its
  // headings into narrow columns on the narrowest windows
  || f.kind === 'narrow text' && /#what-we-measured th/.test(f.what) && url.includes('ece455');

// one test per page and input, so each stays short enough to finish while the gate runs everything at once
for (const url of PAGES) for (const touch of [true, false]) {
  test(`${url}: nothing breaks at any window shape, ${touch ? 'touch' : 'mouse'}`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'desktop', 'one sweep is enough; it makes its own touch and non-touch windows');
    test.setTimeout(1_800_000); // ~1 min alone, several while the gate runs everything at once
    const found = new Map<string, string[]>();
    const ctx = await browser.newContext({ reducedMotion: 'reduce', hasTouch: touch, isMobile: touch, viewport: { width: 400, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(url);
    for (const h of HEIGHTS) for (const w of WIDTHS) {
      if (touch && w > 1100) continue; // touch windows up to tablet size; wider ones are the desktop pass
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(60); // a timed settle: headless Chrome may never deliver an animation frame
      // a page process starved by the rest of the suite can stop answering; reload and retry that shape once, so a stall
      // is named instead of eating the whole time limit (it took 30 minutes twice, 2026-10-26)
      const look = () => Promise.race([page.evaluate(inspect), new Promise<null>((done) => setTimeout(() => done(null), 20_000))]);
      let seen = await look();
      if (!seen) {
        console.log(`${url} ${w}×${h}${touch ? ' touch' : ''}: no answer in 20s, reloading`);
        await page.reload();
        await page.waitForTimeout(60);
        seen = await look();
      }
      if (!seen) { found.set(`page stopped answering`, [`${w}×${h}${touch ? ' touch' : ''}`]); break; }
      for (const f of seen.filter((x) => !KNOWN(x, url))) {
        const k = `${f.kind}: ${f.what} (${f.detail})`;
        found.set(k, [...(found.get(k) ?? []), `${w}×${h}${touch ? ' touch' : ''}`]);
      }
    }
    await ctx.close();
    expect([...found].map(([k, at]) => `${k} at ${at.slice(0, 3).join(', ')}${at.length > 3 ? ` and ${at.length - 3} more` : ''}`)).toEqual([]);
  });
}
