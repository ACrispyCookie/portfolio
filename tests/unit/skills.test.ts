import { describe, expect, test } from 'vitest';
import { buildSkillIndex, toSkillProjects } from '../../src/lib/skills';
import skills from '../../src/data/skills.json';
import { loadContent } from './helpers/content';

async function index() {
  const { projects, courses } = await loadContent();
  const codes = Object.fromEntries(courses.map((c) => [c.id, c.code]));
  return buildSkillIndex(toSkillProjects(projects, codes, skills.origin), skills);
}

describe('buildSkillIndex', () => {
  test('CUDA: three ECE415 projects, in project order', async () => {
    const cuda = (await index()).find((e) => e.tool === 'CUDA')!;
    expect(cuda.count).toBe(3);
    expect(cuda.usedIn.map((u) => u.title)).toEqual(['N-body on GPUs', 'CUDA convolution', 'CLAHE']);
    expect(cuda.usedIn.every((u) => u.courseCode === 'ECE415')).toBe(true);
  });

  test('homelab software links to Homelab', async () => {
    const traefik = (await index()).find((e) => e.tool === 'Traefik')!;
    expect(traefik.usedIn.map((u) => u.title)).toContain('Homelab');
    expect(traefik.usedIn.find((u) => u.title === 'Homelab')!.href).toBe('/projects/homelab');
  });

  test('MySQL links to the Minecraft plugins on acrispycookie.dev', async () => {
    const mysql = (await index()).find((e) => e.tool === 'MySQL')!;
    expect(mysql.usedIn).toEqual([{ title: 'Minecraft plugins', href: 'https://acrispycookie.dev' }]);
  });

  test('MATLAB is coursework that is not on the site', async () => {
    expect((await index()).find((e) => e.tool === 'MATLAB')).toMatchObject({ count: 0, coursework: true, usedIn: [] });
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
    const out = buildSkillIndex([{ slug: 'x', title: 'X', tools: ['Zig'], href: '/x' }], { vocabulary: ['C'], coursework: [] });
    expect(out.map((e) => e.tool)).toEqual(['Zig', 'C']);
  });
});
