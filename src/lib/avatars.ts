// Build-time collaborator avatars (CLAUDE.md: no runtime GitHub calls; fall back to initials when offline).
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

export interface Person { name: string; github: string }
export interface AvatarResult { file: string | null; initials: string }

export const AVATAR_DIR = 'src/assets/avatars';

/** First letters of the first and last name: "Ada Lovelace" → "AL", "Tvangos" → "T". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Saves github.com/<handle>.png?size=96 as <dir>/<handle>.jpg; file is null on any failure. */
export async function fetchAvatar(person: Person, fetchImpl: typeof fetch = fetch, dir = AVATAR_DIR): Promise<AvatarResult> {
  const initials = initialsOf(person.name);
  try {
    const res = await fetchImpl(`https://github.com/${person.github}.png?size=96`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok || !(res.headers.get('content-type') ?? '').startsWith('image/')) return { file: null, initials };
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${person.github}.jpg`);
    await sharp(Buffer.from(await res.arrayBuffer())).resize(96, 96).flatten({ background: '#183539' }).jpeg({ quality: 85 }).toFile(file);
    return { file, initials };
  } catch {
    return { file: null, initials };
  }
}
