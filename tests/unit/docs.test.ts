import { describe, expect, test } from 'vitest';
import { docsFor } from '../../src/lib/docs';

// Reports and presentations (spec §5.4, Jason 2026-10-24): a project shows one only when Jason has put its cleaned PDF
// in public/reports; nothing is ever copied from reports/.
describe('docsFor', () => {
  const has = (files: string[]) => (path: string) => files.includes(path);
  test('a course project looks under its course, report first', () => {
    const docs = docsFor({ id: 'gpgpu', course: 'ece338' }, has(['public/reports/ece338/gpgpu-presentation.pdf', 'public/reports/ece338/gpgpu-report.pdf']));
    expect(docs).toEqual([
      { kind: 'report', label: 'Report', href: '/reports/ece338/gpgpu-report.pdf' },
      { kind: 'presentation', label: 'Presentation', href: '/reports/ece338/gpgpu-presentation.pdf' },
    ]);
  });
  test('a project outside courses looks under projects', () => {
    expect(docsFor({ id: 'homelab' }, has(['public/reports/projects/homelab-report.pdf']))).toEqual([{ kind: 'report', label: 'Report', href: '/reports/projects/homelab-report.pdf' }]);
  });
  test('no file, nothing shown', () => {
    expect(docsFor({ id: 'nbody', course: 'ece415' }, has([]))).toEqual([]);
  });
});
