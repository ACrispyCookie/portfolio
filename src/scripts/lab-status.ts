// Every page: one request for the lab's status, so the status dots show it (Jason, 2026-10-21). On home the widget's
// live stream (board-client.ts) takes over; this only fills in when nothing has set a status yet.
import { toWidgetView, type BoardEvent } from '../lib/board';

const ORIGIN = 'https://fpga.njason.dev';

export async function loadLabStatus(): Promise<void> {
  try {
    const res = await fetch(`${ORIGIN}/api/public/board`, { credentials: 'omit' });
    if (!res.ok) return;
    const v = toWidgetView((await res.json()) as BoardEvent, true);
    if (!document.documentElement.dataset.lab) document.documentElement.dataset.lab = v.status;
  } catch {
    // unreachable: the dots stay grey, which is the honest "unknown"
  }
}

void loadLabStatus();
