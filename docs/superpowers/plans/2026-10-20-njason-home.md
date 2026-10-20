# njason.dev: foundation and home page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Astro site's foundation, the full acceptance gate, and the complete home page, in five milestones that Jason sees one at a time.

**Architecture:** Static Astro 7 site with Tailwind 4 tokens taken from spec §6. Content lives in typed collections. Pure logic (stats, skills index, timeline scale, lab-widget state) is in `src/lib/` with Vitest tests. Browser behaviour (lab stream, copper trace, top-bar pill, skills chips) is plain TypeScript in `src/scripts/`, with no framework. One script, `npm run gate`, runs every tester the spec names and fails on any finding.

**Tech Stack:**
- Astro 7.4.1, TypeScript, Tailwind CSS 4.3.3 via `@tailwindcss/vite`, sharp, Fontsource (Bricolage Grotesque variable, Hanken Grotesk variable).
- Tests: Vitest 5.0.5 and `@playwright/test` 1.64.1, using the installed Chromium at `$HOME/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome`.
- Gate: Lighthouse 13.5.0, the taste skill's `inspect.mjs` and `lint.mjs`, and Impeccable `detect`.
- Install everything with `npm i -E`. If a peer range rejects a listed version, take the newest version the peer accepts and note it in the commit.

**Spec:** `docs/superpowers/specs/2026-10-20-portfolio-design.md`. Read it in full, plus `CLAUDE.md` and `docs/PROJECT_BRIEF.md`. The approved mock is `docs/superpowers/mocks/styled/` (`index.html`, `board.css`, `site.js`). Copy strings verbatim from the mock unless the spec changed them.

**Out of scope (Plan 2, written after home is approved):** project and course templates and their 21 pages, the 404 page, Open Graph image, sitemap, and the launch checklist.

## Global Constraints

- `output: 'static'`, `site: 'https://njason.dev'`. The only runtime network calls are `https://fpga.njason.dev/api/public/board/stream` and `…/api/public/board`.
- Never import, link or copy from `reports/` or `research/`. Media comes from `docs/superpowers/mocks/styled/` (already cleaned) or `media/`. Never publish `docs/GRADES.md`.
- Security projects (ECE455, ECE436): outcome-level copy only. Homelab: categories only; the skills chips may name the software, with no versions or layout.
- Never invent facts. Every number, grade, team and date comes from the brief or the mock. If something is missing, write `TODO(jason): …` and leave it unrendered.
- Colour tokens, exact values (Tailwind `@theme`, names fixed here):

  | Token | Value |
  |---|---|
  | `--color-mask` | `#0b1d21` |
  | `--color-panel` | `#11282d` |
  | `--color-raised` | `#183539` |
  | `--color-hover` | `#1f4248` |
  | `--color-silk` | `#eaf2f1` |
  | `--color-dim` | `#9db6b8` |
  | `--color-groove` | `#183539` |
  | `--color-copper` | `#3b7a82` |
  | `--color-cyan` | `#41e2f2` |
  | `--color-ink` | `#05252a` |
  | `--color-gold` | `#d8b46a` |
  | `--color-gold-ring` | `#a8873f` |
  | `--color-led` | `#5dffa8` |
  | `--color-mint` | `#86e3bd` |
  | `--color-amber` | `#f0a64a` (fault wording; my call, the spec names no value) |

- Type scale: exactly five text sizes plus the display name.

  | Token | Value |
  |---|---|
  | `--text-display` | `clamp(3.1rem, 5.6vw, 5.4rem)`, line-height .95, tracking -.035em, Bricolage 800 |
  | `--text-title` | `clamp(1.9rem, 3.2vw, 2.6rem)`, section h2 and big readout numbers, Bricolage 700 |
  | `--text-lead` | `1.3rem`, card headlines (as `<p>`, never above 24 px) and hero sentence |
  | `--text-body` | `1.0625rem` (17 px), line-height 1.6 |
  | `--text-small` | `.875rem`, tags, notes and captions. Nothing smaller than 13 px. |

- Paragraphs: `max-width: 65ch`.
- Radii: panels 22–28 px, pills 999 px.
- Surfaces: no `box-shadow` except `.menu-sheet` (marked `/* taste-skill-ignore: floats over the page */`), no gradients, no borders or hairlines, no `backdrop-filter`.
- Layout (spec §7.1):
  - content max 1200 px;
  - trace gutter 68 px with the trace at 18.5 px (desktop), 42 px with the trace at 11 px (≤760 px);
  - one left content edge;
  - page gutters 20/20 px desktop, 12/16 px phone, `max()` with safe-area insets.
