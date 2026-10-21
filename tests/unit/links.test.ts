import { describe, expect, test } from 'vitest';
import { courseHref, pageHref, projectHref } from '../../src/lib/links';

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

describe('pageHref and courseHref (Plan 2)', () => {
  test('personal projects have their own page, the lab included', () => {
    expect(pageHref({ id: 'live-fpga-lab', kind: 'personal', main: true })).toBe('/projects/live-fpga-lab');
  });
  test('main course projects have a page under their course; the rest are course sections', () => {
    expect(pageHref({ id: 'nbody', kind: 'course', course: 'ece415', main: true })).toBe('/courses/ece415/nbody');
    expect(pageHref({ id: 'sobel', kind: 'course', course: 'ece415', main: false })).toBe('/courses/ece415#sobel');
  });
  test('courseHref', () => {
    expect(courseHref('ece333')).toBe('/courses/ece333');
  });
});
