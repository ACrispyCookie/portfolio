import { describe, expect, test } from 'vitest';
import { toWidgetView, type BoardEvent } from '../../src/lib/board';

const online: BoardEvent = {
  online: true, name: 'Smart Zynq SL', fpga: 'xc7z020', status: 'running', mode: 'demo',
  temperature_c: 47, healthy: true, faults: [], active_demo: 'GPGPU n-body', queue_length: 1, demos: [], updated_at: '2026-10-20T20:00:00Z',
};

describe('toWidgetView', () => {
  test('no data and no connection is offline, with nothing invented', () => {
    expect(toWidgetView(null, false)).toEqual({ state: 'offline', running: 'Status unavailable', sub: '', queue: null, tempC: null, ledBreathing: false });
  });

  test('an online board running a demo', () => {
    expect(toWidgetView(online, true)).toEqual({ state: 'online', running: 'GPGPU n-body', sub: 'on the Smart Zynq SL', queue: 1, tempC: 47, ledBreathing: true });
  });

  test('an active demo id is shown by its name from the demo list', () => {
    const v = toWidgetView({ ...online, active_demo: 'gpgpu-nbody', demos: [{ id: 'gpgpu-nbody', name: 'GPGPU n-body' }] }, true);
    expect(v.running).toBe('GPGPU n-body');
  });

  test('online with no active demo is idle', () => {
    expect(toWidgetView({ ...online, active_demo: null }, true).running).toBe('Idle');
  });

  test('project mode shows the GPGPU testing wording', () => {
    const v = toWidgetView({ ...online, mode: 'project' }, true);
    expect(v.state).toBe('project');
    expect(v.running).toBe('In use for GPGPU testing');
  });

  test('an unhealthy board or listed faults is a fault, without a breathing LED', () => {
    for (const e of [{ ...online, healthy: false }, { ...online, faults: ['thermal'] }]) {
      const v = toWidgetView(e, true);
      expect(v.state).toBe('fault');
      expect(v.running).toBe('Board fault');
      expect(v.ledBreathing).toBe(false);
    }
  });

  test('missing temperature and queue stay null', () => {
    const v = toWidgetView({ ...online, temperature_c: null, queue_length: null }, true);
    expect(v.tempC).toBeNull();
    expect(v.queue).toBeNull();
  });

  test('a lost connection makes the last event offline', () => {
    expect(toWidgetView(online, false).state).toBe('offline');
  });

  test('the board reporting offline is offline', () => {
    expect(toWidgetView({ ...online, online: false, status: 'offline' }, true).state).toBe('offline');
  });

  test('a missing name leaves the sub line empty rather than guessing', () => {
    expect(toWidgetView({ ...online, name: undefined }, true).sub).toBe('');
  });
});
