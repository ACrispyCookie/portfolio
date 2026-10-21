# njason.dev: all the other pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build every page the home page links to, plus the launch basics: the All projects list (`/projects`), the ten project pages, the eleven course pages, the 404 page, the share image, the sitemap, canonical URLs and a favicon. Delivered in four milestones that Jason sees one at a time.

**Architecture:**
- **Pages:** each page type is one Astro route that renders from the content collections. Nothing is hand-written per page:
  - `src/pages/projects/index.astro`
  - `src/pages/projects/[id].astro`
  - `src/pages/courses/[code].astro`
  - `src/pages/courses/[code]/[project].astro`
  - `src/pages/404.astro`
- **Project copy:** each main project's long copy is the Markdown body of its existing `src/content/projects/<id>.md`. The `##` headings become the page sections and the table of contents.
- **Course-card data:** the course pages' per-project tab data lives in new optional frontmatter fields.
- **Reuse:** the copper trace, the skills explorer, the avatars and the gate are Plan 1's, reused as they are.

**Tech Stack:** as Plan 1 (Astro 7.4.1, TypeScript, Tailwind 4, Vitest, Playwright 1.64.1, the same gate), plus two additions:
- `@astrojs/sitemap`, installed with `npm i -E`;
- Astro's built-in Shiki (`<Code>` from `astro:components`) for code excerpts.

**Spec:** `docs/superpowers/specs/2026-10-20-portfolio-design.md`, sections 4, 5.2, 5.3, 5.4, 5.4a, 7.3, 7.4, 9 and 11. Also read:
- `CLAUDE.md` and `docs/PROJECT_BRIEF.md`;
- Plan 1's rulings, `docs/superpowers/plans/2026-10-20-njason-home-rulings.md`. They bind here too: layout tests by layout, no "Solo" pill, the strict skills evidence, and so on.

**Approved mocks:**
- `docs/superpowers/mocks/styled-v6-glass/project.html` (GPGPU) and `course.html` (ECE415).
- Copy their strings verbatim where the spec didn't change them.
- The mock's known failures, listed in spec §11, must not be carried over.

**Branch:** `build/pages`, off `build/home`. PR #1 is still open, so later fixes to PR #1 get merged into `build/pages`. Push to the private repo `ACrispyCookie/portfolio`, and open a PR into `main` at the end.

**Out of scope:**
- **Report thumbnails and links.** Spec §5.4 hides them until a cleaned PDF exists, and none does yet. They become a task when Jason supplies the first one.
- **New report figures.** Each needs Jason's approval first; only images already in `src/assets/projects/` and `public/media/` are used.
- **The card-image improvements** Jason deferred in Plan 1.
- **Plan 1's other deferred minors**, except `/pill-test/` and the favicon, which are in Task 7.

## Global Constraints

- **Output:** `output: 'static'`, `site: 'https://njason.dev'`.
- **Network:** the only runtime calls are `https://fpga.njason.dev/api/public/board/stream` and `…/api/public/board`.
- **Private material:**
  - Never import, link or copy from `reports/` or `research/`.
  - Code excerpts are fetched from Jason's **public** GitHub repos at a pinned commit (`gh api`), never copied from `research/` or from private repos.
  - Never publish `docs/GRADES.md`.
- **Restricted subjects:**
  - Security projects (ECE455, ECE436): outcome-level copy only (CLAUDE.md).
  - Homelab: categories only. No IPs, hosts, ports, versions or layout.
- **Never invent facts:**
  - Every number in page copy must appear in `docs/PROJECT_BRIEF.md`, `docs/REPORTS_INDEX.md` or the approved mocks. Task 2's fact test enforces it.
  - New facts found in a report go into the brief first, marked 📑 with their source, and only then into copy.
  - A section with no true content is left out, never padded (spec §5.2).
