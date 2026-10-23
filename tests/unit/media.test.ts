import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';

// Read from the file itself: WebKit in the test browsers can't decode H.264, so a page can't report it everywhere.
const width = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width', '-of', 'csv=p=0', f]).toString().trim());

test('the DVD video is sharp on a 2x screen: twice the width of its largest box, about 720px (Jason, 2026-10-23: pixelated)', () => {
  expect(width('public/media/dvd.mp4')).toBeGreaterThanOrEqual(1440);
});