- Motion: `transform` and `opacity` only. Every hidden starting state sits inside `@media (prefers-reduced-motion: no-preference)` behind a JS-added class, so pages without JS or with reduced motion are complete.
- Copy rules (spec §6): no eyebrow labels, no ALL-CAPS, no `→`, no middle-dot strings, no violet, no job-seeking text.
- Git: local repo only. No remote and no push until Jason says.
- Commit trailer:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01NQxq8JXEeYBtASMWUgc1ZT
  ```

## Review Focus

1. **The lab is unreachable, slow or returns odd data** (stream refused, `temperature_c: null`, `active_demo: null`, empty `demos`, a 60-character `name`). The widget shows "Status unavailable" or omits the field. It never invents a value, never overflows at 360 px, throws no console errors, and the trace pulse stays off. *Owned by Task 6.*
2. **JavaScript disabled.** Every section and the widget's static panel are fully visible, and nothing sits at opacity 0. *Owned by Task 7; assertions in Tasks 9 and 10 too.*
3. **Reduced motion.** No hidden text (the pill is `display:none`, not `visibility`), the trace is fully drawn, there's no pulse, and the LED doesn't breathe. *Owned by Task 7.*
4. **Arriving mid-page** via `/#contact`, `/#skills` or `/?tool=CUDA`. Every section above the viewport is switched on, the trace is drawn to the viewport, and the CUDA chip is pressed with its line shown. *Owned by Tasks 9 (`/#contact`) and 12 (`?tool=`).*
5. **Build while offline.** GitHub avatar fetches fail and cards show initials. The build still succeeds. *Owned by Task 8.*

---

## Milestone 0: foundation and gate (no Jason review needed; reported in the M1 message)

### Task 1: Repository, docs and project rules

**Files:**
- Create: `.git/` via `git init`
- Modify: `.gitignore`
- Rewrite: `docs/DESIGN_SYSTEM.md`
- Modify: `CLAUDE.md` (sections "Design direction" and "Workflow" step 2)

- [ ] **Step 1:** `git init -b main`. Set `.gitignore` to exactly these lines: `reports/`, `research/`, `docs/GRADES.md`, `node_modules/`, `dist/`, `.astro/`, `.taste-skill/`, `.gate/`, `test-results/`, `playwright-report/`.
- [ ] **Step 2:** Rewrite `docs/DESIGN_SYSTEM.md` from spec §6 and §7.1. Use the token and type tables in Global Constraints and the surface rules. Open the file with: "Source: docs/superpowers/specs/2026-10-20-portfolio-design.md §6. The older amber/Plex system is retired."
- [ ] **Step 3:** In `CLAUDE.md` "Design direction", make these changes:
  - Replace the "Live FPGA Lab spotlight: large hero-adjacent block…" bullet with the compact widget from spec §7.2.
  - Replace "colour-grouped by domain" pills with "pills in the raised tone; no domain colours".
  - Replace "Signature visual idea: pick ONE motif…" with "The circuit board: one copper trace with gold pads (spec §6, §7.3)".
  - Replace Workflow step 2's order with: hero (photo, name, widget, Now) → copper trace and At a glance → projects and personal projects → other projects and timeline → skills, contact and footer → project and course pages.
  - Add under Workflow: "Every milestone passes `npm run gate` before Jason sees it (spec §11)."
- [ ] **Step 4: Verify.** `grep -c "spec §6" docs/DESIGN_SYSTEM.md` returns ≥1. `grep -n "large hero-adjacent" CLAUDE.md` returns nothing. `git status` lists no files under `reports/`, `research/` or `docs/GRADES.md`.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "chore: init repo, retire old design system, align CLAUDE.md with approved spec"` with the trailer.

### Task 2: Astro scaffold, tokens, base layout, top bar and footer

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/TopBar.astro`, `src/components/Footer.astro`, `src/pages/index.astro` (shell), `src/assets/profile-fuji.jpg` (copied from `media/`)
- Create: `playwright.config.ts`, `vitest.config.ts`, `tests/e2e/shell.spec.ts`

**Interfaces:**
- Produces:
  - `Base.astro` props `{ title: string; description: string; home?: boolean }`;
  - a slot inside `<div class="wrap" data-trace><main>…</main><Footer/></div>`;
  - `TopBar.astro` props `{ current?: 'Projects'|'Timeline'|'Skills'|'Contact'; home: boolean }`;
  - CSS classes `.btn`, `.btn-primary` (silk fill), `.btn-live` (cyan fill), `.btn-secondary` (raised fill), `.tag`, `.panel`.
