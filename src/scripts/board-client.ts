// Connects the hero widget to the public board stream (spec §7.2).
// Opens the stream only while the widget is on screen; falls back to one JSON fetch if the stream fails first.
import { toWidgetView, type BoardEvent, type WidgetView } from '../lib/board';

const ORIGIN = 'https://fpga.njason.dev';
const STALE_MS = 20_000; // events arrive about every 2 s; silence this long means the stream is gone

function render(root: HTMLElement, v: WidgetView) {
  const f = (name: string) => root.querySelector<HTMLElement>(`[data-f="${name}"]`);
  root.dataset.state = v.state;
  f('running')!.textContent = v.running;
  f('sub')!.textContent = v.sub;
  f('sub')!.hidden = !v.sub;
  f('queue')!.textContent = v.queue === null ? '' : String(v.queue);
  f('queue-tag')!.hidden = v.queue === null;
  f('temp')!.textContent = v.tempC === null ? '' : `${Math.round(v.tempC)} °C`;
  f('temp-tag')!.hidden = v.tempC === null;
  document.dispatchEvent(new CustomEvent('board:status', { detail: { online: v.state === 'online' || v.state === 'project' } }));
}

export function connectBoard(root: HTMLElement): void {
  let source: EventSource | null = null;
  let last: BoardEvent | null = null;
  let gotEvent = false;
  let stale: number | undefined;

  const show = (connected: boolean) => render(root, toWidgetView(last, connected));
  const armStale = () => {
    clearTimeout(stale);
    stale = window.setTimeout(() => show(false), STALE_MS);
  };

  async function fetchOnce() {
    try {
      const res = await fetch(`${ORIGIN}/api/public/board`, { credentials: 'omit' });
      if (!res.ok) throw new Error(String(res.status));
      last = (await res.json()) as BoardEvent;
      show(true);
    } catch {
      show(false);
    }
  }

  function open() {
    if (source || typeof EventSource === 'undefined') {
      if (!source) void fetchOnce();
      return;
    }
    source = new EventSource(`${ORIGIN}/api/public/board/stream`);
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
        void fetchOnce();
      } else if (source?.readyState === EventSource.CLOSED) {
        show(false);
      }
    });
  }

  function close() {
    source?.close();
    source = null;
    clearTimeout(stale);
  }

  // One callback can carry several entries for the same element (e.g. "out" then "in" after the photo loads); the last one is current.
  new IntersectionObserver((entries) => (entries[entries.length - 1].isIntersecting ? open() : close())).observe(root);
}

const root = document.querySelector<HTMLElement>('.hero .board');
if (root) connectBoard(root);
