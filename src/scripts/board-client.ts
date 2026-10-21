// Connects the hero widget to the public board stream (spec §7.2).
// Opens the stream only while the widget is on screen; falls back to one JSON fetch if the stream fails first.
import { toWidgetView, type BoardEvent, type WidgetView } from '../lib/board';

const ORIGIN = 'https://fpga.njason.dev';
const STALE_MS = 20_000; // events arrive about every 2 s; silence this long means the stream is gone
const POLL_MS = 5_000; // without the stream, the JSON snapshot is refreshed this often while on screen

function render(root: HTMLElement, v: WidgetView) {
  const f = (name: string) => root.querySelector<HTMLElement>(`[data-f="${name}"]`);
  root.dataset.state = v.status;
  document.documentElement.dataset.lab = v.status; // every status dot on the page follows this
  f('label')!.textContent = v.label;
  f('headline')!.textContent = v.headline;
  f('sub')!.textContent = v.sub; // an empty sub collapses; .running's min-height keeps the widget one height
  f('queue')!.textContent = v.queue === null ? '' : String(v.queue);
  f('queue-tag')!.hidden = v.queue === null;
  f('temp')!.textContent = v.tempC === null ? '' : `${Math.round(v.tempC)} °C`;
  f('temp-tag')!.hidden = v.tempC === null;
  // the trace's current flows while the board is on, whatever it's doing
  document.dispatchEvent(new CustomEvent('board:status', { detail: { online: v.status !== 'offline' && v.status !== 'fault' } }));
}

export function connectBoard(root: HTMLElement): void {
  // Hold the live block's space from the start; it says plainly that nothing has been heard yet.
  root.dataset.state = 'connecting';
  root.querySelector<HTMLElement>('[data-f="headline"]')!.textContent = 'Checking the board…';
  let source: EventSource | null = null;
  let last: BoardEvent | null = null;
  let gotEvent = false;
  let stale: number | undefined;
  let poll: number | undefined;
  let visible = false; // polling stops when the widget leaves the screen, even mid-request

  const show = (connected: boolean) => render(root, toWidgetView(last, connected));
  const armStale = () => {
    clearTimeout(stale);
    stale = window.setTimeout(() => show(false), STALE_MS);
  };

  // Fallback when the stream can't be used: poll the JSON snapshot while on screen, so a snapshot is never
  // presented as live for longer than the staleness limit.
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
    if (visible) poll = window.setTimeout(fetchOnce, POLL_MS);
  }

  function open() {
    visible = true;
    if (source || typeof EventSource === 'undefined') {
      if (!source) void fetchOnce();
      return;
    }
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
        visible = true; // still on screen: only the stream failed
        void fetchOnce();
      } else if (source?.readyState === EventSource.CLOSED) {
        show(false);
      }
    });
  }

  function close() {
    visible = false;
    source?.close();
    source = null;
    clearTimeout(stale);
    clearTimeout(poll);
    poll = undefined;
  }

  // One callback can carry several entries for the same element (e.g. "out" then "in" after the photo loads); the last one is current.
  new IntersectionObserver((entries) => (entries[entries.length - 1].isIntersecting ? open() : close())).observe(root);
}

const root = document.querySelector<HTMLElement>('.hero .board');
if (root) connectBoard(root);
