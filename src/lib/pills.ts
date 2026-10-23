// A project's context pills, from its data alone (Jason, 2026-10-23), so a project shows the same pills on its card,
// on /projects and in "Currently working on": its course and grade, or the course it grew out of; "In progress";
// "Live", linking to the site, for a deployed project. Who built it is never a pill: the avatars say that (a solo project shows only mine).
import { courseHref } from './links';

export interface Pill { code?: string; text: string; href?: string; mark?: 'live' | 'progress' }
interface CourseRef { id: string; code: string; grade: number }

export function pillsFor(p: { status?: 'in-progress'; site?: string }, course?: CourseRef, from?: CourseRef): Pill[] {
  const out: Pill[] = [];
  if (course) out.push({ code: course.code, text: `Grade ${course.grade}`, href: courseHref(course.id) });
  if (from) out.push({ code: `From ${from.code}`, text: '', href: courseHref(from.id) });
  if (p.status === 'in-progress') out.push({ text: 'In progress', mark: 'progress' });
  if (p.site) out.push({ text: 'Live', mark: 'live', href: p.site }); // a deployed project: the pill alone goes to the site
  return out;
}
