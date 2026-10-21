export const LAB_URL = 'https://fpga.njason.dev';

/** Where a project card or row links (plan Task 10): its course-page section, its own page, or the lab. */
export function projectHref(p: { id: string; kind: 'course' | 'personal'; course?: string }): string {
  if (p.id === 'live-fpga-lab') return LAB_URL;
  if (p.kind === 'personal' || !p.course) return `/projects/${p.id}`;
  return `/courses/${p.course}#${p.id}`;
}

/** Where a project's own page or section is (All projects page, Plan 2): personal → its page, main course → its page under the course, else its course section. */
export function pageHref(p: { id: string; kind: 'course' | 'personal'; course?: string; main: boolean }): string {
  if (p.kind === 'personal' || !p.course) return `/projects/${p.id}`;
  return p.main ? `/courses/${p.course}/${p.id}` : `/courses/${p.course}#${p.id}`;
}

export const courseHref = (course: string) => `/courses/${course}`;
