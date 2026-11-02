export interface GlanceStats {
  total: number;
  main: number;
  smaller: number;
  highGrades: number;
}

/** At-a-glance numbers, computed from the collections so they stay true (spec §8). */
export function getGlanceStats(
  projects: { main: boolean }[],
  courses: { grade: number; code: string }[],
  projectCourses: string[],
): GlanceStats {
  const withProject = new Set(projectCourses.map((c) => c.toLowerCase()));
  const main = projects.filter((p) => p.main).length;
  return {
    total: projects.length,
    main,
    smaller: projects.length - main,
    highGrades: courses.filter((c) => c.grade >= 9.5 && withProject.has(c.code.toLowerCase())).length,
  };
}
