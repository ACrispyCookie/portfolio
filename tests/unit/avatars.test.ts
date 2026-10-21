import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, test } from 'vitest';
import { fetchAvatar, initialsOf } from '../../src/lib/avatars';

const ada = { name: 'Ada Lovelace', github: 'ada' };
const dir = () => mkdtempSync(join(tmpdir(), 'avatars-'));

describe('fetchAvatar', () => {
  test('falls back to initials when the fetch rejects', async () => {
    const reject = (() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    expect(await fetchAvatar(ada, reject, dir())).toEqual({ file: null, initials: 'AL' });
  });

  test('falls back on a non-image or failed response', async () => {
    const notFound = (async () => new Response('nope', { status: 404 })) as unknown as typeof fetch;
    const html = (async () => new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } })) as unknown as typeof fetch;
    expect((await fetchAvatar(ada, notFound, dir())).file).toBeNull();
    expect((await fetchAvatar(ada, html, dir())).file).toBeNull();
  });

  test('writes <handle>.jpg from github.com/<handle>.png?size=96', async () => {
    let asked = '';
    const ok = (async (url: string) => {
      asked = url;
      const png = await sharp({ create: { width: 420, height: 420, channels: 3, background: '#41e2f2' } }).png().toBuffer();
      return new Response(new Uint8Array(png), { status: 200, headers: { 'content-type': 'image/png' } });
    }) as unknown as typeof fetch;
    const out = dir();
    const r = await fetchAvatar(ada, ok, out);
    expect(asked).toBe('https://github.com/ada.png?size=96');
    expect(r).toEqual({ file: join(out, 'ada.jpg'), initials: 'AL' });
    expect(existsSync(join(out, 'ada.jpg'))).toBe(true);
    const meta = await sharp(join(out, 'ada.jpg')).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 96, 96]);
  });
});

describe('initialsOf', () => {
  test('first letters of the first and last name', () => {
    expect(initialsOf('Panagiotis Nikolaos Tsogkas')).toBe('PT');
    expect(initialsOf('Tvangos')).toBe('T');
  });
});
