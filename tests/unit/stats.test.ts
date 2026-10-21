import { describe, expect, test } from 'vitest';
import { getGlanceStats } from '../../src/lib/stats';
import { loadContent } from './helpers/content';

describe('getGlanceStats', () => {
  test('real collections give the numbers Jason approved', async () => {
    const { projects, courses } = await loadContent();
    const projectCourses = [...new Set(projects.map((p) => p.course).filter((c): c is string => !!c))];
    expect(getGlanceStats(projects, courses, projectCourses)).toEqual({ total: 29, main: 10, smaller: 19, highGrades: 8 });
  });

  test('empty input gives zeros', () => {
    expect(getGlanceStats([], [], [])).toEqual({ total: 0, main: 0, smaller: 0, highGrades: 0 });
  });

  test('a 9.5 course without a project on the site does not count', () => {
    expect(getGlanceStats([], [{ code: 'ECE999', grade: 10 }], [])).toEqual({ total: 0, main: 0, smaller: 0, highGrades: 0 });
  });
});