- Produces: `playwright.config.ts` with `webServer: { command: 'npm run build && npm run preview -- --port 4321', url: 'http://localhost:4321' }` and two projects:
  - `phone`: 390×844, `isMobile`, `hasTouch`;
  - `desktop`: 1440×900.

  Both use `launchOptions.executablePath = process.env.CHROME_PATH ?? <the chromium-1248 path>`.

- [ ] **Step 1: Write the failing test** `tests/e2e/shell.spec.ts`:
  - `test('home has doctype, title and one content edge')`:
    - the response text starts with `<!DOCTYPE html>` (case-insensitive);
    - `document.title === 'Jason Nikas'`;
    - `.topbar .name`, `main > *` and `.foot` share one left x (±1 px).
  - `test('top bar matches spec')`:
    - nav texts equal `['Projects','Timeline','Skills','Contact']`;
    - on `desktop`, `getComputedStyle(.topbar).backdropFilter === 'none'` and its background alpha is 1.
  - `test('footer links')`:
    - link texts equal `['GitHub','LinkedIn','Email','Older portfolio']`;
    - no link has `href` containing `fpga.njason.dev`.
- [ ] **Step 2: Scaffold.**
  - `npm create astro@7.4.1 -- --template minimal --typescript strict --no-install --no-git .`
  - `npm i -E astro@7.4.1 tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 sharp@0.35.5 @fontsource-variable/bricolage-grotesque@5.3.0 @fontsource-variable/hanken-grotesk@5.3.0`
  - `npm i -E -D @playwright/test@1.64.1 vitest@5.0.5 @astrojs/check@0.9.11 typescript lighthouse@13.5.0`
  - Scripts: `dev`, `build`, `preview`, `test:unit: vitest run`, `test:e2e: playwright test`, `gate: node scripts/gate.mjs`.
- [ ] **Step 3: Run** `npm run test:e2e -- shell.spec.ts`. Expected: FAIL, because the elements are missing.
- [ ] **Step 4: Implement the shell.**
  - `global.css`: `@import "tailwindcss"`, `@theme` with every token from Global Constraints, the font imports, and the body styles (`background: var(--color-mask); color: var(--color-silk)`).
  - Themed `::selection`, scrollbar, `:focus-visible { outline: 2px solid var(--color-cyan); outline-offset: 3px }`.
  - Top bar:
    - solid `--color-mask`;
    - sticky at `top: env(safe-area-inset-top, 0px)`;
    - Menu `<details>` at ≤760 px with sheet class `.menu-sheet` (the one allowed shadow);
    - the `.labpill` link (Task 7 adds its home behaviour).
  - Footer:
    - name;
    - ECE line;
    - the four links;
    - "© {year} Jason Nikas" and "Built with Astro, self-hosted";
    - separated by space and the `--color-panel` tone. No border.
- [ ] **Step 5: Run** `npm run test:e2e -- shell.spec.ts`. Expected: PASS on both projects.
- [ ] **Step 6: Commit.** `feat: astro scaffold, tokens, base layout, top bar, footer`.

### Task 3: The acceptance gate script

**Files:**
- Create: `scripts/gate.mjs`, `tests/e2e/contrast.spec.ts`

**Interfaces:**
- Produces: `npm run gate [-- --pages /,/courses/ece415]`.
  - Exit 0 only if every step passes.
  - Writes `.gate/report.md` with one section per tool.
  - Default pages: every `dist/**/index.html`, mapped to its URL.

- [ ] **Step 1: Write the failing test** `tests/e2e/contrast.spec.ts`.
  - Port the logic of `docs/superpowers/mocks/contrast.js` (the rendered-contrast audit used on the mock):
    - for every visible text node, compute the rendered colour against the nearest opaque ancestor background;
    - assert ratio ≥ 4.5, or ≥ 3 at ≥ 24 px (or ≥ 18.66 px bold).
  - On failure, print the selector and ratio.
- [ ] **Step 2: Implement `scripts/gate.mjs`.** It runs, in order, and stops at the end with a summary:
  1. `npm run build`
  2. `npx astro check`
  3. `npm run test:unit`
  4. `npm run test:e2e`, including the contrast spec.
  5. With `astro preview --port 4321` started in the background:
     - `node .claude/skills/design-taste-frontend/scripts/lint.mjs src` must exit 0;
     - for each page, `CHROME_PATH=… node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:4321<page> --out .gate/inspect<slug> --json` must exit 0. Collect its WARNs into the report under "WARNs to fix or defend".
  6. `${IMPECCABLE_BIN:-$HOME/.claude/plugins/cache/impeccable/impeccable/4.7.0/skills/impeccable/scripts/impeccable} detect --json <each page URL>` must return an empty findings array. Advisory notes count as findings too.
  7. `npx lighthouse <url> --chrome-path=$CHROME_PATH --only-categories=performance,accessibility,best-practices,seo --output=json --quiet --chrome-flags="--headless=new"`: every category score must be ≥ 0.90.
  8. Stop the preview server, also on failure.
