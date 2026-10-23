// A project's context pills, from its data alone (Jason, 2026-10-23), so a project shows the same pills on its card,
// on /projects and in "Currently working on": its course and grade, or the course it grew out of; "In progress";
// "Live" for the lab. Who built it is never a pill: the avatars say that (a solo project shows only mine).
import { LAB_URL, courseHref, projectHref } from './links';

export interface Pill { code?: string; text: string; href?: string; mark?: 'live' | 'progress' }
interface CourseRef { id: string; code: string; grade: number }

export function pillsFor(p: { id: string; kind: 'course' | 'personal'; status?: 'in-progress' }, course?: CourseRef, from?: CourseRef): Pill[] {
  const out: Pill[] = [];
  if (course) out.push({ code: course.code, text: `Grade ${course.grade}`, href: courseHref(course.id) });
  if (from) out.push({ code: `From ${from.code}`, text: '', href: courseHref(from.id) });
  if (p.status === 'in-progress') out.push({ text: 'In progress', mark: 'progress' });
  if (projectHref({ id: p.id, kind: p.kind, course: course?.id }) === LAB_URL) out.push({ text: 'Live', mark: 'live' });
  return out;
}
