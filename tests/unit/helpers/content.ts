// Reads the content collections straight from disk for unit tests (Astro validates the schema at build time).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const ROOT = join(import.meta.dirname, '../../../src/content');

export interface ProjectData {
  id: string;
  title: string;
  kind: 'course' | 'personal';
  course?: string;
  main: boolean;
  order: number;
  headline: string;
  summary: string;
  tools: string[];
  team: string[];
  group?: string;
  fromCourse?: string;
  status?: 'in-progress';
  nowLine?: string;
  milestones?: { name: string; state: 'done' | 'now' | 'next' }[];
  links?: { repo?: string; teamRepo?: string; demo?: string };
}
export interface CourseData { id: string; code: string; name: string; grade: number; intro?: string; featuredProject: string }
export interface CollaboratorData { id: string; name: string; github: string }

const ids = (dir: string, ext: string) => readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length));

export async function loadContent() {
  const projects: ProjectData[] = ids('projects', '.md').map((id) => {
    const text = readFileSync(join(ROOT, 'projects', `${id}.md`), 'utf8');
    return { id, ...parse(text.split('---')[1]) };
  });
  const courses: CourseData[] = ids('courses', '.json').map((id) => ({ id, ...JSON.parse(readFileSync(join(ROOT, 'courses', `${id}.json`), 'utf8')) }));
  const collaborators: CollaboratorData[] = ids('collaborators', '.json').map((id) => ({ id, ...JSON.parse(readFileSync(join(ROOT, 'collaborators', `${id}.json`), 'utf8')) }));
  return { projects, courses, collaborators };
}
