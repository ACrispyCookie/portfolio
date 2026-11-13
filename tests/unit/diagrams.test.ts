import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';

// a drawing's words are set at 12px or more in its own units: the tiny-text check reads the font size a drawing
// declares, not the size it is scaled to, and a drawing shrinks on a phone (Impeccable on ECE318, 2026-11-13)
const DIR = join(import.meta.dirname, '../../src/components/diagrams');

test('no drawing sets a font size under 12', () => {
  const small = readdirSync(DIR).filter((f) => f.endsWith('.astro')).flatMap((f) =>
    [...readFileSync(join(DIR, f), 'utf8').matchAll(/font-size="([\d.]+)"/g)].filter((m) => Number(m[1]) < 12).map((m) => `${f}: ${m[0]}`));
  expect(small).toEqual([]);
});
