export const LAB_URL = 'https://fpga.njason.dev';

/** Where every link to a project goes (Jason, 2026-10-24: cards, grade rows and skills too): personal → its page, main course → its page under the course, else its course section. */
export function pageHref(p: { id: string; kind: 'course' | 'personal'; course?: string; main: boolean }): string {
  if (p.kind === 'personal' || !p.course) return `/projects/${p.id}`;
  return p.main ? `/courses/${p.course}/${p.id}` : `/courses/${p.course}#${p.id}`;
}

export const courseHref = (course: string) => `/courses/${course}`;
