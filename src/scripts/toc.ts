// Marks the section being read in every contents list (spec §5.2), always one: the first before the reader gets there,
// then the last section whose heading has passed the reading line under the top bar, the last one once read past
// (Jason, 2026-10-27: on a phone "What it is" should be marked even before it comes into view).
// the reading line: a quarter of the way down the screen, never closer to the top bar than 160px; lower, a short
// section counted as read while its heading still sat near the top (a tablet, 2026-10-27)
const readingLine = () => Math.max(160, innerHeight * 0.25);
const lists = [...document.querySelectorAll<HTMLElement>('nav.toc')].map((nav) => {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a')];
  const targets = links.map((a) => document.getElementById(a.hash.slice(1)));
  return { links, targets };
});

function mark(): void {
  const line = readingLine();
  for (const { links, targets } of lists) {
    let at = 0;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= line) at = i; });
    links.forEach((a, i) => (i === at ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }
}

// a few dozen heading positions per scroll event: cheap enough to read at once, no frame to wait for
if (lists.length) {
  mark();
  addEventListener('scroll', mark, { passive: true });
  addEventListener('resize', mark);
}