- [ ] **Step 3: Run** `npm run gate`. Expected right now: the shell passes build, check and e2e. Record which inspector and Lighthouse findings remain on the near-empty shell, then fix the ones the shell can fix: footer, top bar, meta description, `lang`. The page-content findings (few pictures, empty screens) are allowed to fail until Task 5. Write this into `.gate/report.md` and the commit message, not into an allow-list.
- [ ] **Step 4: Commit.** `feat: acceptance gate runs every tester (spec §11)`.

---

## Milestone 1: hero (shown to Jason)

### Task 4: Content collections and computed numbers

**Files:**
- Create: `src/content.config.ts`, `src/content/projects/*.md` (27 entries), `src/content/courses/*.json` (11), `src/content/collaborators/*.json`, `src/data/timeline.json`, `src/data/now.json`, `src/lib/stats.ts`, `tests/unit/stats.test.ts`, `tests/unit/content.test.ts`

**Interfaces:**
- Produces: collection `projects` with fields from spec §8:
  - `slug`, `title`;
  - `kind: 'course'|'personal'`;
  - `course?: reference('courses')`;
  - `main: boolean`, `order: number`;
  - `headline: string`, `summary: string`;
  - `tools: string[]`;
  - `team: reference('collaborators')[]`;
  - `media?: { src: image(); alt: string; video?: string; position?: string }`;
  - `links: { repo?: string; teamRepo?: string; demo?: string }`;
  - `report?: string`;
  - `status?: 'in-progress'`;
  - `group?: string` (the home "Other projects" row text, 3–5 words);
  - `fromCourse?: string` (DVD: "From ECE333").
- Produces: `courses`:
  - `code`, `name`, `grade: number`, `intro?`, `sequence: boolean`, `order`;
  - `featuredProject: string` (the report-card link text).
- Produces: `collaborators`: `name`, `github`, `website?`.
- Produces: `getGlanceStats(projects: {main:boolean}[], courses: {grade:number; code:string}[], projectCourses: string[]): { total: number; main: number; smaller: number; highGrades: number }`. `highGrades` counts courses with `grade >= 9.5` that appear in `projectCourses`.

- [ ] **Step 1: Write failing tests.**
  - `stats.test.ts`: fed the real collections, `getGlanceStats` returns `{ total: 27, main: 10, smaller: 17, highGrades: 8 }`. Fed `[]`, it returns all zeros.
  - `content.test.ts`:
    - every `projects` entry's `tools` are non-empty strings;
    - every `team` ref resolves;
    - no entry's text contains an IPv4 pattern, `:\d{2,5}\b` ports, or the strings `VLAN`, `GRADES`, `TODO` inside a rendered field.
- [ ] **Step 2: Run** `npm run test:unit`. Expected: FAIL.
- [ ] **Step 3: Write the content.**
  - Titles, headlines, grades, teams and the 17 smaller projects come from `docs/superpowers/mocks/styled/index.html` and `docs/PROJECT_BRIEF.md`.
  - Tools per project come from the brief. They must cover every pairing in the mock's `site.js` `M` map.
  - Timeline entries come from the mock's timeline. Use `{ lane: 'education'|'work'|'teaching', title, sub, from: 'MM/YYYY', to: 'MM/YYYY'|'now', href? }`.
  - `now.json`: `[{ title: 'GPGPU v2', sub: 'Graphics, DDR, warp scheduling', href: '/courses/ece338/gpgpu', thumb: 'gpgpu-block' }, { title: 'Homelab', sub: 'Web, media, remote access, monitoring', href: '/projects/homelab', thumb: 'homelab-diagram' }]`.
  - Media: copy the mock's files from `docs/superpowers/mocks/styled/` into `src/assets/projects/`.
- [ ] **Step 4: Implement `getGlanceStats`** in `src/lib/stats.ts`.
- [ ] **Step 5: Run** `npm run test:unit`. Expected: PASS.
- [ ] **Step 6: Commit.** `feat: content collections and computed glance numbers`.

### Task 5: Hero layout (photo, name, sentence, buttons, Now rows)

