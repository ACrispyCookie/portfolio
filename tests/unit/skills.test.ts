import { describe, expect, test } from 'vitest';
import { buildSkillIndex, toSkillProjects } from '../../src/lib/skills';
import skills from '../../src/data/skills.json';
import evidence from '../../src/data/skills-evidence.json';
import { loadContent } from './helpers/content';

async function index() {
  const { projects, courses } = await loadContent();
  const codes = Object.fromEntries(courses.map((c) => [c.id, c.code]));
  return buildSkillIndex(toSkillProjects(projects, codes, skills.origin), { coursework: evidence.coursework });
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

  test('course work in an on-site course is never called outside (ECE318 Project 1)', () => {
    expect(Object.keys(evidence.coursework)).toContain('ECE318 Operating Systems (Project 1)');
    expect(evidence.outside).not.toContain('ECE318 Operating Systems (Project 1)');
    for (const name of evidence.outside) expect(name.match(/^ECE\d{3}/)?.[0] ?? '', name).not.toMatch(/ECE(318|321|333|338|340|348|415|433|436|455|494)/);
  });

  test('Vivado/Vitis is on all four ECE333 lab cards (Jason: Lab 1 is a project)', async () => {
    const v = await entry('Vivado/Vitis');
    expect(v.usedIn.map((u) => u.title)).toEqual(expect.arrayContaining(['Seven-segment display', 'UART', 'VGA controller', 'Accelerometer over SPI']));
    expect(v.alsoIn.join()).not.toContain('ECE333');
  });

  test('MongoDB is gone: nothing uses it (Jason, 2026-10-21)', async () => {
    expect((await index()).map((e) => e.tool)).not.toContain('MongoDB');
  });

  // the chips come from the data (Jason, 2026-10-23): every tool a project, the Minecraft origin or off-site coursework
  // uses, and nothing hand-listed, so adding a project never needs a second edit
  test('the chips are exactly the tools the projects, the origin and the off-site coursework use', async () => {
    const { projects } = await loadContent();
    const used = new Set([...projects.flatMap((p) => p.tools), ...skills.origin.tools, ...Object.values(evidence.coursework).flat()]);
    expect(new Set((await index()).map((e) => e.tool))).toEqual(used);
    expect(skills).not.toHaveProperty('vocabulary');
  });

  test('a tool only off-site coursework used shows with no count: AutoCAD from Engineering Drawing', async () => {
    expect(await entry('AutoCAD')).toMatchObject({ count: 0, usedIn: [], alsoIn: ['ECE120 Engineering Drawing'] });
  });

  test('every chip shows, sorted by count, then A to Z', async () => {
    const all = await index();
    for (let i = 1; i < all.length; i++) {
      const [a, b] = [all[i - 1], all[i]];
      expect(a.count > b.count || (a.count === b.count && a.tool.localeCompare(b.tool) < 0), `${a.tool} before ${b.tool}`).toBe(true);
    }
  });

  test('a new project brings its tools with it; coursework adds count-0 chips', () => {
    const out = buildSkillIndex([{ slug: 'x', title: 'X', tools: ['Zig'], href: '/x' }], { coursework: { 'Some course': ['C'] } });
    expect(out.map((e) => [e.tool, e.count])).toEqual([['Zig', 1], ['C', 0]]);
  });
});

describe('content matches the evidence scan', () => {
  // the scan says which tools a project used; the order is set by hand, what the project is built with first, since
  // the most code is not always what defines it (Jason, 2026-10-23: the GPGPU's CLI is mostly Python)
  test('each project lists its tools by what defines it, Git last', async () => {
    const { projects } = await loadContent();
    for (const p of projects) if (p.tools.includes('Git')) expect(p.tools.at(-1), p.id).toBe('Git');
    for (const id of ['gpgpu', 'gpgpu-v2']) {
      const t = projects.find((p) => p.id === id)!.tools;
      expect(t[0]).toBe('SystemVerilog');
      expect(t.slice(0, 5)).toContain('RISC-V'); // shown on the card, not behind "+N"
    }
    const first = Object.fromEntries(projects.map((p) => [p.id, p.tools[0]]));
    expect(first).toMatchObject({ nbody: 'CUDA', kmeans: 'OpenMP', 'smith-waterman': 'Vitis HLS', fuse: 'FUSE', house: 'OpenGL', rambo: 'SDR (ADALM-PLUTO)', homelab: 'Proxmox' });
  });
  test("every project's tools are exactly what scripts/skills-evidence.mjs found", async () => {
    const { projects } = await loadContent();
    for (const p of projects) expect([...p.tools].sort(), p.id).toEqual([...(evidence.projects as Record<string, string[]>)[p.id]].sort());
  });
});
