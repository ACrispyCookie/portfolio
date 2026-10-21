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
      body: `retry: 60000\nevent: board\ndata: ${JSON.stringify(data)}\n\n`,
    }),
  );
}