**Files:**
- Create: `src/components/Hero.astro`, `src/components/NowRow.astro`, `src/components/icons/GitHub.astro`, `src/components/icons/LinkedIn.astro`, `tests/e2e/hero.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `now.json` (Task 4); `LabWidget.astro` slot (Task 6 renders into `<div class="side">`).
- Produces:
  - DOM: `.top > .lcol(.cover, .now[data-trace-start])` and `.top > .rcol(.who, .side)`;
  - `.who` holds `h1`, `p.does`, `p.school`, `.cta`.

- [ ] **Step 1: Write failing tests** in `hero.spec.ts`. Port `docs/superpowers/mocks/check-hero-overlap.js`:
  - widths 1440, 1280, 1100, 1024, 800, 760, 390 and 360;
  - no pairwise overlap among `.cover`, `.who`, `.side`, `.now`;
  - `scrollWidth <= innerWidth`.

  Also assert:
  - `.who p.does` text equals the spec §5.1 sentence exactly;
  - the CTA texts are `['See my projects','GitHub','LinkedIn']`, and the first has class `btn-primary` with `href="#projects"`;
  - at 1440 the `.cover` box is within 520–560 px wide, and the left and right columns' bottoms differ by ≤ 2 px;
  - at 390 the cover's aspect ratio is 1.25 ± 0.02;
  - the phone DOM visual order (top values) is cover < who < side < now.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Follow the mock's v6 layout (`board.css` blocks "v5" and "v6"; take the final effective values, not the layered overrides).
  - The photo uses `<Picture formats={['avif','webp']} widths={[360,560,820,1120]} sizes="(max-width:760px) 100vw, 50vw">`. Use `object-position: 50% 62%`.
  - Between 761 and 1100 px: `.lcol`/`.rcol` use `display: contents`, with areas `"cover who" "side side" "now now"`.
  - GitHub and LinkedIn logos are inline SVG with `aria-hidden`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: hero layout`.

### Task 6: Live lab widget with real data

**Files:**
- Create: `src/lib/board.ts`, `tests/unit/board.test.ts`, `src/components/LabWidget.astro`, `src/scripts/board-client.ts`, `tests/e2e/widget.spec.ts`

**Interfaces:**
- Produces: `type BoardEvent = { online: boolean; name?: string; fpga?: string; status?: string; mode?: string; temperature_c?: number|null; healthy?: boolean; faults?: string[]; active_demo?: string|null; queue_length?: number|null; demos?: unknown[]; updated_at?: string }`.
- Produces: `toWidgetView(e: BoardEvent | null, connected: boolean): WidgetView`, where:
  - `WidgetView = { state: 'online'|'project'|'fault'|'offline'; running: string; sub: string; queue: number|null; tempC: number|null; ledBreathing: boolean }`.
- Produces: `connectBoard(root: HTMLElement): void`. It:
  - opens `EventSource('https://fpga.njason.dev/api/public/board/stream')` only while `root` intersects the viewport;
  - listens with `addEventListener('board', …)`;
  - on `error` before the first event, does one `fetch('…/api/public/board')`;
  - renders `toWidgetView` into `[data-f="running"]`, `[data-f="sub"]`, `[data-f="queue"]` and `[data-f="temp"]`;
  - sets `root.dataset.state`;
  - dispatches `document` CustomEvent `board:status` with `{ online: boolean }`.

- [ ] **Step 1: Write failing unit tests** `board.test.ts`:
  - `toWidgetView(null,false)` → `{state:'offline', running:'Status unavailable', sub:'', queue:null, tempC:null, ledBreathing:false}`.
  - Online with `active_demo:'GPGPU n-body'`, `name:'Smart Zynq SL'`, `queue_length:1`, `temperature_c:47` → `{state:'online', running:'GPGPU n-body', sub:'on the Smart Zynq SL', queue:1, tempC:47, ledBreathing:true}`.
  - Online with `active_demo:null` → `running:'Idle'`.
  - `mode:'project'` → `state:'project', running:'In use for GPGPU testing'`.
  - `healthy:false` or non-empty `faults` → `state:'fault'`. `running` is the plain fault wording `'Board fault'` (my call). `ledBreathing:false`.
  - `temperature_c:null` → `tempC:null`, and the temp tag is hidden by the view.
  - `connected:false` with a last event → treated as offline.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement `toWidgetView`.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Write failing e2e** `widget.spec.ts`, using `page.route` on the stream URL to fulfil `content-type: text/event-stream` with `event: board\ndata: {…}\n\n`:
  - online → the running text is "GPGPU n-body" and `[data-state="online"]`;
  - route aborted on both URLs → "Status unavailable", zero `pageerror`, and the "Open the lab" link is still present;
  - a 60-character `name` at 360 px → no horizontal overflow;
  - with `javaScriptEnabled:false` → the static sentence and "Open the lab" are visible and the `[data-f]` fields are hidden.
  - The widget has no `box-shadow`, its title band's background is `rgb(65, 226, 242)`, and the band text colour is `rgb(5, 37, 42)`.
