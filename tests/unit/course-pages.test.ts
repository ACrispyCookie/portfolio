import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { loadContent } from './helpers/content';

// Task 6 (plan 2026-10-21): every course page has its content. A smaller project is shown in full on its course page,
// so it needs its own write-up and a code excerpt linked to GitHub at a pinned commit.
const ROOT = join(import.meta.dirname, '../..');
const body = (id: string) => readFileSync(join(ROOT, 'src/content/projects', `${id}.md`), 'utf8').split('---').slice(2).join('---');
// the security courses wait for their own plan (Jason, 2026-10-25): no intro is written for them here
const SECURITY = ['ece455', 'ece436'];

describe('course pages', () => {
  test('every course has an intro, except the security courses', async () => {
    const { courses } = await loadContent();
    for (const c of courses.filter((c) => !SECURITY.includes(c.id))) expect(c.intro?.trim(), c.id).toBeTruthy();
  });

  test('every smaller course project has its write-up, starting with What it is, and at least two more sections', async () => {
    const { projects } = await loadContent();
    for (const p of projects.filter((p) => p.course && !p.main)) {
      const heads = [...body(p.id).matchAll(/^## (.+)$/gm)].map((m) => m[1]);
      expect(heads[0], p.id).toBe('What it is');
      expect(heads.length, p.id).toBeGreaterThanOrEqual(3);
    }
  });

  test('every smaller course project has a code excerpt whose file names the same repo, path, commit and lines as its link', async () => {
    const { projects } = await loadContent();
    for (const p of projects.filter((p) => p.course && !p.main)) {
      expect(p.code, p.id).toBeTruthy();
      const file = join(ROOT, 'src/content/excerpts', p.code!.file);
      expect(existsSync(file), p.code!.file).toBe(true);
      const [, repo, path, sha, from, to] = /^\S+ (\S+) (\S+)@([0-9a-f]{40}) L(\d+)-L(\d+)$/.exec(readFileSync(file, 'utf8').split('\n')[0])!;
      expect(p.code!.url, p.id).toBe(`https://github.com/${repo}/blob/${sha}/${path}#L${from}-L${to}`);
      const lines = readFileSync(file, 'utf8').replace(/\n$/, '').split('\n').length - 1;
      expect(lines, `${p.id}: lines in the excerpt`).toBe(Number(to) - Number(from) + 1);
    }
  });

  // checked once against GitHub; skipped offline
  test('every code link opens on GitHub', async () => {
    const online = await fetch('https://github.com', { method: 'HEAD' }).then((r) => r.ok, () => false);
    if (!online) return;
    const { projects } = await loadContent();
    const urls = [...new Set(projects.flatMap((p) => (p.code ? [p.code.url.replace(/#.*$/, '')] : [])))];
    const status = await Promise.all(urls.map((u) => fetch(u, { method: 'HEAD' }).then((r) => `${r.status} ${u}`)));
    expect(status.filter((s) => !s.startsWith('200'))).toEqual([]);
  }, 60_000);
});