- **Tokens, type scale, surfaces and motion:** exactly as Plan 1's Global Constraints. In short:
  - five text sizes;
  - paragraphs at most 65ch;
  - no shadows, gradients, borders or backdrop filters;
  - hidden states only behind `html.rv` and `prefers-reduced-motion: no-preference`;
  - nothing under 13 px.
- **Copy rules:**
  - No eyebrow labels (no "Project 3 of 5"), no ALL-CAPS, no `→`, and **no middle-dot strings**. The spec's "28 projects · 11 courses" is written "28 projects and 11 courses".
  - No violet, no job-seeking text.
- **Teams:** avatars, with Jason first; solo work shows Jason's avatar alone. There is no "Solo" pill anywhere (Jason, 2026-10-21).
- **Layout must hold at every window size:** every new page joins the width × height sweep in `tests/e2e/sweep.spec.ts`, run as both a desktop and a phone browser. Tests choose checks by layout (`tests/e2e/helpers/layout.ts`), never by device name. Prove each new rule fails on the bug it guards.
- **Git:** push only to `ACrispyCookie/portfolio`. The repo stays private. Before each push, re-run the history scan for student IDs, `@uth.gr` and ORCIDs.
- **Commit trailer:**

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01NQxq8JXEeYBtASMWUgc1ZT
  ```

## Review Focus

1. **A main project with thin content** (no "What's next", or no "How we tested it"). Its page shows only the sections it has. The table of contents lists exactly those, there are no empty headings, and the trace has one pad per real section. *Owned by Task 3.*
2. **Arriving at a course section from a home card** (`/courses/ece415#clahe`). The page lands with that project's heading below the sticky bar, its Overview tab open and the section switched on. *Owned by Task 5.*
3. **Keyboard-only use** of the course tabs (arrow keys, Home/End, visible focus) and of the table of contents. *Owned by Tasks 3 and 5.*
4. **No JavaScript on a course page.** All tab panels are visible one after another. No panel is empty or hidden, and the table of contents still jumps. *Owned by Tasks 3 and 5.*
5. **The narrowest screens on the new layouts** (320 px, and 568×320 sideways): the step strip wraps instead of scrolling, numbers and tags don't overflow, and the code excerpt scrolls inside its own box only. *Owned by Task 5, then the sweep in Task 7.*

---

## Milestone 6: the All projects page

### Task 1: Links and the All projects page

**Files:**
- Modify:
  - `src/lib/links.ts`
  - `src/components/TopBar.astro`, `src/components/Footer.astro`
  - `src/components/Projects.astro`, `src/components/OtherProjects.astro`
- Create:
  - `src/pages/projects/index.astro`
  - `src/styles/all.css`
- Test:
  - `tests/unit/links.test.ts`
  - `tests/e2e/all-projects.spec.ts`
  - `tests/e2e/shell.spec.ts` (footer list)

**Interfaces:**
- Produces: `pageHref(p: { id: string; kind: 'course' | 'personal'; course?: string; main: boolean }): string`. It returns:
  - `/projects/<id>` for personal projects (`live-fpga-lab` included: its own page, unlike the home card);
  - `/courses/<course>/<id>` for main course projects;
  - `/courses/<course>#<id>` otherwise.
- Produces: `courseHref(course: string): string`, which returns `/courses/<course>`.
- Keeps `projectHref` (the home cards) unchanged.

