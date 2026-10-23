import { describe, expect, test } from 'vitest';
import { newTab } from '../../src/middleware';

describe('newTab (Jason, 2026-10-23: links to other sites open in a new tab)', () => {
  test('a link to another site gets a new tab and noopener', () => {
    expect(newTab('<a href="https://github.com/x">G</a>')).toBe('<a href="https://github.com/x" rel="noopener" target="_blank">G</a>');
  });
  test('an existing rel keeps its words and gains noopener once', () => {
    expect(newTab('<a class="t" rel="me" href="https://x.dev">X</a>')).toBe('<a class="t" rel="me noopener" href="https://x.dev" target="_blank">X</a>');
    expect(newTab('<a rel="noopener" href="https://x.dev">X</a>')).toBe('<a rel="noopener" href="https://x.dev" target="_blank">X</a>');
  });
  test('links within the site, anchors, mail and links that already choose a target are left alone', () => {
    for (const a of ['<a href="/projects">P</a>', '<a href="#top">T</a>', '<a href="mailto:a@b.c">M</a>', '<a href="https://x.dev" target="_self">X</a>', '<abbr title="https://x">x</abbr>']) expect(newTab(a)).toBe(a);
  });
});
