import { describe, expect, test } from 'vitest';
import { peopleFrom } from '../../src/lib/people';
import { loadContent } from './helpers/content';

// People I build with (Jason, 2026-10-23): everything comes from the projects' teams; nothing is listed by hand.
describe('peopleFrom', () => {
  // a tie goes to whoever shares the more important project, by the site's order (Jason, 2026-10-23)
  test('sorted by projects shared, then by the most important shared project; counts and courses from the teams', async () => {
    const { projects, courses, collaborators } = await loadContent();
    const people = peopleFrom(projects, courses, collaborators);
    expect(people.map((p) => [p.id, p.projects, p.courses.length])).toEqual([
      ['tsogkas', 17, 8], ['tsiantos', 12, 6], ['tvangos', 4, 1], ['balamotis', 1, 1], ['kalousis', 1, 1], // Wi-Fi jammer (4) before the 3D house (5)
    ]);
    expect(people.find((p) => p.id === 'jason')).toBeUndefined(); // me, never listed as my own collaborator
  });

  test('a person from more than one course is a regular; their main projects in site order', async () => {
    const { projects, courses, collaborators } = await loadContent();
    const [tsogkas, , tvangos] = peopleFrom(projects, courses, collaborators);
    expect(tsogkas.regular).toBe(true);
    expect(tsogkas.main.map((m) => m.title)).toEqual(['RISC-V GPGPU', 'N-body on GPUs', 'RAMBO air-gap', 'Explorable 3D house', 'User-level threads', 'GPGPU v2']);
    expect(tsogkas.courses).toEqual(['ECE318', 'ECE321', 'ECE338', 'ECE340', 'ECE415', 'ECE433', 'ECE455', 'ECE494']);
    expect(tvangos.regular).toBe(false);
    expect(tvangos.main.map((m) => [m.code, m.title])).toEqual([['ECE321', 'User-level threads']]);
  });

  test('a tie with the same best project falls back to the name', () => {
    const p = (id: string, team: string[], order: number) => ({ id, title: id, kind: 'course' as const, course: 'c1', main: true, order, team });
    const people = peopleFrom([p('a', ['z', 'y'], 1)], [{ id: 'c1', code: 'C1' }], [{ id: 'z', name: 'Zed' }, { id: 'y', name: 'Yan' }]);
    expect(people.map((x) => x.id)).toEqual(['y', 'z']);
  });

  test('a new shared project changes the order with no other edit', () => {
    const p = (id: string, team: string[], course: string) => ({ id, title: id, kind: 'course' as const, course, main: true, order: 1, team });
    const people = peopleFrom([p('a', ['x'], 'c1'), p('b', ['y'], 'c1'), p('c', ['y'], 'c2')], [{ id: 'c1', code: 'C1' }, { id: 'c2', code: 'C2' }], [{ id: 'x', name: 'Xa' }, { id: 'y', name: 'Yb' }]);
    expect(people.map((x) => x.id)).toEqual(['y', 'x']);
  });
});
