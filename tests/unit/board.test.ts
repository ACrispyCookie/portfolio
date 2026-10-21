import { describe, expect, test } from 'vitest';
import { toWidgetView, type BoardEvent } from '../../src/lib/board';

const online: BoardEvent = {
  online: true, name: 'Smart Zynq SL', fpga: 'xc7z020', status: 'running', mode: 'demo',
  temperature_c: 47, healthy: true, faults: [], active_demo: 'GPGPU n-body', queue_length: 1, demos: [], updated_at: '2026-10-20T20:00:00Z',
};

describe('toWidgetView: one message per state (Jason, 2026-10-21)', () => {
  test('no data and no connection is offline, with nothing invented', () => {
    expect(toWidgetView(null, false)).toEqual({ status: 'offline', label: '', headline: 'Status unavailable', sub: '', queue: null, tempC: null });
  });

  test('a running demo is the only state labelled "Running now"', () => {
    expect(toWidgetView(online, true)).toEqual({ status: 'running', label: 'Running now', headline: 'GPGPU n-body', sub: 'on the Smart Zynq SL', queue: 1, tempC: 47 });
  });

  test('an active demo id is shown by its name from the demo list', () => {
    const v = toWidgetView({ ...online, active_demo: 'gpgpu-nbody', demos: [{ id: 'gpgpu-nbody', name: 'GPGPU n-body' }] }, true);
    expect(v.headline).toBe('GPGPU n-body');
  });

  test('online with no demo is free to use, its own message, not "Running now: Idle"', () => {
    expect(toWidgetView({ ...online, active_demo: null }, true)).toMatchObject({ status: 'available', label: '', headline: 'Free to use', sub: 'No demo running on the Smart Zynq SL' });
  });

  test('project mode is its own message', () => {
    expect(toWidgetView({ ...online, mode: 'project' }, true)).toMatchObject({ status: 'testing', label: '', headline: 'In use for GPGPU testing', sub: 'on the Smart Zynq SL' });
  });

  test('an unhealthy board or listed faults is a fault', () => {
    for (const e of [{ ...online, healthy: false }, { ...online, faults: ['thermal'] }]) {
      expect(toWidgetView(e, true)).toMatchObject({ status: 'fault', label: '', headline: 'Board fault' });
    }
  });

  test('missing temperature and queue stay null', () => {
    const v = toWidgetView({ ...online, temperature_c: null, queue_length: null }, true);
    expect(v.tempC).toBeNull();
    expect(v.queue).toBeNull();
  });

  test('a lost connection makes the last event offline', () => {
    expect(toWidgetView(online, false).status).toBe('offline');
  });

  test('the board reporting offline is offline', () => {
    expect(toWidgetView({ ...online, online: false, status: 'offline' }, true).status).toBe('offline');
  });

  test('a missing name leaves the board out of the sub line rather than guessing', () => {
    expect(toWidgetView({ ...online, name: undefined }, true).sub).toBe('');
    expect(toWidgetView({ ...online, name: undefined, active_demo: null }, true).sub).toBe('No demo running');
  });

  test('odd demo lists and non-string fields never throw or print nonsense', () => {
    const odd = (patch: object) => toWidgetView({ ...online, active_demo: 'nbody', ...patch } as never, true);
    for (const demos of [null, {}, 7, 'x']) expect(odd({ demos }).headline, String(demos)).toBe('nbody');
    expect(odd({ name: {} }).sub).toBe('');
    expect(odd({ active_demo: 42 }).status).toBe('available');
  });
});
