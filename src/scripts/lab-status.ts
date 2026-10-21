// The lab's live status, on every page (spec §7.2; Jason, 2026-10-21: it updates without a reload, wherever you are).
// One stream while the tab is visible, closed while it's hidden; a polled JSON snapshot if the stream can't be used.
// Every status is published to the page: <html data-lab> colours the status dots, `lab:status` carries the full view
// (the home widget draws it) and `board:status` tells the trace whether the board is powered.
import { toWidgetView, type BoardEvent, type WidgetView } from '../lib/board';

const ORIGIN = 'https://fpga.njason.dev';
const STALE_MS = 20_000; // events arrive about every 2 s; silence this long means the stream is gone
const POLL_MS = 5_000; // without the stream, the JSON snapshot is refreshed this often

declare global {
  interface Window { __lab?: WidgetView }
}

function publish(v: WidgetView) {
  window.__lab = v; // for a listener that starts late
  document.documentElement.dataset.lab = v.status;
  document.dispatchEvent(new CustomEvent<WidgetView>('lab:status', { detail: v }));
  // the trace's current flows while the board is on, whatever it's doing
  document.dispatchEvent(new CustomEvent('board:status', { detail: { online: v.status !== 'offline' && v.status !== 'fault' } }));
}

export function connectLab(): void {
  let source: EventSource | null = null;
  let last: BoardEvent | null = null;
  let gotEvent = false;
  let stale: number | undefined;
  let poll: number | undefined;
  let active = false; // the tab is visible; polling stops when it isn't, even mid-request

  const show = (connected: boolean) => publish(toWidgetView(last, connected));
  const armStale = () => {
    clearTimeout(stale);
    stale = window.setTimeout(() => show(false), STALE_MS);
  };

  // Fallback when the stream can't be used: poll the JSON snapshot, so a snapshot is never presented as live for
  // longer than the staleness limit.
  async function fetchOnce() {
    try {
      const res = await fetch(`${ORIGIN}/api/public/board`, { credentials: 'omit' });
      if (!res.ok) throw new Error(String(res.status));
      last = (await res.json()) as BoardEvent;
      show(true);
      armStale();
    } catch {
      show(false);
    }
    if (active) poll = window.setTimeout(fetchOnce, POLL_MS);
  }

  function open() {
    active = true;
    if (source || typeof EventSource === 'undefined') {
      if (!source) void fetchOnce();
      return;
    }
    gotEvent = false;
    source = new EventSource(`${ORIGIN}/api/public/board/stream`);
    armStale(); // a stream that opens but never sends must still give up
    source.addEventListener('board', (e) => {
      try {
        last = JSON.parse((e as MessageEvent<string>).data) as BoardEvent;
      } catch {
        return;
      }
      gotEvent = true;
      show(true);
      armStale();
    });
    source.addEventListener('error', () => {
      if (!gotEvent) {
        close();
        active = true; // still visible: only the stream failed
        void fetchOnce();
      } else if (source?.readyState === EventSource.CLOSED) {
        show(false);
      }
    });
  }

  function close() {
    active = false;
    source?.close();
    source = null;
    clearTimeout(stale);
    clearTimeout(poll);
    poll = undefined;
  }

  const follow = () => (document.visibilityState === 'hidden' ? close() : open());
  document.addEventListener('visibilitychange', follow);
  follow();
}

connectLab();
