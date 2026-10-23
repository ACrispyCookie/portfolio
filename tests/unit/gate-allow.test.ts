import { describe, expect, it } from 'vitest';
import { inspectAllow } from '../../scripts/gate-allow.mjs';

// Spec §11 allowed exceptions, applied by the gate with the inspector's own --allow flag.
describe('inspectAllow', () => {
  it('lets project pages show only their approved pictures (Jason, 2026-10-23)', () => {
    expect(inspectAllow('/courses/ece338/gpgpu')).toEqual(['few-pictures']);
    expect(inspectAllow('/projects/homelab')).toEqual(['few-pictures']);
  });
  it('keeps the rule on every other page', () => {
    for (const page of ['/', '/projects', '/projects/', '/courses/ece338', '/404']) expect(inspectAllow(page)).toEqual([]);
  });
});
