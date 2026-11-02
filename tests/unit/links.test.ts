import { describe, expect, test } from 'vitest';
import { projectHref } from '../../src/lib/links';

describe('projectHref (plan Task 10 card rule)', () => {
  test('course projects go to their section on the course page', () => {
    expect(projectHref({ id: 'nbody', kind: 'course', course: 'ece415' })).toBe('/courses/ece415#nbody');
  });
  test('personal projects have their own page', () => {
    expect(projectHref({ id: 'homelab', kind: 'personal' })).toBe('/projects/homelab');
  });
  test('the Live FPGA Lab card goes to the lab itself', () => {
    expect(projectHref({ id: 'live-fpga-lab', kind: 'personal' })).toBe('https://fpga.njason.dev');
  });
});
