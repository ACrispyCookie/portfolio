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

/** The lab's status, shared by the widget and every status dot (Jason, 2026-10-21: one message per state). */
export type LabStatus = 'running' | 'available' | 'testing' | 'fault' | 'offline';

export interface WidgetView {
  status: LabStatus;
  label: string; // the small line above the headline: only a running demo has one
  headline: string;
  sub: string;
  queue: number | null;
  tempC: number | null;
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
  const none = { queue: null, tempC: null };
  if (!e || !connected || !e.online || e.status === 'offline') return { status: 'offline', label: '', headline: 'Status unavailable', sub: '', ...none };
  const name = str(e.name);
  const on = name ? `on the ${name}` : '';
  const base = { queue: num(e.queue_length), tempC: num(e.temperature_c) };
  if (e.healthy === false || (Array.isArray(e.faults) && e.faults.length > 0) || e.status === 'fault') {
    return { status: 'fault', label: '', headline: 'Board fault', sub: on, ...base };
  }
  if (e.mode === 'project') return { status: 'testing', label: '', headline: 'In use for GPGPU testing', sub: on, ...base };
  const demo = str(e.active_demo);
  if (!demo) return { status: 'available', label: '', headline: 'Free to use', sub: name ? `No demo running on the ${name}` : 'No demo running', ...base };
  return { status: 'running', label: 'Running now', headline: demoName(demo, e.demos), sub: on, ...base };
}
