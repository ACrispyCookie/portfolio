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

  test('course teams match Jason (2026-10-21): ECE321 with Tsogkas and Tvangos, ECE348 solo', async () => {
    const { projects } = await loadContent();
    for (const p of projects.filter((x) => x.course === 'ece321')) expect([...p.team].sort(), p.id).toEqual(['tsogkas', 'tvangos']);
    for (const p of projects.filter((x) => x.course === 'ece348')) expect(p.team, p.id).toEqual([]);
  });

  test('ECE433 team matches the GitHub repo (Jason, 2026-10-21): Tsogkas and Kalousis on the house, its only project', async () => {
    const { projects, collaborators } = await loadContent();
    const ece433 = projects.filter((x) => x.course === 'ece433');
    expect(ece433.map((p) => p.id)).toEqual(['house']);
    for (const p of ece433) expect([...p.team].sort(), p.id).toEqual(['kalousis', 'tsogkas']);
    expect(collaborators.find((c) => c.id === 'kalousis')).toMatchObject({ name: 'Anastasios Kalousis', github: 'AnastasisK126' });
  });

  test("every course's featured project exists and belongs to it", async () => {
    const { projects, courses } = await loadContent();
    for (const c of courses) {
      const p = projects.find((x) => x.id === c.featuredProject);
      expect(p, c.id).toBeDefined();
      expect(p!.course === c.id || p!.fromCourse === c.id, c.id).toBe(true);
    }
  });

  test('no rendered field leaks private or unfinished text', async () => {
    const { projects, courses } = await loadContent();
    const fields = [
      ...projects.flatMap((p) => [p.title, p.headline, p.summary, p.group ?? '', p.nowLine ?? '', ...p.tools, ...(p.milestones ?? []).map((m) => m.name)]),
      ...courses.flatMap((c) => [c.name, c.intro ?? '', c.featuredProject]),
    ];
    for (const f of fields) for (const re of FORBIDDEN) expect(re.test(f), `${re} in "${f}"`).toBe(false);
  });
});
