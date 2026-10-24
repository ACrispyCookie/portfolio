import { describe, expect, test } from 'vitest';
import { courseHref, pageHref } from '../../src/lib/links';

describe('pageHref and courseHref (Plan 2)', () => {
  test('personal projects have their own page, the lab included', () => {
    expect(pageHref({ id: 'live-fpga-lab', kind: 'personal', main: true })).toBe('/projects/live-fpga-lab');
  });
  test('main course projects have a page under their course; the rest are course sections', () => {
    expect(pageHref({ id: 'nbody', kind: 'course', course: 'ece415', main: true })).toBe('/courses/ece415/nbody');
    expect(pageHref({ id: 'sobel', kind: 'course', course: 'ece415', main: false })).toBe('/courses/ece415#sobel');
  });
  // Jason, 2026-10-24: a main project's card, grade row or skill link opens its own page, never its course section
  test('every link to a main course project is its own page', () => {
    for (const id of ['gpgpu', 'nbody', 'rambo', 'wifi', 'house', 'runtime', 'threads']) expect(pageHref({ id, kind: 'course', course: 'ecex', main: true })).toBe(`/courses/ecex/${id}`);
  });
  test('courseHref', () => {
    expect(courseHref('ece333')).toBe('/courses/ece333');
  });
});
