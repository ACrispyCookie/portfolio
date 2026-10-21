import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { loadContent } from './helpers/content';

const ROOT = join(import.meta.dirname, '../..');

test('the Wi-Fi chart is the cropped mock file (driver-settings caption removed)', async () => {
  const { projects } = await loadContent();
  const wifi = projects.find((p) => p.id === 'wifi') as unknown as { media: { src: string; paper?: boolean } };
  const src = join(ROOT, 'src/content/projects', wifi.media.src);
  expect(readFileSync(src).equals(readFileSync(join(ROOT, 'docs/superpowers/mocks/styled/wifi.jpg')))).toBe(true);
  expect(wifi.media.paper).toBe(true);
});
