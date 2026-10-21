import { describe, expect, test } from 'vitest';
import { buildTracePath } from '../../src/lib/trace-path';

describe('buildTracePath', () => {
  const r = buildTracePath({ railX: 18.5, start: { x: 300, y: 700 }, turnY: 726, pads: [800, 1200] });

  test('starts at the start point, bends twice, ends at the last pad', () => {
    expect(r.d.startsWith('M300 700')).toBe(true);
    expect(r.d.match(/Q/g)).toHaveLength(2);
    expect(r.d.endsWith('V1200')).toBe(true);
  });

  test('bends use a 16px radius', () => {
    expect(r.d).toContain('V710 Q300 726 284 726');
    expect(r.d).toContain('H34.5 Q18.5 726 18.5 742');
  });

  test('pads and two vias per pad beside the rail', () => {
    expect(r.padYs).toEqual([800, 1200]);
    expect(r.vias).toHaveLength(4);
    expect(r.vias[0]).toEqual({ x: 32.5, y: 778 });
    expect(r.vias[1]).toEqual({ x: 32.5, y: 822 });
  });

  test('no start element: a straight run from above the first pad', () => {
    const s = buildTracePath({ railX: 18.5, start: null, turnY: 0, pads: [800] });
    expect(s.d).toBe('M18.5 760 V800');
  });

  test('a start already on the rail runs straight down', () => {
    const s = buildTracePath({ railX: 11, start: { x: 20, y: 500 }, turnY: 526, pads: [700] });
    expect(s.d).toBe('M11 500 V700');
  });
});
