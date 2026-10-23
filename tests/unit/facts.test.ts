import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { parse } from 'yaml';
import { numbersIn, sourced } from '../../src/lib/facts';
import { loadContent } from './helpers/content';

// Never invent facts (CLAUDE.md): every number in project copy must come from the brief, the reports index or the
// approved mocks. A number in a mock's markup (CSS, scripts, attributes) is not a source; only its text is.
const ROOT = join(import.meta.dirname, '../..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const mockText = (html: string) => html.replace(/<(style|script)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]*>/g, ' ');
const SOURCES = [
  read('docs/PROJECT_BRIEF.md'),
  read('docs/REPORTS_INDEX.md'),
  ...['index', 'project', 'course'].map((m) => mockText(read(`docs/superpowers/mocks/styled-v6-glass/${m}.html`))),
].join('\n');

// every string of copy in the frontmatter, however deep; file paths, links, ids and CSS positions are not copy
const NOT_COPY = new Set(['src', 'video', 'position', 'links', 'diagram', 'overlay', 'course', 'fromCourse', 'team', 'kind', 'status', 'file', 'url', 'lang']);
const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => (NOT_COPY.has(k) ? [] : strings(x))) : [];

describe('numbersIn', () => {
  test('finds numbers with their groups and a trailing × or %, and skips bare single digits', () => {
    expect(numbersIn('2,910× faster on 56 threads, 87.7 to 0.02 Mbit/s, 3 people, 3× less, 40%')).toEqual(['2,910×', '56', '87.7', '0.02', '3×', '40%']);
  });
  test('a sentence ending after a number keeps the number whole', () => {
    expect(numbersIn('It ran in 2019.')).toEqual(['2019']);
  });
});

describe('every number in project copy appears in the brief, the reports index or the approved mocks', () => {
  test('a planted number with no source fails', () => {
    expect(numbersIn('4,242× faster').filter((n) => !sourced(n, SOURCES))).toEqual(['4,242×']);
  });
  test('rounding or truncating does not hide inside a longer number: 21× is not sourced by 21.49×', () => {
    expect(sourced('21×', '21.49× faster')).toBe(false);
    expect(sourced('21×', 'about 21× faster')).toBe(true);
    expect(sourced('49', '21.49×')).toBe(false);
  });
  test('project files', async () => {
    const { projects } = await loadContent();
    const missing: string[] = [];
    for (const p of projects) {
      const text = read(`src/content/projects/${p.id}.md`);
      const [, front, ...body] = text.split('---');
      for (const n of numbersIn([...strings(parse(front)), body.join('---')].join('\n'))) if (!sourced(n, SOURCES)) missing.push(`${p.id}: ${n}`);
    }
    expect(missing).toEqual([]);
  });
});
