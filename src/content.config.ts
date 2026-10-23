import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Content model: spec §8. Facts come from docs/PROJECT_BRIEF.md only.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kind: z.enum(['course', 'personal']), // personal: outside any course (Beyond coursework), solo or with a team
      course: reference('courses').optional(),
      main: z.boolean(),
      order: z.number(),
      headline: z.string(),
      summary: z.string(),
      tools: z.array(z.string().min(1)),
      team: z.array(reference('collaborators')),
      media: z
        .object({ src: image(), alt: z.string(), video: z.string().optional(), position: z.string().optional(), paper: z.boolean().optional(), overlay: z.enum(['fpga']).optional() })
        .optional(),
      diagram: z.enum(['runtime', 'threads', 'homelab', 'dedup', 'alignment', 'roadmap']).optional(),
      // a project still being built: where it stands, drawn by the roadmap diagram
      milestones: z.array(z.object({ name: z.string(), state: z.enum(['done', 'now', 'next']) })).optional(),
      links: z.object({ repo: z.string().url().optional(), teamRepo: z.string().url().optional(), demo: z.string().url().optional() }).default({}),
      report: z.string().optional(),
      status: z.enum(['in-progress']).optional(), // in progress: listed under "Currently working on"
      nowLine: z.string().optional(), // its 3–5 words there (brief: name + 3–5 words)
      group: z.string().optional(),
      fromCourse: reference('courses').optional(), // a project outside courses that grew out of this course
    }),
});

const courses = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/courses' }),
  schema: z.object({
    code: z.string(),
    name: z.string(),
    grade: z.number(),
    intro: z.string().optional(),
    sequence: z.boolean(),
    order: z.number(),
    rank: z.number(), // its place on the All projects page, by importance (Jason, 2026-10-23)
    featuredProject: reference('projects'),
  }),
});

const collaborators = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/collaborators' }),
  schema: z.object({ name: z.string(), github: z.string(), website: z.string().url().optional() }),
});

export const collections = { projects, courses, collaborators };