- [ ] **Step 1: Failing tests.**
  - `links.test.ts`:
    - `pageHref` gives `/projects/live-fpga-lab` for the lab, `/courses/ece415/nbody` for N-body and `/courses/ece415#sobel` for Sobel;
    - `courseHref('ece333')` is `/courses/ece333`.
  - `all-projects.spec.ts`:

    ```ts
    // header counts are computed: 28 projects and 11 courses today
    await expect(page.locator('main h1')).toHaveText('Projects');
    await expect(page.locator('.counts')).toHaveText('28 projects and 11 courses');
    // personal first, then courses in report-card order (courses.order)
    await expect(page.locator('.personal a')).toHaveText(['Homelab', 'Live FPGA Lab', 'DVD Logo FPGA']);
    await expect(page.locator('.course > a.ch b')).toHaveText(['ECE494','ECE436','ECE433','ECE318','ECE321','ECE415','ECE455','ECE348','ECE338','ECE333','ECE340']);
    // ECE415: grade, main project first to its page, then the four smaller to their sections
    const ece415 = page.locator('.course', { has: page.locator('b', { hasText: 'ECE415' }) });
    await expect(ece415.locator('.g')).toHaveText('9.5');
    expect(await ece415.locator('li a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(
      ['/courses/ece415/nbody', '/courses/ece415#sobel', '/courses/ece415#kmeans', '/courses/ece415#conv', '/courses/ece415#clahe']);
    ```

    - Every `href` on the page has the shape `/projects/...`, `/courses/...` or `#...`.
    - Top-bar **Projects** is `#projects` on `/` and `/projects` on `/projects`.
    - The footer's first link is **Projects** → `/projects`.
    - Home has exactly two links with the text "See all 28 projects and 11 courses", at the end of `#projects` and of `#other`.
  - `shell.spec.ts`: the footer list becomes `['Projects', 'GitHub', 'LinkedIn', 'Email', 'Older portfolio']`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/links.test.ts && npx playwright test all-projects shell`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Counts:** the counts and the "See all" text come from `getGlanceStats` (Plan 1) and the courses collection, never typed in.
  - **Page layout:** a plain list, no cards.
    - Personal projects first, in project `order`.
    - Then one row per course: code, name and grade link to `courseHref`.
    - Under each course, its projects: the main project first, then the rest by `order`, each a link from `pageHref`.
  - **Trace:** the page uses `Base` with `data-trace="page"`. It starts at the `h1` and puts a pad on "Personal projects" and on "Courses" (two `h2`s).
  - **Width:** phone and desktop share one column, at most 65ch wide.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Gate and sweep.**
  - Add `/projects` to the page list in `tests/e2e/sweep.spec.ts`. The sweep loops over a `PAGES` array; the "name on the first screen" rule becomes "the page's `h1` on the first screen".
  - Run `npm run gate -- --pages /,/projects`. Expected: `GATE PASSED: 8/8`.
- [ ] **Step 6: Commit.** `feat: All projects page and links to it`. Push `build/pages`.
- [ ] **Step 7: Milestone review (M6).** Show Jason:
  - `/projects` at 390, 768, 1024 and 1440;
  - the gate report.

  **Stop until Jason approves.**

## Milestone 7: project pages

### Task 2: Content model for pages, and the fact test

**Files:**
- Modify: `src/content.config.ts`, `tests/unit/helpers/content.ts`
- Create: `src/lib/facts.ts`, `tests/unit/facts.test.ts`

**Interfaces:** all new `projects` fields are optional, and existing content keeps validating.
- Produces:
  - `numbers?: { value: string; label: string }[]`: at most 4, the key numbers.
  - `overview?: string`: one or two short paragraphs, plain text with blank-line breaks.
  - `steps?: { title: string; text: string }[]`: How it works.
  - `results?: { text: string; bars?: { label: string; value: number; display: string }[] }`
  - `code?: { file: string; lang: string; url: string; caption: string }`
    - `file` is under `src/content/code/`;
    - `url` is the GitHub blob URL at a pinned commit, with line anchors.
  - `gallery?: { src: image(); alt: string }[]`
- Produces: `numbersIn(text: string): string[]` in `src/lib/facts.ts`. It returns every number token: digits with optional `,` or `.` groups, then an optional `×` or `%`. Single digits are ignored.

- [ ] **Step 1: Failing test** in `facts.test.ts`, named "every number in project copy appears in the brief, the reports index or the approved mocks".
  - For every project file, take the `numbersIn` tokens of its body plus every frontmatter string.
  - Each token must occur in the concatenated text of:
    - `docs/PROJECT_BRIEF.md`;
    - `docs/REPORTS_INDEX.md`;
    - `docs/superpowers/mocks/styled-v6-glass/{index,project,course}.html`.
  - The failure message names the project and the token.
  - Add a second case that fails on a planted fixture string, `"4,242× faster"`, so the test is proven to bite.
- [ ] **Step 2: Run** `npx vitest run tests/unit/facts.test.ts`. Expected: FAIL (`numbersIn` is undefined).
- [ ] **Step 3: Implement** `numbersIn` and the schema fields. `numbers.max(4)`.
- [ ] **Step 4: Run** `npx vitest run`. Expected: all pass. If today's copy fails, each failure falls into one of two cases:
  - **A rounding of a sourced number**, for example "21×" from the brief's 21.49×. Record the rounded form next to the exact one in the brief (`21.49× (shown as 21×)`), so the source states it.
  - **A real gap.** Fix the copy and record a ruling.
- [ ] **Step 5: Commit.** `feat: page content fields and a test that every number has a source`.

### Task 3: Project page template

**Files:**
- Create:
  - `src/components/ProjectPage.astro`
  - `src/components/Toc.astro`, `src/components/KeyNumbers.astro`, `src/components/ResultBars.astro`
  - `src/components/Team.astro`, `src/components/PrevNext.astro`
  - `src/scripts/toc.ts`, `src/styles/project.css`
  - `src/pages/courses/[code]/[project].astro`, `src/pages/projects/[id].astro`
  - `tests/e2e/project.spec.ts`
- Modify: `src/components/Skills.astro`, adding props `heading?: string` and `intro?: string`. The defaults are Plan 1's.

**Interfaces:**
- Consumes: `pageHref`, `courseHref` (Task 1); the Task 2 fields; `<Skills entries self heading intro>`; `<Avatars handles>`.
- Produces: `<ProjectPage entry>`. Both routes render it:
  - `[code]/[project]` for the 7 main course projects;
  - `projects/[id]` for the 3 personal ones.

- [ ] **Step 1: Failing tests** in `project.spec.ts`, against `/courses/ece338/gpgpu` (strings from the mock) and `/projects/homelab`.
  - **Header (GPGPU):**
    - breadcrumb `ECE338 Parallel Computer Architecture / RISC-V GPGPU`, its first link → `/courses/ece338`;
    - `h1` `RISC-V GPGPU`;
    - lead `32 RISC-V cores we designed, running on a real FPGA`;
    - tags, in order: course and grade, `Team of 3`, `Live demo`, `Version 2 in progress`;
    - buttons `Run the demo` (→ `https://fpga.njason.dev`), `Code`, `Team repo`.
  - **Header (Homelab):**
    - no breadcrumb;
    - no `Run the demo` (only GPGPU, DVD Logo FPGA and Live FPGA Lab have one);
    - no Code button (the repo is private).
  - **Body:**
    - exactly 4 key numbers on GPGPU, each with its condition text;
    - the `h2`s in the body follow this order, filtered to those present: What it is, Why it's hard, How it works, Results, How we tested it, My part, What's next, Team;
    - the table of contents lists exactly those `h2`s, in order;
    - Results on GPGPU draws two flat bars, `129 µs` and `308 µs`, with no gradient.
  - **Navigation and team:**
    - the Tools section is limited to the project's own tools. Tapping `RISC-V` writes a line starting "Also used in";
    - Previous and Next follow the ten main projects' `order` and wrap at the ends. GPGPU's previous is DVD Logo FPGA (order 10) and its next is N-body on GPUs;
    - Team lists Jason first. On a solo project it lists only Jason.
  - **Trace and top bar:**
    - the trace has one pad per `h2` and starts at the `h1`;
    - the pill is visible from load.
  - **Phone layout:**
    - the table of contents is a strip that scrolls inside itself;
    - `document.documentElement.scrollWidth <= innerWidth`.
  - **Review Focus 1 (thin content):** for every main project page, the number of TOC entries equals the number of `h2`s, and no `h2` is followed directly by another `h2` or by nothing.
  - **Review Focus 3 (keyboard):** tabbing reaches every TOC link, focus is visible (an outline wider than 0), and Enter jumps the heading below the bar.
  - **No JavaScript:** every section is visible and the TOC links work as anchors.
