// Timeline lanes need room (spec §5.1 item 6). If any two entries in a lane would overlap, show the rails instead.
// Measuring beats a guessed breakpoint: it holds at any width, font size or zoom, and as entries are added.

function crowded(tl: HTMLElement): boolean {
  return [...tl.querySelectorAll('.lane')].some((lane) => {
    const r = [...lane.querySelectorAll('.ev > div')].map((d) => d.getBoundingClientRect()).sort((a, b) => a.top - b.top);
    return r.slice(1).some((b, i) => b.top < r[i].bottom - 0.5); // touching is fine (the approved desktop), overlapping is not
  });
}

export function initTimeline(tl: HTMLElement): void {
  let lastWidth = -1;
  const check = () => {
    tl.classList.remove('rails');
    const lanes = tl.querySelector<HTMLElement>('.tlw')!;
    if (getComputedStyle(lanes).display !== 'none') tl.classList.toggle('rails', crowded(tl));
  };
  // width only: switching layouts changes the height, which must not trigger another check
  new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width);
    if (w !== lastWidth) { lastWidth = w; check(); }
  }).observe(tl);
  document.fonts?.ready.then(check);
}

const tl = document.querySelector<HTMLElement>('#timeline');
if (tl) initTimeline(tl);
