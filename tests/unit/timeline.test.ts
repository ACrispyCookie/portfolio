import { describe, expect, test } from 'vitest';
import { compress, layoutTimeline, monthsBefore, railRows } from '../../src/lib/timeline';
import timeline from '../../src/data/timeline.json';

describe('monthsBefore', () => {
  test('MM/YYYY and now count back from now', () => {
    expect(monthsBefore('now', '10/2026')).toBe(0);
    expect(monthsBefore('10/2026', '10/2026')).toBe(0);
    expect(monthsBefore('07/2025', '10/2026')).toBe(15);
    expect(monthsBefore('06/2023', '10/2026')).toBe(40);
  });
});

describe('compress', () => {
  test('identity before the gap, shortened inside and after it', () => {
    expect(compress(10)).toBe(10);
    expect(compress(50)).toBe(29);
    expect(compress(27.5)).toBe(17);
  });
});

describe('layoutTimeline (real data, now = 10/2026)', () => {
  const t = layoutTimeline(timeline, '10/2026');
  test('65 months tall, no 2024 label, gap inside 06/2023–08/2025', () => {
    expect(t.months).toBe(65);
    expect(t.years.map((y) => y.label)).not.toContain('2024');
    expect(t.years.map((y) => y.label)).toEqual(['2026', '2025', '2023', '2022', '2021', '2020']);
    expect(t.gap.top).toBeGreaterThanOrEqual(compress(15));
    expect(t.gap.top + t.gap.span).toBeLessThanOrEqual(compress(40));
  });
  test('events: ECE from now down to 09/2022, ColonyMC as in the mock', () => {
    const ece = t.events.find((e) => e.title === 'Electrical and Computer Engineering')!;
    expect([ece.top, ece.span]).toEqual([0, 29]);
    const colony = t.events.find((e) => e.title === 'ColonyMC')!;
    expect([colony.top, colony.span]).toEqual([45, 17]);
  });
  test('no entry starts or ends inside the break (ongoing bars pass through it)', () => {
    const inside = (y: number) => y > t.gap.top && y < t.gap.top + t.gap.span;
    for (const e of t.events) expect(inside(e.top) || inside(e.top + e.span), e.title).toBe(false);
  });
});

describe('railRows (phone)', () => {
  test('newest first; each rail is node, active or off at that row', () => {
    const rows = railRows(timeline);
    expect(rows.map((r) => r.title)).toEqual([
      'Programming I, Computer Organization', 'Programming II, Numerical Analysis', 'Programming I',
      'Electrical and Computer Engineering', 'Freelance Minecraft plugin developer', 'Freelance Minecraft plugin developer', 'ColonyMC', 'High school',
    ]);
    expect(rows[0].rails).toEqual({ education: 'a', work: 'off', teaching: 'n' });
    expect(rows[3].rails).toEqual({ education: 'n', work: 'a', teaching: 'off' });
    expect(rows[5].rails).toEqual({ education: 'a', work: 'n', teaching: 'off' });
  });
});