- [ ] **Step 6: Implement.**
  - `LabWidget.astro`:
    - the cyan band (LED, "Live FPGA Lab", four gold pins drawn as SVG circles);
    - the sentence from spec §7.2;
    - the "Running now" block;
    - "Open the lab" (`.btn-live`, `href="https://fpga.njason.dev"`) with the Queue and temperature tags;
    - the server-rendered state is the no-JS static panel.
  - LED breathing: a CSS animation on `opacity` 1 → .45 over 2.4 s, only under `[data-state="online"]` and `prefers-reduced-motion: no-preference`.
  - Load `board-client.ts` only from `index.astro`.
- [ ] **Step 7: Run** `npm run test:unit && npm run test:e2e`. Expected: PASS.
- [ ] **Step 8: Commit.** `feat: live lab widget on the public board stream`.

### Task 7: Top-bar pill on home, section switch-on fallbacks, no-JS and reduced motion

**Files:**
- Create: `src/scripts/pill.ts`, `tests/e2e/motion.spec.ts`
- Modify: `TopBar.astro`, `src/styles/global.css`

**Interfaces:**
- Produces: `initPill(board: HTMLElement, pill: HTMLElement): void`.
  - It adds the `hidden` attribute to `pill` while `board` intersects the viewport (rootMargin `-64px 0px 0px 0px`) and removes it otherwise, as in mock v5 (Jason: "keep it as it was").
  - The opacity fade-in runs only under `no-preference`.
  - Without JS the pill is visible.

