import { describe, expect, test } from 'vitest';
import { loadContent } from './helpers/content';

const FORBIDDEN = [/\b\d{1,3}(\.\d{1,3}){3}\b/, /:\d{2,5}\b/, /VLAN/i, /GRADES/, /TODO/];

describe('content', () => {
  test('every tool is a non-empty string', async () => {
    const { projects } = await loadContent();
    for (const p of projects) for (const t of p.tools) expect(t.trim().length, `${p.id}`).toBeGreaterThan(0);
  });

  test('every team and course reference resolves', async () => {
    const { projects, courses, collaborators } = await loadContent();
    const people = new Set(collaborators.map((c) => c.id));
    const codes = new Set(courses.map((c) => c.id));
    for (const p of projects) {
      for (const t of p.team) expect(people.has(t), `${p.id} → ${t}`).toBe(true);
      if (p.course) expect(codes.has(p.course), `${p.id} → ${p.course}`).toBe(true);
    }
  });

  test('11 courses, one per course with a project on the site', async () => {
    const { projects, courses } = await loadContent();
    expect(courses.map((c) => c.id).sort()).toEqual(
      ['ece318', 'ece321', 'ece333', 'ece338', 'ece340', 'ece348', 'ece415', 'ece433', 'ece436', 'ece455', 'ece494'],
    );
    for (const c of courses) expect(projects.some((p) => p.course === c.id), c.id).toBe(true);
  });

  test('no rendered field leaks private or unfinished text', async () => {
    const { projects, courses } = await loadContent();
    const fields = [
      ...projects.flatMap((p) => [p.title, p.headline, p.summary, p.group ?? '', ...p.tools]),
      ...courses.flatMap((c) => [c.name, c.intro ?? '', c.featuredProject]),
    ];
    for (const f of fields) for (const re of FORBIDDEN) expect(re.test(f), `${re} in "${f}"`).toBe(false);
  });
});