- [ ] **Step 2: Run** `npx playwright test project`. Expected: FAIL (404).
- [ ] **Step 3: Implement.**
  - **Layout:** a sticky TOC column on desktop beside the body, above 1100 px of content width. The breakpoint is measured, like Plan 1's timeline (`toc.ts` marks the active section with `IntersectionObserver`).
  - **Phone:** a strip under the header.
  - **Content:**
    - body sections come from the Markdown `##` headings, rendered with `render(entry)`; the TOC comes from its `headings` at depth 2;
    - key numbers come from `numbers`;
    - the hero picture or video is `media`, with no blur on its caption (spec §11);
    - Tools come from the project's `tools`, through `buildSkillIndex` filtered to them, with `self = pageHref(project)`, the heading `Tools` and the mock's intro sentence.
  - **GPGPU copy:** paste the mock's text into `src/content/projects/gpgpu.md` as the body and `numbers`.
- [ ] **Step 4: Run** `npx playwright test project`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: project page template (GPGPU)`.

### Task 4: Copy for the other nine project pages

**Files:**
- Modify: `src/content/projects/{nbody,rambo,wifi,house,runtime,threads,live-fpga-lab,dvd-logo-fpga,homelab}.md`
- Modify: `docs/PROJECT_BRIEF.md`, for any new fact taken from a report, marked 📑 with its source.

- [ ] **Step 1: Failing test.** Extend `project.spec.ts` so that every one of the 10 page URLs returns 200 and has at least "What it is" and 2 key numbers. Projects without 2 sourced numbers are listed in the test with a reason, and Jason confirms them at M7.
- [ ] **Step 2: Run.** Expected: FAIL for the 9 pages without copy.
- [ ] **Step 3: Write** each body in the order of spec §5.2: what it is → why it's hard → proof → tech.
  - **Style:** short sentences, active voice, team work written as "we".
  - **Sources:** the brief first, then `docs/REPORTS_INDEX.md`. Read a report only to confirm or add a number, and add it to the brief first.
  - **RAMBO and Wi-Fi:** outcome-level only, as CLAUDE.md requires.
  - **Homelab:** categories only.
  - **Unknowns:** leave the section out and add a `TODO(jason): …` line to the brief's "Still open" list.
- [ ] **Step 4: Run** `npx vitest run && npx playwright test project`. Expected: PASS, including the fact test.
- [ ] **Step 5: Gate and sweep.**
  - Add `/courses/ece338/gpgpu`, `/courses/ece455/rambo` and `/projects/homelab` to the sweep's `PAGES`.
  - Run `npm run gate -- --pages /,/projects,/courses/ece338/gpgpu,/courses/ece415/nbody,/projects/homelab`. Expected: 8/8.
- [ ] **Step 6: Commit.** `feat: copy for the ten project pages`. Push.
- [ ] **Step 7: Milestone review (M7).** Show Jason:
  - three pages at 390 and 1440;
  - **every page's copy as text, for his review of facts and tone**;
  - the list of sections left out for lack of content;
  - the gate report.

  **Stop until Jason approves.**

## Milestone 8: course pages

### Task 5: Course page template

**Files:**
- Create:
  - `src/pages/courses/[code].astro`
  - `src/components/CourseProject.astro`, `src/components/StepStrip.astro`, `src/components/CodeExcerpt.astro`
  - `src/scripts/tabs.ts`, `src/styles/course.css`
  - `tests/e2e/course.spec.ts`
- Modify: `src/content/courses/ece415.json`, adding `intro` from the mock (it's already there) and `sequence: true` (already set).

**Interfaces:**
- Consumes: the Task 2 fields, `pageHref`, `<ResultBars>` (Task 3), `<Avatars>`, `<Skills>`.
- Produces: `<CourseProject entry main: boolean>`.
- Produces: `initTabs(root: HTMLElement): void`, implementing the WAI-ARIA tabs pattern with automatic activation.

- [ ] **Step 1: Failing tests** in `course.spec.ts`, mostly on `/courses/ece415`.
  - **Header:**
    - breadcrumb `Home / ECE415`, linking `/`;
    - `h1` `High Performance Computing`;
    - the intro is the mock's sentence;
    - the grade box shows `9.5`.
  - **Spacing:** the breadcrumb's top is 64 px below the bar on desktop (±4) and 40 px on phone (±4). The gap between breadcrumb and title is 14 px (±3).
  - **Step strip:**
    - ECE415 has 5 steps, in the order Sobel filter, K-means, CUDA convolution, CLAHE, N-body on GPUs;
    - `/courses/ece436` has no strip;
    - at 320 px the strip wraps (no element wider than its container) and the page doesn't scroll sideways;
    - there's no text matching `/Project \d of \d/` anywhere.
  - **Cards:**
    - there are 5, the main one first (`data-id="nbody"`);
    - N-body has `Read the full page` → `/courses/ece415/nbody`;
    - each card's `id` matches its project id (the hash targets).
  - **Tabs:**
    - each card offers Overview, How it works, Results and Code. A tab is hidden when its data is missing, and Report is hidden for every card while no PDF exists;
    - ArrowRight, ArrowLeft, Home and End move between tabs, and focus is visible;
    - with no JavaScript, every panel is visible one after another.
  - **Review Focus 2:** `/courses/ece415#clahe` lands with the CLAHE heading below the bar, its Overview tab selected and its section lit.
  - **Code:** the excerpt has a GitHub link whose URL contains a 40-character commit SHA. On phone, the excerpt scrolls inside its own box, and the page never scrolls sideways.
  - **Skills:** chips are only the course's tools.
  - **Team:** solo projects (ECE348) show Jason's avatar alone, with no "Solo" text.
