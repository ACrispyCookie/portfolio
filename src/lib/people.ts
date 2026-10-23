// People I build with (Jason, 2026-10-23): who I built what with, derived from the projects' teams; nothing listed by
// hand. Sorted by projects shared; a tie goes to whoever shares the more important project (the site's own order),
// then to the name. A person from more than one course is a regular (a large card).
import { pageHref } from './links';

interface ProjectIn { id: string; title: string; kind: 'course' | 'personal'; course?: string; fromCourse?: string; main: boolean; order: number; team: string[] }
interface CourseIn { id: string; code: string }
interface PersonIn { id: string; name: string; github?: string; website?: string }
export interface MainProject { title: string; href: string; code?: string }
export interface Person extends PersonIn { projects: number; courses: string[]; main: MainProject[]; regular: boolean; best: number }

export function peopleFrom(projects: ProjectIn[], courses: CourseIn[], people: PersonIn[]): Person[] {
  const code = (id?: string) => courses.find((c) => c.id === id)?.code;
  const inOrder = [...projects].sort((a, b) => a.order - b.order);
  return people
    .filter((who) => who.id !== 'jason')
    .map((who) => {
      const shared = inOrder.filter((p) => p.team.includes(who.id));
      const codes = [...new Set(shared.map((p) => code(p.course ?? p.fromCourse)).filter((c): c is string => !!c))].sort();
      const main = shared.filter((p) => p.main).map((p) => ({ title: p.title, href: pageHref(p), code: code(p.course ?? p.fromCourse) }));
      return { ...who, projects: shared.length, courses: codes, main, regular: codes.length > 1, best: shared[0]?.order ?? Infinity };
    })
    .filter((p) => p.projects > 0)
    .sort((a, b) => b.projects - a.projects || a.best - b.best || a.name.localeCompare(b.name));
}
