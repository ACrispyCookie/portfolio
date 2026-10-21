export const LAB_URL = 'https://fpga.njason.dev';

/** Where a project card or row links (plan Task 10): its course-page section, its own page, or the lab. */
export function projectHref(p: { id: string; kind: 'course' | 'personal'; course?: string }): string {
  if (p.id === 'live-fpga-lab') return LAB_URL;
  if (p.kind === 'personal' || !p.course) return `/projects/${p.id}`;
  return `/courses/${p.course}#${p.id}`;
}
