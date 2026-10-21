#!/usr/bin/env node
// prebuild: fetch each collaborator's GitHub avatar into src/assets/avatars/. Never fails the build.
import { readdirSync, readFileSync } from 'node:fs';
import { fetchAvatar } from '../src/lib/avatars.ts';

try {
  const dir = 'src/content/collaborators';
  const people = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
  const results = await Promise.all(people.map((p) => fetchAvatar(p)));
  results.forEach((r, i) => console.log(`avatar ${people[i].github}: ${r.file ?? `initials ${r.initials}`}`));
} catch (e) {
  console.log(`avatars skipped: ${e.message}`);
}
process.exit(0);