- [ ] **Step 2: Run** `npx playwright test course`. Expected: FAIL (404).
- [ ] **Step 3: Implement.**
  - **Code excerpts:** `CodeExcerpt` renders `<Code code lang theme>` at build. The excerpt background is `--color-panel`, and the code colours must pass AA on it: the gate's contrast check enforces this.
  - **Tabs:** they start hidden only behind `html.js` (set by `tabs.ts`), so pages without JS show every panel.
  - **ECE333:** after Lab 4, the course page lists DVD Logo FPGA as a continuation linking to `/projects/dvd-logo-fpga` (spec §4).
  - **ECE415 copy:** paste the mock's ECE415 strings into the five projects' fields.
- [ ] **Step 4: Run** `npx playwright test course`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: course page template (ECE415)`.

### Task 6: Content for the other ten course pages

**Files:**
- Modify:
  - `src/content/courses/*.json` (`intro`, `sequence`)
  - `src/content/projects/*.md` (`overview`, `steps`, `results`, `code`)
- Create: `src/content/code/<id>.<ext>`, each starting with a comment that gives the repo, path and commit SHA.

- [ ] **Step 1: Failing test.** Extend `course.spec.ts`:
  - all 11 course URLs return 200;
  - every card has an Overview;
  - every `code.url` returns 200 from GitHub (checked once, in a unit test that `test.skip`s when offline).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Write** the copy under the same rules as Task 4.
  - **Code excerpts:** 10–25 lines each, fetched with `gh api repos/ACrispyCookie/<repo>/contents/<path>?ref=<sha>` from public repos only.
  - **Sequences:** set `sequence: true` only where the projects really build on each other: ECE415, and ECE333's labs if the brief supports it.
- [ ] **Step 4: Run** `npx vitest run && npx playwright test course`. Expected: PASS.
- [ ] **Step 5: Gate.** Add `/courses/ece415` and `/courses/ece333` to the sweep's `PAGES`, then run `npm run gate -- --pages /,/projects,/courses/ece415,/courses/ece333,/courses/ece338/gpgpu`. Expected: 8/8.
- [ ] **Step 6: Commit.** `feat: content for the eleven course pages`. Push.
- [ ] **Step 7: Milestone review (M8).** Show Jason:
  - ECE415 and ECE333 at 390 and 1440;
  - every course's copy as text;
  - each code excerpt with its link;
  - the gate report.

  **Stop until Jason approves.**

## Milestone 9: launch basics, and the whole site through the gate

### Task 7: 404, share image, sitemap, canonical, favicon; retire `/pill-test/`

**Files:**
- Create:
  - `src/pages/404.astro`
  - `scripts/og.mjs`, which writes `public/og.png`
  - `public/favicon.svg`; `public/apple-touch-icon.png`, made by `scripts/og.mjs`
  - `public/robots.txt`
  - `tests/e2e/seo.spec.ts`
- Modify:
  - `astro.config.mjs` (sitemap integration, excluding `/404`)
  - `src/layouts/Base.astro`: canonical, Open Graph and Twitter tags, favicon links
  - `package.json`: `og` script, which runs before `build`
  - `tests/e2e/motion.spec.ts`: "other pages show the pill at once" now uses `/projects`
- Delete: `src/pages/pill-test.astro`

**Interfaces:** `Base` gains an `image?: string` prop. It defaults to `/og.png`, and is always made absolute against `site`.

- [ ] **Step 1: Failing tests** in `seo.spec.ts`. On every page in `dist` (read the sitemap):
  - `link[rel=canonical]` is `https://njason.dev` + its path;
  - `og:title`, `og:description`, `og:url` and `og:image` are present, and `og:image` is absolute and returns 200;
  - `<title>` is unique across pages;
  - `/favicon.svg` and `/apple-touch-icon.png` return 200.

  Also:
  - `sitemap-index.xml` lists every page and not `/404`;
  - `robots.txt` names the sitemap;
  - `/404.html` has an `h1` and links to `/` and `/projects`;
  - `/pill-test/` is absent from `dist`.
- [ ] **Step 2: Run** `npx playwright test seo`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Share image:** 1200×630, made by sharp from an SVG in the site's style. The mask background, a copper trace with gold pads, "Jason Nikas", the hero sentence, and no photo.
  - **Favicon:** a gold pad on mask.
  - **404 page:** "This page isn't on the board". It's a short page with the trace starting at its title.
- [ ] **Step 4: Run** `npx playwright test seo`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: 404, share image, sitemap, canonical, favicon`.

### Task 8: Every page through the sweep and the gate

**Files:** Modify `tests/e2e/sweep.spec.ts`.

- [ ] **Step 1:** Set `PAGES` to every page in the sitemap, plus `/404`.
  - **Width sweep:** runs on every page.
  - **Shape sweep:** runs on one page of each type (`/`, `/projects`, one personal project, one course project, two course pages, `/404`) to keep the run under 15 minutes.
- [ ] **Step 2: Run** `npx playwright test sweep --project desktop`. Fix every finding at its root, with a test that fails first, and record each one as a ruling.
- [ ] **Step 3: Gate** `npm run gate`, over all built pages. Expected: `GATE PASSED: 8/8`, with every WARN fixed or defended in the report.
- [ ] **Step 4: Commit and push.** `test: every page through the sweep and the gate`.
- [ ] **Step 5: Milestone review (M9).** Show Jason:
  - a contact sheet: every page type at 390, 820×1180, 1180×820, 844×390 and 1440;
  - the gate report;
  - the Lighthouse table per page;
  - the launch checklist from spec §10, with what's still his. The checklist covers:
    - cleaned report PDFs;
    - the ECE415 Lab 5 archive with student IDs, which must be removed before launch;
    - figure approvals;
    - a current lab screenshot.

  **Stop until Jason approves.** Then run the final whole-branch review (executing-plans), then `superpowers:finishing-a-development-branch`.
