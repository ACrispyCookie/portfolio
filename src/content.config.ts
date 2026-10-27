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
      step: z.number().optional(), // its place in its course, 1 = first done; the course page lists newest first (Jason, 2026-10-27)
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
      // site: deployed and public; its Live pill is the only way there (Jason, 2026-10-23)
      links: z.object({ repo: z.string().url().optional(), demo: z.string().url().optional(), site: z.string().url().optional() }).default({}),
      report: z.string().optional(),
      status: z.enum(['in-progress']).optional(), // in progress: listed under "Currently working on"
      nowLine: z.string().optional(), // its 3–5 words there (brief: name + 3–5 words)
      group: z.string().optional(),
      fromCourse: reference('courses').optional(), // a project outside courses that grew out of this course
      next: reference('projects').optional(), // the project that continues this one: What's next shows it as a card
      // page content (Plan 2): all optional, a section with no true content is left out (spec §5.2)
      numbers: z.array(z.object({ value: z.string(), label: z.string() })).max(4).optional(), // the key numbers
      overview: z.string().optional(), // one or two short paragraphs, blank lines between them
      steps: z.array(z.object({ title: z.string(), text: z.string() })).optional(), // How it works
      results: z.object({ section: z.string().optional(), text: z.string(), bars: z.array(z.object({ label: z.string(), value: z.number(), display: z.string() })).optional() }).optional(),
      // a code excerpt: the file under src/content/code/, and its GitHub blob URL at a pinned commit with line anchors
      code: z.object({ file: z.string(), lang: z.string(), url: z.string().url(), caption: z.string() }).optional(),
      gallery: z.array(z.object({ src: image(), alt: z.string() })).optional(),
      // pictures inside the sections, only ones Jason approved (spec §5.2, §11): a picture or one of the drawings;
      // `section` is the id of one of the project's own headings (the build fails if it has no such heading)
      figures: z.array(z.object({
        section: z.string(),
        alt: z.string(),
        src: image().optional(),
        diagram: z.enum(['runtime', 'threads', 'homelab', 'dedup', 'alignment', 'roadmap', 'flow', 'verify', 'timeslice', 'tupletake', 'migrate', 'session', 'labwiring', 'dvdpipe']).optional(),
      }).refine((f) => !!f.src !== !!f.diagram, 'a figure is a picture or a drawing')).optional(),
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
  // linkedin: only for people who agreed to it (Jason, 2026-10-23)
  schema: z.object({ name: z.string(), github: z.string(), website: z.string().url().optional(), linkedin: z.string().url().optional() }),
});

export const collections = { projects, courses, collaborators };
