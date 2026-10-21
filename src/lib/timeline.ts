// Timeline geometry (spec §5.1 item 6): months counted back from now, with the quiet 06/2023–08/2025 stretch
// shortened to a few months behind a plain break.
export type Lane = 'education' | 'work' | 'teaching';
export interface TimelineEntry { lane: string; title: string; sub: string; from: string; to: string; href?: string }
export interface Gap { from: number; to: number; keep: number }

const parse = (d: string) => { const [m, y] = d.split('/').map(Number); return y * 12 + m - 1; };

/** Months from `date` back to `now` ('MM/YYYY'; 'now' is 0). */
export function monthsBefore(date: string, now: string): number {
  return date === 'now' ? 0 : parse(now) - parse(date);
}

/** Piecewise linear: identity up to `from`, the gap squeezed to `keep` months, then shifted. */
export function compress(m: number, gap: Gap = { from: 15, to: 40, keep: 4 }): number {
  if (m <= gap.from) return m;
  if (m >= gap.to) return m - (gap.to - gap.from) + gap.keep;
  return gap.from + ((m - gap.from) * gap.keep) / (gap.to - gap.from);
}

/** The quiet stretch: from the start of 08/2025 back to the end of 06/2023. */
export function quietGap(now: string): Gap {
  return { from: monthsBefore('08/2025', now) + 1, to: monthsBefore('06/2023', now), keep: 4 };
}

export function layoutTimeline(entries: TimelineEntry[], now: string) {
  const g = quietGap(now);
  const c = (m: number) => Math.round(compress(m, g) * 100) / 100;
  // a month occupies [monthsBefore, monthsBefore + 1): an entry runs from the top of its last month to the bottom of its first
  const events = entries.map((e) => {
    const top = c(monthsBefore(e.to, now));
    return { ...e, lane: e.lane as Lane, top, span: Math.round((c(monthsBefore(e.from, now) + 1) - top) * 100) / 100 };
  });
  const months = Math.max(...events.map((e) => e.top + e.span));
  // the break is drawn in the middle of the kept months, clear of the entries on either side
  const gap = { top: g.from + g.keep * 0.35, span: g.keep * 0.65 };
  const years: { label: string; top: number }[] = [];
  for (let y = Number(now.split('/')[1]); ; y--) {
    const top = c(monthsBefore(`01/${y}`, now));
    if (top >= months) break;
    if (!(top >= gap.top && top <= gap.top + gap.span)) years.push({ label: String(y), top });
  }
  return { months, events, years, gap };
}

type Rail = 'n' | 'a' | 'off';
const LANES: Lane[] = ['education', 'work', 'teaching'];
const end = (d: string) => (d === 'now' ? Infinity : parse(d));

/** Phone rails, newest first: each lane is the row's node, active (an entry spans the row's start) or off. */
export function railRows(entries: TimelineEntry[]) {
  return [...entries]
    .sort((a, b) => parse(b.from) - parse(a.from))
    .map((e) => {
      const at = parse(e.from);
      const rails = Object.fromEntries(
        LANES.map((l) => [l, l === e.lane ? 'n' : entries.some((o) => o.lane === l && parse(o.from) <= at && at <= end(o.to)) ? 'a' : 'off']),
      ) as Record<Lane, Rail>;
      return { ...e, lane: e.lane as Lane, rails };
    });
}