- [ ] **Step 1: Write failing tests** `motion.spec.ts`:
  - home at scrollY 0: `.labpill` is not visible (`toBeHidden`). After scrolling the widget out, it's visible. On a non-home page it's visible at once. Until Plan 2 adds real pages, use `src/pages/pill-test.astro` with `<meta name="robots" content="noindex">`; Astro doesn't route files starting with `_`. Plan 2 deletes it.
  - `reducedMotion:'reduce'`: no element inside `main` has a computed `opacity < 1`, and no `.labpill` counts as visibility-hidden text (it's `display:none` via `[hidden]`).
  - `javaScriptEnabled:false`: no element inside `main` has `opacity < 1`.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Run** `npm run gate -- --pages /`. Fix every FAIL in the hero. Defend each remaining WARN in `.gate/report.md`.
- [ ] **Step 6: Commit.** `feat: home pill behaviour, motion-safe defaults`.
- [ ] **Step 7: Milestone review.** Screenshot `/` at 390 and 1440, including mid-scroll. Self-critique, fix the top issues, re-run the gate, then show Jason the gate report and the screenshots. **Stop until Jason approves.**

---

## Milestone 2: copper trace and At a glance (shown to Jason)

### Task 8: At a glance, report card and avatars

**Files:**
- Create: `src/components/Glance.astro`, `src/components/ReportCard.astro`, `src/lib/avatars.ts`, `scripts/fetch-avatars.mjs`, `tests/unit/avatars.test.ts`, `tests/e2e/glance.spec.ts`

**Interfaces:**
- Produces: `fetchAvatar(handle: string, fetchImpl?: typeof fetch): Promise<{ file: string | null; initials: string }>`.
  - It writes `src/assets/avatars/<handle>.jpg` from `https://github.com/<handle>.png?size=96`.
  - It returns `file: null` on any failure.
  - `initials` is the first letters of the collaborator's first and last name.
- Produces: `<Avatars handles={string[]} />` (used by cards in Task 9).

- [ ] **Step 1: Failing tests.**
  - `avatars.test.ts`: with a `fetchImpl` that rejects and the fixture collaborator `{ name: 'Ada Lovelace', github: 'ada' }`, the result is `{ file: null, initials: 'AL' }`. With a `fetchImpl` returning a 200 image, `file` is `src/assets/avatars/ada.jpg`.
  - `glance.spec.ts`:
    - the three readouts read "27", "4", "8" with the spec §5.1 sentences;
    - `details.rc` is closed by default and opening it shows 11 rows;
    - each grade bar's computed `background-image` is `none` (flat fill, no gradient).
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** `prebuild` runs `fetch-avatars.mjs`, which never exits non-zero. **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: at a glance, report card, build-time avatars with initials fallback`.

### Task 9: Copper trace, vias and section switch-on

**Files:**
- Create: `src/scripts/trace.ts`, `src/lib/trace-path.ts`, `tests/unit/trace-path.test.ts`, `tests/e2e/trace.spec.ts`

**Interfaces:**
- Produces: `buildTracePath(input: { railX: number; start: {x:number; y:number} | null; turnY: number; pads: number[] }): { d: string; padYs: number[]; vias: {x:number; y:number}[] }`.
  - Bends are 16 px radius.
  - Vias: two per pad at `(railX + 14, padY - 22)` and `(railX + 14, padY + 22)`, each with a 10 px copper stub drawn horizontally from the rail.
  - My call: the spec says "a few vias and short stubs at each pad".
- Produces: `initTrace(host: HTMLElement): void`. Port `docs/superpowers/mocks/styled/site.js` trace code, keeping:
  - the 0.12 lerp to 78% of the viewport;
  - the `pos += dt*0.52` monotonic pulse;
  - the ResizeObserver rebuild at most once per frame, only on a real width or height change;
  - `section.lit` switch-on with the 70% fallback.

  Changes from the mock:
  - On home, the pulse runs only while the last `board:status` was `online: true`.
  - Pads, vias and stubs are SVG.
  - The hidden starting state of a section (`opacity: 0; translate 16px`) applies only under `html.rv` and `prefers-reduced-motion: no-preference`.

- [ ] **Step 1: Failing tests.**
  - `trace-path.test.ts`:
    - `buildTracePath({ railX: 18.5, start: {x: 300, y: 700}, turnY: 726, pads: [800, 1200] })` gives a `d` starting `M300 700`, containing exactly two `Q` bends, and ending `V1200`;
    - `padYs` is `[800, 1200]`;
    - `vias` has length 4;
    - `start: null` gives a `d` starting `M18.5`.
  - `trace.spec.ts`: port `docs/superpowers/mocks/check.js` (all seven checks) for `/`. Also:
    - with the stream routed offline, the pulse path's opacity stays 0 over 2 s of scrolling;
    - `/#contact` loaded fresh has every `main > section` before `#contact` with class `lit`.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Run** `npm run gate -- --pages /`. Investigate the mock's "covered-text" FAIL. Check whether the sticky bar or a not-yet-lit section causes it (read `inspect.mjs`'s covered-text check), and fix the cause.
  - **Decision stop:** the "off-centre" check also has to pass. First read how `inspect.mjs` measures margins. Then try centring the 1200 px content column with the trace gutter outside it on desktop.
  - If the phone layout (gutter on the left only) can't pass without narrowing the phone content below 300 px, stop. Report to Jason with screenshots and the measured margins. Don't add an allow-list entry on your own.
- [ ] **Step 6: Commit.** `feat: copper trace with vias, section switch-on`.
- [ ] **Step 7: Milestone review** as in Task 7 Step 7. **Stop until Jason approves.**

---

## Milestone 3: projects (shown to Jason)

### Task 10: Project cards, personal projects and the Minecraft origin

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/OriginCard.astro`, `src/components/diagrams/{Runtime,Threads,Homelab}.astro` (SVG from the mock), `tests/e2e/projects.spec.ts`

**Interfaces:**
- Consumes: `projects`, `courses`, `<Avatars>`.
- Produces: `<ProjectCard project size: 'wide'|'large'|'compact'|'personal' />`.
  - The whole card is a link: a stretched link on the title. Its href is `/courses/<code>#<slug>` for course projects, `/projects/<slug>` for personal ones, and `https://fpga.njason.dev` for the Live FPGA Lab card.

- [ ] **Step 1: Failing tests** `projects.spec.ts`:
  - card order and sizes as spec §5.1 items 3–4;
  - the GPGPU card has a `.btn-live` "Run the demo" link to `https://fpga.njason.dev`;
  - at 390, no card headline (`p.head`) wraps past 2 lines, where line count = `height / line-height`, rounded;
  - no element in `#projects` has a non-`none` `box-shadow`, a non-zero border width, or a gradient `background-image`;
  - videos have `muted`, `playsinline` and a `poster`, and under `reducedMotion:'reduce'` they're paused.
  - Also: the Wi-Fi image is the cropped mock file (byte-equal to `docs/superpowers/mocks/styled/wifi.jpg` before optimisation, checked in a unit test on the asset source path).
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.**
  - If a headline needs 3 lines at 390, shorten it in content. Propose the new text to Jason in the milestone message, because headline copy is his.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Run** `npm run gate -- --pages /`. Find the cause of the mock's mis-detected eyebrow ("ECE433" above "Projects") and fix the markup.
- [ ] **Step 6: Commit.** `feat: project cards, personal projects, origin card`.
- [ ] **Step 7: Milestone review.** **Stop until Jason approves.**

---

## Milestone 4: other projects and timeline (shown to Jason)

### Task 11: Other projects and the compressed timeline

**Files:**
- Create: `src/components/OtherProjects.astro`, `src/components/Timeline.astro`, `src/lib/timeline.ts`, `tests/unit/timeline.test.ts`, `tests/e2e/timeline.spec.ts`

**Interfaces:**
- Produces: `monthsBefore(date: string, now: string): number`, where `'MM/YYYY'` and `'now'` map to 0.
- Produces: `compress(m: number, gap = { from: 15, to: 40, keep: 4 }): number`. It's piecewise linear:
  - identity at or below `from`;
  - `m - (to - from) + keep` at or above `to`;
  - linear in between.
- Produces: `layoutTimeline(entries, now: string): { months: number; events: { lane; top: number; span: number; …entry }[]; years: { label: string; top: number }[]; gap: { top: number; span: number } }`. Year labels inside the gap are dropped.
- The gap months are my call, from the mock: 15 = 07/2025 and 40 = 06/2023 when `now` is 10/2026. Compute them from `now` as "the months between 06/2023 and 08/2025", not as constants.

- [ ] **Step 1: Failing tests.**
  - `timeline.test.ts`:
    - `compress(10) === 10`;
    - `compress(50) === 29`;
    - `compress(27.5) === 17`;
    - `layoutTimeline(real data, '10/2026')` has `months === 65`, includes no `'2024'` year, and its gap starts within the 06/2023–08/2025 interval.
  - `timeline.spec.ts`:
    - Timeline comes before Skills in DOM order;
    - at 1440 the `#timeline` height is < 1000 px;
    - the gap is a transparent break in every lane (`background-image: none` everywhere in `#timeline`);
    - at 390 the rail list renders (`.tll` visible) and the lanes are hidden.
  - Other projects: 11 course cards, 17 rows; each row's href matches `/courses/<code>#<slug>`; no row has a border.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5:** `npm run gate -- --pages /`, then commit `feat: other projects, compressed timeline`, then the milestone review. **Stop until Jason approves.**

---

## Milestone 5: skills, contact and footer (shown to Jason)

### Task 12: Skills chips, contact card, page complete

**Files:**
- Create: `src/lib/skills.ts`, `tests/unit/skills.test.ts`, `src/components/Skills.astro`, `src/scripts/skills.ts`, `src/components/Contact.astro`, `tests/e2e/skills.spec.ts`

**Interfaces:**
- Produces: `buildSkillIndex(projects: { slug: string; title: string; tools: string[]; courseCode?: string; href: string }[], opts: { coursework: string[]; vocabulary: string[] }): SkillEntry[]`, where:
  - `SkillEntry = { tool: string; count: number; usedIn: { title: string; courseCode?: string; href: string }[]; coursework: boolean }`;
  - entries are sorted by `count` descending, then by `tool` in A–Z order;
  - `vocabulary` (the brief's skills list) adds count-0 tools.
- Produces: `<Skills entries self?: string />` and `initSkills(root: HTMLElement): void`.
  - The first 14 show, then "Show all N" / "Show fewer".
  - Tapping sets `aria-pressed` and writes the line: "Used in A (ECE415), B and C." On a project page it reads "Also used in …" or "Only this project uses it so far."
  - Coursework tools write "From coursework that isn't on this site."
  - The hint "Tap a tool to see where I used it." shows until a tap.
  - `?tool=` preselects.
  - The line separates from the chips by space, not a border.

- [ ] **Step 1: Failing tests.**
  - `skills.test.ts`:
    - CUDA has `count === 3`, with usedIn titles `['N-body on GPUs','CUDA convolution','CLAHE']`;
    - Traefik's usedIn includes Homelab;
    - MySQL's usedIn is Minecraft plugins, with href `https://acrispycookie.dev`;
    - MATLAB is `coursework: true` with `count: 0`;
    - the ordering is stable.
  - `skills.spec.ts`:
    - a real tap (phone) or click (desktop) on the first chip sets `aria-pressed="true"` and the line text starts "CUDA";
    - "Show all 38" reveals every chip;
    - `/?tool=CUDA` loads with the CUDA chip pressed;
    - the intro line matches spec §7.4;
    - Contact rows are `['GitHub','LinkedIn','Older portfolio']` in that order, with no `fpga.njason.dev` link;
    - the Copy button copies the email or, if the clipboard is refused, selects it.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Full gate.** `npm run gate`. Every tester passes on `/`. The report lists any WARN with its defence.
- [ ] **Step 6: Commit.** `feat: skills chips and contact; home page complete`.
- [ ] **Step 7: Milestone review.** Show Jason:
  - the full home page at 390 and 1440;
  - the gate report;
  - the Lighthouse scores;
  - any headline rewrites proposed in Task 10.

  **Then write Plan 2** (project and course templates and launch) from the spec and what home taught us.
