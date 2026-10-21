import { describe, expect, test } from 'vitest';
import { buildSkillIndex, toSkillProjects } from '../../src/lib/skills';
import skills from '../../src/data/skills.json';
import evidence from '../../src/data/skills-evidence.json';
import { loadContent } from './helpers/content';

async function index() {
  const { projects, courses } = await loadContent();
  const codes = Object.fromEntries(courses.map((c) => [c.id, c.code]));
  return buildSkillIndex(toSkillProjects(projects, codes, skills.origin), { vocabulary: skills.vocabulary, coursework: evidence.coursework });
}
const entry = async (tool: string) => (await index()).find((e) => e.tool === tool)!;

describe('buildSkillIndex', () => {
  test('CUDA: three ECE415 projects, in project order', async () => {
    const cuda = await entry('CUDA');
    expect(cuda.count).toBe(3);
    expect(cuda.usedIn.map((u) => u.title)).toEqual(['N-body on GPUs', 'CUDA convolution', 'CLAHE']);
    expect(cuda.usedIn.every((u) => u.courseCode === 'ECE415')).toBe(true);
  });

  test('Traefik is the homelab only (Jason, 2026-10-21)', async () => {
    expect((await entry('Traefik')).usedIn).toEqual([{ title: 'Homelab', href: '/projects/homelab' }]);
  });

  test('MySQL: the homelab and the Minecraft plugins, plus ECE311 named as coursework', async () => {
    const mysql = await entry('MySQL');
    expect(mysql.usedIn.map((u) => u.title)).toEqual(['Homelab', 'Minecraft plugins']);
    expect(mysql.usedIn[1].href).toBe('https://acrispycookie.dev');
    expect(mysql.alsoIn).toEqual(['ECE311 Databases']);
  });

  test('MATLAB comes only from coursework: counted 0, Numerical Analysis named', async () => {
    expect(await entry('MATLAB')).toMatchObject({ count: 0, usedIn: [], alsoIn: ['Numerical Analysis'] });
  });

  test('coursework never adds to the count (option B)', async () => {
    const c = await entry('C');
    expect(c.count).toBe(c.usedIn.length);
    expect(c.alsoIn).toContain('ECE115 Programming I');
  });

  test('Git names no coursework: every repo has it, so the list would say nothing', async () => {
    expect((await entry('Git')).alsoIn).toEqual([]);
  });

  test("Jason's drops hold: no pthreads on CLAHE, no SQLite on GPGPU, no ARM/Zynq on CV32E40P", async () => {
    expect((await entry('pthreads')).usedIn.map((u) => u.title)).not.toContain('CLAHE');
    expect((await entry('SQLite')).usedIn.map((u) => u.title)).not.toContain('RISC-V GPGPU');
    expect((await entry('ARM/Zynq')).usedIn.map((u) => u.title)).not.toContain('CV32E40P timing');
  });

  test('the whole vocabulary shows, sorted by count, then A to Z', async () => {
    const all = await index();
    expect(all).toHaveLength(skills.vocabulary.length);
    for (let i = 1; i < all.length; i++) {
      const [a, b] = [all[i - 1], all[i]];
      expect(a.count > b.count || (a.count === b.count && a.tool.localeCompare(b.tool) < 0), `${a.tool} before ${b.tool}`).toBe(true);
    }
  });

  test('a tool used by a project but missing from the vocabulary still appears', () => {
    const out = buildSkillIndex([{ slug: 'x', title: 'X', tools: ['Zig'], href: '/x' }], { vocabulary: ['C'], coursework: {} });
    expect(out.map((e) => e.tool)).toEqual(['Zig', 'C']);
  });
});

describe('content matches the evidence scan', () => {
  test("every project's tools are exactly what scripts/skills-evidence.mjs found", async () => {
    const { projects } = await loadContent();
    for (const p of projects) expect([...p.tools].sort(), p.id).toEqual([...(evidence.projects as Record<string, string[]>)[p.id]].sort());
  });
});
