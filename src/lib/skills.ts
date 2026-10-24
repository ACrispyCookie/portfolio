// Skills explorer data (spec §7.4): "used in" comes from each project's tools list; nothing is hand-mapped.
import { pageHref } from './links';

export interface SkillProject { slug: string; title: string; tools: string[]; courseCode?: string; href: string }
export interface SkillUse { title: string; courseCode?: string; href: string }
/** alsoIn: courses not on the site that used the tool; they are named in the line but never counted (option B). */
export interface SkillEntry { tool: string; count: number; usedIn: SkillUse[]; alsoIn: string[] }

/** Projects in site order, then the Minecraft origin entry, as the explorer's input. */
export function toSkillProjects(
  projects: { id: string; title: string; kind: 'course' | 'personal'; course?: string; main: boolean; order: number; tools: string[] }[],
  courseCodes: Record<string, string>,
  origin: SkillProject,
): SkillProject[] {
  const list = [...projects].sort((a, b) => a.order - b.order).map((p) => ({
    slug: p.id,
    title: p.title,
    tools: p.tools,
    courseCode: p.course ? courseCodes[p.course] : undefined,
    href: pageHref(p),
  }));
  return [...list, origin];
}

/** The chips are every tool the projects and the off-site coursework use (Jason, 2026-10-23: nothing hand-listed, so a
 * new project needs no second edit); coursework-only tools show with a count of 0. */
export function buildSkillIndex(projects: SkillProject[], opts: { coursework: Record<string, string[]> }): SkillEntry[] {
  const uses = new Map<string, SkillUse[]>();
  for (const p of projects) {
    for (const t of p.tools) {
      const use: SkillUse = { title: p.title, href: p.href };
      if (p.courseCode) use.courseCode = p.courseCode;
      uses.set(t, [...(uses.get(t) ?? []), use]);
    }
  }
  for (const t of Object.values(opts.coursework).flat()) if (!uses.has(t)) uses.set(t, []);
  return [...uses]
    .map(([tool, usedIn]) => ({
      tool,
      count: usedIn.length,
      usedIn,
      // every repo has Git, so naming courses for it would say nothing
      alsoIn: tool === 'Git' ? [] : Object.keys(opts.coursework).filter((c) => opts.coursework[c].includes(tool)),
    }))
    .sort((a, b) => b.count - a.count || a.tool.localeCompare(b.tool));
}
