// Turns the public board stream (fpga.njason.dev /api/public/board) into what the widget shows.
// Never invents a value: anything missing is null or empty (spec §7.2).

export interface BoardEvent {
  online: boolean;
  name?: string;
  fpga?: string;
  status?: string;
  mode?: string;
  temperature_c?: number | null;
  healthy?: boolean;
  faults?: unknown;
  active_demo?: string | null;
  queue_length?: number | null;
  demos?: unknown[];
  updated_at?: string;
}

export interface WidgetView {
  state: 'online' | 'project' | 'fault' | 'offline';
  running: string;
  sub: string;
  queue: number | null;
  tempC: number | null;
  ledBreathing: boolean;
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === 'string' && v ? v : null);

function demoName(id: string, demos: unknown): string {
  if (!Array.isArray(demos)) return id; // odd data must not throw
  for (const d of demos) {
    if (d && typeof d === 'object' && (d as { id?: unknown }).id === id && typeof (d as { name?: unknown }).name === 'string') {
      return (d as { name: string }).name;
    }
  }
  return id;
}

export function toWidgetView(e: BoardEvent | null, connected: boolean): WidgetView {
  if (!e || !connected || !e.online || e.status === 'offline') {
    return { state: 'offline', running: 'Status unavailable', sub: '', queue: null, tempC: null, ledBreathing: false };
  }
  const name = str(e.name);
  const base = { sub: name ? `on the ${name}` : '', queue: num(e.queue_length), tempC: num(e.temperature_c) };
  if (e.healthy === false || (Array.isArray(e.faults) && e.faults.length > 0) || e.status === 'fault') {
    return { state: 'fault', running: 'Board fault', ...base, ledBreathing: false };
  }
  if (e.mode === 'project') return { state: 'project', running: 'In use for GPGPU testing', ...base, ledBreathing: true };
  const demo = str(e.active_demo);
  const running = demo ? demoName(demo, e.demos) : 'Idle';
  return { state: 'online', running, ...base, ledBreathing: true };
}
