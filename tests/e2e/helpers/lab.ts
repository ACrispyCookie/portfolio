// Mocks for the public lab endpoints (spec §7.2).
import type { Page } from '@playwright/test';

export const STREAM = 'https://fpga.njason.dev/api/public/board/stream';
export const JSON_URL = 'https://fpga.njason.dev/api/public/board';
export const event = (over: Record<string, unknown> = {}) => ({
  online: true, name: 'Smart Zynq SL', fpga: 'xc7z020', status: 'running', mode: 'demo', temperature_c: 47,
  healthy: true, faults: [], active_demo: 'gpgpu-nbody', queue_length: 1,
  demos: [{ id: 'gpgpu-nbody', name: 'GPGPU n-body' }, { id: 'dvd', name: 'DVD logo' }], updated_at: '2026-10-20T20:00:00Z', ...over,
});

export async function serveStream(page: Page, data: Record<string, unknown>) {
  await page.route(STREAM, (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-cache' },
      // reconnect every few seconds and say it again, like the real lab: a stream silent past the 20s staleness limit
      // reads as offline, which a slow test run would otherwise hit
      body: `retry: 3000\nevent: board\ndata: ${JSON.stringify(data)}\n\n`,
    }),
  );
  // and the JSON snapshot the page falls back to when the stream errors before its first event, as the real lab does
  await page.route(JSON_URL, (route) =>
    route.fulfill({ status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(data) }),
  );
}
