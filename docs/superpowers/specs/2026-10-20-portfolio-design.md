# njason.dev — design

Status: approved by Jason (2026-10-20), including the acceptance gate in section 11.

Sources this document builds on (read them, they are not repeated here):

- `docs/PROJECT_BRIEF.md`: every fact, number, grade, collaborator and decision, with ✅/❓ marks. It is the content truth. When this document and the brief disagree on a fact, the brief wins.
- `PRODUCT.md`: audience, positioning, principles.
- `CLAUDE.md`: stack, content rules, privacy and security rules, workflow.
- `.impeccable/surfaces/src-pages-index-astro.md`: the visual direction contract.
- Approved mocks, saved in `docs/superpowers/mocks/`:
  - `wireframe/`: structure and content order (index, project, course).
  - `styled/`: the approved look and behaviour (index, project, course, `board.css`, `site.js`). Published at https://claude.ai/artifact/WaA48oCosrJ1nbBZEPsB2c (v6, artifact version 7, the version Jason approved on 2026-10-20). `gen.py` and `gen2.py` regenerate the mock pages.
  - `check.js`, `check-hero.js`, `check-hero-overlap.js`: the Playwright checks used to approve the mock (section 7.3).
  - `styled-v6-glass/`: a frozen copy of the approved v6 look (dot grid, ringed widget, glass top bar). Jason keeps it as an alternative; the build follows this document, which replaces those three (section 6, 7.2, 11).

## 0. Precedence and process

- **This document supersedes `docs/DESIGN_SYSTEM.md`**, which describes an older, rejected direction (amber, Plex, mono labels, domain-coloured pills).
  - The plan's first task rewrites `DESIGN_SYSTEM.md` from section 6, so CLAUDE.md's rule that "DESIGN_SYSTEM.md wins on tokens" points at the right values.
  - *My call.*
- **CLAUDE.md's "Design direction" is partly out of date** (it asks for a large Live FPGA Lab spotlight block, domain-coloured pills and a different section order). Where it differs, this document wins. The plan's first task also updates those CLAUDE.md lines so future sessions aren't misled. *My call.*
- **Build workflow:** CLAUDE.md's workflow still applies. The site is built one section at a time, each checked with Playwright at 390 and 1440 and shown to Jason before the next. The plan is a sequence of gated milestones, not one continuous build.

## 1. Intent

A personal portfolio for Jason Nikas, an undergraduate ECE student at the University of Thessaly. It shows his work from software down to hardware.

Readers:

- **Recruiters and hiring managers come first.** They skim for 30–60 seconds, often on a phone. In the first screen they must learn who he is. In one scroll they must see why the main projects are impressive.
- **Engineers come second.** They open a project or course page for real depth.

What makes the site different: a live widget shows a real FPGA board in Jason's homelab, running his team's RISC-V GPGPU right now. Visitors can open the lab and use the board.

The site is a showcase only. It carries no job-seeking or availability message anywhere.

## 2. Goals, non-goals, anti-goals

**Goals**

- Within one screen: name, photo, the ECE line and the live board.
- Within one scroll: the main projects, each with one accurate headline number.
- Every project explained in depth on its course page or its own page: pictures, how it works, results with their conditions, code, report.
- One coherent visual world on every page: the circuit board (section 6).
- Excellent at 390 px and 1440 px. Readable without JavaScript. WCAG AA.

**Non-goals for this version**

- Light theme (dark only, Jason).
- CV download (keep a hidden slot).
- A 3D object in the hero.
- KoukBot.
- A blog.
- A contact form.
- Translations.

**Anti-goals (Jason): a polished result that fails if it is**

- **Too packed:** too much on screen at once.
- **Too generic:** looks like a template portfolio.
- **Too "hacker":** terminal green, monospace everywhere, neon on black.
- **Inaccurate:** any invented or rounded-up number, grade, collaborator or role.

## 3. Constraints

- **Stack**
  - Astro + Tailwind CSS, TypeScript, `output: 'static'`, `site: 'https://njason.dev'`.
  - Self-hosted from `dist/` behind Jason's reverse proxy.
  - Content in typed Astro content collections. No React unless a component truly needs it.
- **Runtime calls:** the only runtime network calls are to the Live FPGA Lab's public endpoints (section 7.2). GitHub avatars are fetched at build time, with an initials fallback.
- **Privacy and security:** follow the rules in CLAUDE.md, especially:
  - ECE455 and ECE436 are described at outcome level only. For example, the Wi-Fi chart's driver-settings caption was cropped off in the mock.
  - Homelab: categories only. No IPs, hostnames, ports, versions or topology.
  - `reports/`, `research/` and `docs/GRADES.md` are never published.
- **Reports:** PDFs appear on course pages only as cleaned copies that Jason supplies (section 5.4).
- **Report figures:** used only after Jason approves each one. Repo media may be used.
- **Accessibility and robustness**
  - WCAG AA contrast, visible focus and alt text.
  - `prefers-reduced-motion` respected.
  - Content fully readable with JavaScript off.
- **Performance:** Lighthouse 90+ in every category on the home page.

## 4. Site structure (decided)

**URLs and page types**

| Page | URL | Content |
|---|---|---|
| Home | `/` | Section 5.1 |
| Course page | `/courses/<code>` (e.g. `/courses/ece415`) | Every project of that course, each in full (section 5.3) |
| Course project page | `/courses/<code>/<project>` | Only for the main course projects (section 5.2) |
| Personal project page | `/projects/<name>` | Live FPGA Lab, DVD Logo FPGA, Homelab (section 5.2) |
| All projects | `/projects` | Every project and course on the site, as a list (section 5.4a; Jason, 2026-10-21) |

**Which projects get their own page:** only the ten main projects.

- **Seven course projects:**
  - GPGPU (ECE338)
  - N-body (ECE415)
  - RAMBO (ECE455)
  - Wi-Fi jammer (ECE436)
  - 3D house (ECE433)
  - Distributed runtime (ECE348 assignment 4)
  - User-level threads (ECE321 P4)
- **Three personal projects:** Live FPGA Lab, DVD Logo FPGA, Homelab.

Everything else is a section on its course page only. That includes homeworks and assignments, such as ECE338 HW1–3, ECE433 HW1–2 and the ECE436 assignments.

**Course pages:** one per course with a project on the site. There are 11: ECE338, ECE415, ECE455, ECE436, ECE433, ECE348, ECE321, ECE318, ECE494, ECE333, ECE340.

**All projects page (Jason, 2026-10-21)** — section 5.4a
- A plain list, no cards: a header with the counts ("28 projects · 11 courses", computed), then **Personal projects** (Homelab, Live FPGA Lab, DVD Logo FPGA → their pages), then the **11 courses** in home order. Each course is a row: code, name and grade linking to the course page; its main project first (→ project page), then its smaller projects (→ their course-page sections).
- No tool filter (Jason: fine without it).
- **Reached from:** a "See all 28 projects and 11 courses" link at the end of the home Projects section and under Other projects; a footer link named **Projects** on every page; the top-bar **Projects** link, which jumps to `#projects` on home and opens `/projects` on every other page.

**Linking**

- **Home course cards** go to the project's section on its course page (`/courses/ece415#nbody`).
- **Course sections that have a full page** show "Read the full page".
- **Course project pages** start with a breadcrumb back to the course.
- **Course pages** start with the breadcrumb "Home / ECE415" (the code of that course), linking home (Jason, 2026-10-20: "Projects" was the wrong label).
- **DVD Logo FPGA:** the ECE333 course page lists it after Lab 4 as a continuation, linking to `/projects/dvd-logo-fpga`.
- **Minecraft plugins:** no page; only links to https://acrispycookie.dev.

**Top bar, on every page**

- Contents:
  - the name, linking home;
  - links to Projects, Timeline, Skills and Contact (home anchors);
  - a "Live FPGA Lab" pill with a status dot, linking to https://fpga.njason.dev ("Live Lab" below 760 px, next to Menu).
- **On home the pill starts hidden**, so the hero widget and the pill never show together. It fades in once the widget is no longer on screen and hides again when it returns (Jason, 2026-10-20: "keep it as it was"). It's visible from the start on project and course pages.
- Below 760 px the links fold into a Menu sheet.
- The bar sticks to the top on scroll. It is **solid**, the page colour, fully opaque, with no blur (Jason, 2026-10-20).

**Footer, on every page**

- Name and ECE line.
- Links: GitHub, LinkedIn, Email, Older portfolio (acrispycookie.dev). No Live FPGA Lab link (Jason: too repetitive).
- A plain closing block separated by space and a tone step (no hairline, no card), so Contact stays the last card.
- "© <year> Jason Nikas" and "Built with Astro, self-hosted".

## 5. Pages

### 5.1 Home, in this order

1. **Hero.** Two columns on desktop, matching heights (as in the mock, approved by Jason 2026-10-20).
   - **Left column:**
     - the cover photo (`media/profile-fuji.jpg`). It may crop a little to match the right column (about 538 × 566 px at 1440 px wide); on phone it's 5:4.
     - under it, "Currently working on" with two compact rows, each a whole-row link:
       - GPGPU v2: "Graphics, DDR, warp scheduling", to `/courses/ece338/gpgpu`;
       - Homelab: "Web, media, remote access, monitoring", to `/projects/homelab`.
   - **Right column:**
     - "Jason Nikas", very large, in two lines;
     - one sentence on what he does: "I build systems from code down to hardware: GPUs on FPGAs, CUDA programs, filesystems and distributed runtimes." (Jason approved it);
     - smaller: "Electrical and Computer Engineering student at the University of Thessaly";
     - buttons: **See my projects** (primary, to `#projects`), GitHub and LinkedIn (secondary, with their logos). On phone, See my projects spans the full width with the other two side by side under it.
     - the compact live lab widget (section 7.2).
   - **Between 761 and 1100 px:** photo (300 px square) beside the name block; the widget and the Now rows full width below.
   - **Phone order:** photo, name block, widget, Now rows.
2. **At a glance.**
   - Three readouts:
     - "28 projects on this site, 10 main and 18 smaller" (ECE333 Lab 1 added, Jason 2026-10-21);
     - "4 volunteer lab-assistant roles since 2025" (Jason, 2026-10-21: lab assistant, the clearer title);
     - "8 courses graded 9.5 or higher, each with a project on this site".
   - Under them, a folded "Course grades" report card. It opens to the 11 courses, each with a grade bar and a link to its project (the list is in the brief).
3. **Projects.**
   - GPGPU as a full-width card, with:
     - headline "32 RISC-V cores we designed, running on a real FPGA";
     - supporting line: 2.38× vs the ARM core on the same chip; colleagues use it on the Smart Zynq SL; runs live in the lab;
     - a Run the demo button.
   - Then N-body, RAMBO, Wi-Fi jammer and 3D house as large cards, two per row.
   - Then Distributed runtime and User-level threads as compact horizontal cards, two per row.
   - Headlines are in the brief and the mock.
   - No outlines are used for emphasis (Jason): hierarchy comes from size.
4. **Personal projects.**
   - Live FPGA Lab, DVD Logo FPGA (tag "From ECE333") and Homelab.
   - Then a compact "Where I started: Minecraft plugins" card linking to acrispycookie.dev.
5. **Other projects.**
   - The 18 smaller projects, one card per course, with the projects as rows inside (name plus 3–5 words).
   - Each row links to its course-page section.
6. **Timeline** (before Skills; Jason swapped them).
   - Three lanes: Education, Work, Teaching.
   - On desktop, bar lengths are proportional to time, except the quiet stretch from 06/2023 to 08/2025, which is shortened to about 4 months behind a break: a plain gap in every lane's bar and line (no stripes or gradient). The 2024 label is dropped. On phone, three git-graph rails.
   - Entries and dates are in the brief, including High school 09/2019 – 06/2022 (confirmed). Projects are not on the timeline.
7. **Skills explorer** (section 7.4).
8. **Contact card.**
   - Left: one line and the email, large, with a Copy button.
   - Right: rows for GitHub, LinkedIn and, last, **Older portfolio** (acrispycookie.dev). No Live FPGA Lab row.

### 5.2 Project page (template)

Example: the GPGPU in `mocks/styled/project.html`. Jason approved this layout.

- **Header:**
  - breadcrumb (course pages only);
  - title and headline;
  - tags: course and grade, team size, Live demo, In progress where true;
  - buttons: Run the demo (lab projects), Code, Team repo (where one exists).
- **One large picture or video.**
- **Four key numbers,** each with its condition in words.
- **Sections:**
  - What it is
  - Why it's hard
  - How it works (with a figure when one is approved)
  - Results (numbers with conditions, a chart drawn from the data)
  - How we tested it
  - My part
  - What's next (where true)
  - Team (avatar, name, links)
- **A sticky list of the sections** on desktop, a sideways strip on phone.
- **The skills explorer,** limited to this project's tools.
- **Previous and next project.**

Sections with no true content are left out. They are never padded.

### 5.3 Course page (template)

Example: ECE415 in `mocks/styled/course.html`.

- **Header:** breadcrumb "Home / <code>", course name, a one-line intro and a grade box. No team in the header, because teammates can differ per project.
  - Spacing (Jason: the header was cramped): about 64 px above the breadcrumb on desktop and 40 px on phone, and a clear gap (about 14 px) between breadcrumb and title.
  - No "Project 1 of 5" labels above project titles (eyebrow rule); the order shows in the step strip.
  - The step strip never scrolls sideways on phone; it wraps or stacks.
- **Step strip:** only when the projects form a sequence, as ECE415's do. Other courses just list their projects.
- **One card per project, main project first.** Each card has:
  - title, headline number and tools;
  - its own team (tag plus avatars, or "Solo");
  - buttons: Code, Report, and Read the full page where one exists;
  - five tabs: Overview (gallery and description), How it works (steps and a figure), Results (chart and conditions), Code (a highlighted excerpt with a GitHub link), Report.
- **Tabs without JavaScript:** all five panels show one after another.
- **Missing content:** a tab with no real content is hidden. The project never shows placeholder text.
- **The skills explorer,** limited to the course's tools.

### 5.4 Reports

- The course-page Report tab shows the PDF's first page as a thumbnail, with "Read the report" and "Download".
- **Only cleaned PDFs that Jason supplies are published.** Cleaned means no student IDs, no other students' full names beyond the confirmed collaborators, and no professor comments or course handouts.
- **Where the files live:** in a separate, committed folder such as `public/reports/<code>/<project>.pdf`. They are never copied from `reports/`.
- **Until a file exists,** the Report tab and button are hidden for that project.

## 6. Visual world: the circuit board (decided)

The whole site is one dark circuit board. The live lab widget is the powered part on it, and a copper trace carries the current from the widget through every section.

- **Colour tokens** (dark only; names are the builder's):

  | Role | Value |
  |---|---|
  | Ground (solder mask) | `#0b1d21` |
  | Panel | `#11282d` |
  | Raised | `#183539` |
  | Hover | `#1f4248` |
  | Text | `#eaf2f1` |
  | Secondary text | `#9db6b8` |
  | Trace, not yet drawn | `#183539` |
  | Trace, drawn | `#3b7a82` |
  | Cyan (live and primary actions only) | `#41e2f2` |
  | Text on cyan | `#05252a` |
  | Gold pads | `#d8b46a` |
  | Gold pad ring | `#a8873f` |
  | Status LED | `#5dffa8` |
  | Teaching lane | `#86e3bd` |

  - Depth comes from the three mask shades only: no borders, rings, shadows or glows on anything at rest (taste linter). The Menu sheet, which really floats, is the one shadow, marked as an allowed exception.
  - The ground is plain solder mask. **No dot grid** (Jason, 2026-10-20). Instead, a few drawn vias (small plated holes) and short copper stubs sit beside the trace at each pad, so the board detail stays attached to the trace. Drawn in SVG with the trace, not a page-wide pattern.
  - Gold pads, pins and dots are drawn as solid shapes or SVG, never as inset shadows.
  - No gradients anywhere, including the report-card grade bars (flat fills).
- **Type:**
  - Bricolage Grotesque (display: name, headings, numbers) and Hanken Grotesk (text). Self-host both.
  - Name: about 86 px in two lines, line-height about 0.95. Body: 17 px, line-height 1.6.
  - Monospace only inside code excerpts.
  - Tabular numbers throughout.
- **Shape:**
  - Pill buttons and tags; panels 22–28 px radius; round gold pads.
  - The trace has rounded 16 px bends.
- **Buttons:**
  - Primary: off-white fill.
  - Live or demo: cyan fill.
  - Secondary: a filled raised tone (no outline ring).
- **Tags:** pill, raised shade.
- **Browser surfaces:** themed selection, scrollbar, focus ring (cyan outline) and underline offset.
- **Pictures:**
  - Real media from Jason's own public project repos (README and `docs/` images), as in the mock. These are repo media, not report figures, so they need no per-figure approval. Jason left pictures to us (2026-10-20).
    - They are re-exported cleanly into `src/assets/`, never imported from `research/`.
    - Captions or labels that break the security rules are cropped off, e.g. the Wi-Fi chart's driver-settings line.
    - *My call.*
  - Report figures (from `reports/`) still need Jason's approval, one by one. Diagram screenshots may be colour-shifted to fit; photographs are never tinted.
  - Projects without a picture get a simple drawn diagram in the palette, for example the runtime, threads and homelab drawings in the mock.
- **Taste rules, to keep:**
  - no eyebrow labels;
  - no ALL-CAPS labels;
  - no "→" on links;
  - no middle-dot meta strings;
  - no gradient text;
  - no coloured side stripes;
  - no violet;
  - no generic fade-up animation on sections (the trace-driven switch-on in 7.3 is the single exception).

## 7. Components and behaviour

### 7.1 Layout grid

- Content max width is 1200 px, centred.
- Every page has **one left content edge**. A gutter to its left holds the trace:
  - desktop: 68 px gutter, trace at 18.5 px;
  - phone (≤760 px): 42 px gutter, trace at 11 px.
- **Page gutters:**
  - Desktop: 20 px on both sides.
  - Phone: 12 px on the left, 16 px on the right.
  - Safe-area insets are respected.
- The top-bar name, hero, sections and footer all start on that one content edge.
- **Changed by Jason (2026-10-21):** only what runs beside the trace sits in its gutter. The top bar, hero and footer are centred with equal margins; the sections beside the trace start one gutter in. On desktop and tablet the gutter is mirrored on the right, so everything shares one edge there; on phone the hero, top bar and footer sit 16 px from both edges and the sections 58 px from the left. Phone page gutters are 16 px on both sides.

### 7.2 Live lab widget (the signature)

- **Checked live by the reviewer:** the endpoint returns every listed field with CORS for https://njason.dev. The stream sends a **named `board` event** (listen with `addEventListener('board', …)`, not `onmessage`) about every 2 s, with `retry: 5000`.
- **Data source:** `GET https://fpga.njason.dev/api/public/board/stream` (Server-Sent Events, about one event every 2 s). If SSE fails, one `GET /api/public/board`.
  - CORS already allows https://njason.dev.
  - Fields: `online`, `name`, `fpga`, `status`, `mode`, `temperature_c`, `healthy`, `faults`, `active_demo`, `queue_length`, `demos`, `updated_at`.
  - The stream opens only while the widget is on screen.
- **Compact** (Jason, 2026-10-20: the large widget took too much of the hero). It shows only:
  - a **flat cyan title band** across the top of the widget with dark text: LED, "Live FPGA Lab" and the gold pin header. This band, not a ring or shadow, is what makes the widget the one powered part on the board (Jason, 2026-10-20);
  - the status LED **breathes** (opacity only, slow) while the board is online and the stream is connected. It is grey and still when offline, and still under reduced motion;
  - one plain sentence: "A real FPGA board in my homelab. Anyone can run demos on it from the browser.";
  - a "Running now" block: the demo name in cyan and "on the Smart Zynq SL" (or "Idle", or "In use for GPGPU testing" when `mode` is `project`);
  - "Open the lab", the cyan primary button, with small Queue and temperature tags.
  - No meters, temperature chart or demo list; those live on the lab itself.
- **States:**
  - **online:** as above.
  - **fault:** amber wording; no fake values.
  - **offline or stream unavailable:** grey LED, "Status unavailable", "Open the lab" still shown.
  - **no JavaScript:** a static panel saying what the lab is, with "Open the lab".
- **Never shows invented values.** The mock's values are example states.

### 7.3 The copper trace

- One path per page, drawn as an SVG overlay behind the content.
  - **Home:** starts under the "Currently working on" rows (left column), goes down, bends left, then runs down the gutter.
  - **Project and course pages:** starts at the title.
  - **On every page:** passes a gold pad at every section heading and ends at the last one, which is Contact on home.
- **It never crosses a card, picture or panel.**
- **Scroll drawing:**
  - The not-yet-reached part shows as a faint groove.
  - As you scroll, the copper draws down to about 78% of the viewport height, with easing.
  - Each pad lights gold when the copper reaches it.
- **Pulse:** a short cyan pulse travels at a steady speed from the start to the furthest drawn point, then starts again. It never jumps.
  - *My call:* on the home page the pulse runs only while the board is online and the stream is connected, so the current visibly comes from the live board. On other pages it always runs.
- **Rebuilding:** recompute the path only when the page's size really changes, at most once per frame. Never on scroll, and never from the phone address bar showing or hiding.
- **Sections switch on with the trace:** when the copper reaches a section's pad, its heading brightens from secondary to full text colour and its content rises 16 px into place (opacity and transform only, about 450 ms, children staggered 70 ms). As a fallback a section also switches on once its top is 70% up the screen, so nothing ever stays hidden. This is the trace's own effect, not a generic fade-up: it's the one orchestrated motion on the page. Without JavaScript or with reduced motion, everything is simply visible.
- **Reduced motion:** the whole trace is drawn with all pads lit and no pulse.
- **Without JavaScript:** no trace. The layout stays identical.
- **Acceptance:** `mocks/check.js` must pass on every page at 390 px (mobile emulation) and 1440 px. It checks:
  - one content edge;
  - the trace clear of content;
  - a gap of at least 28 px between trace and content;
  - no pulse jumps while scrolling;
  - no horizontal overflow;
  - no script errors;
  - a real tap on a skill chip selects it.
- **Also:** `mocks/check-hero-overlap.js` (no hero blocks overlap and no sideways scroll at 360–1440 px, eight widths) and `mocks/check-hero.js` (photo size, pill hidden at the top and shown after scrolling, every section switched on by the end). Test pages must carry `<!doctype html>`: quirks mode hid a 590 px phone overflow once.

### 7.4 Skills explorer

- **Layout** (v4, Jason found the two-panel version bloated and hard on phone):
  - One wrapped block of chips, no groups (Jason rejected categories). Each chip carries a small count of the projects on this site that use it; chips are sorted by that count.
  - The first 14 show, then "Show all N" / "Show fewer".
  - Tapping a chip shows **one line** under the chips: "Used in X (COURSE), Y and Z." with the projects as links. Nothing is preselected; until a tap the line says "Tap a tool to see where I used it."
  - Intro line: "Tools from my projects. The number is how many projects on this site use each one."
- **Where it appears:**
  - **Home:** all tools.
  - **Project page:** that project's tools. The line lists the *other* projects ("Also used in …", or "Only this project uses it so far.").
  - **Course page:** the course's tools.
  - A link with `?tool=<name>` preselects a tool.
- **Data:** "used in" is derived from each project's `tools` list in the content collection. Nothing is hand-mapped. The skills list in the brief is the starting vocabulary.
- **Decisions (Jason, 2026-10-20):**
  - Homelab-only tools (Traefik, Nginx, WireGuard, Pi-hole, Ansible, Proxmox) **link to Homelab**. Naming the software is fine. Versions, hosts, IPs, ports, VLANs and layout stay hidden.
  - Java, Maven, Gradle and **MySQL** link to the Minecraft plugins card (acrispycookie.dev).
  - MongoDB, PostgreSQL and MATLAB stay as chips. Tapping one shows that they come from coursework that isn't on this site.

### 7.5 Other components

- **Cards:** the mock's anatomy:
  - picture or video, course and name, headline;
  - course tag with grade (linking to the course page), team avatars or "Solo".
  - The whole card is clickable.
  - Videos are muted autoplay loops with a poster, and pause under reduced motion.
- **Report card (grades):** a native `<details>`.
- **Timeline:** as in the mock: lanes on desktop with the gap break (5.1), rails on phone.
- **Code excerpts:** syntax highlighted at build time, with the file path and a GitHub link. Only Jason's own repos are used.

## 8. Content model (suggested, builder may refine)

- **`projects`:**

  | Field | Notes |
  |---|---|
  | `slug`, `title` | |
  | `kind` | `course` \| `personal` |
  | `course` | ref |
  | `main` | boolean: has its own page |
  | `order` | |
  | `headline` | the card number line |
  | `summary` | |
  | `tools[]` | |
  | `team[]` | refs to collaborators; empty = solo |
  | `media` | images or video, with alt text |
  | `links` | repo, team repo, demo |
  | `report` | path, or absent |
  | `sections` | MDX: what, hard, how, results, testing, my part, next |
  | `numbers[]` | value and condition |
  | `code` | excerpt file, repo path |
  | `status` | |

- **`courses`:** code, name, grade, intro, `sequence` (boolean, for the step strip), order.
- **`collaborators`:** name, GitHub handle, optional website. Avatar fetched at build time.
- **Timeline entries and At-a-glance numbers:** data files. The "27 / 10 / 17" and "8 courses ≥ 9.5" figures are computed from the collections, so they stay true.

## 9. Left to the builder

- Component breakdown, file layout and Tailwind token names.
- Whether the trace and explorer are Astro islands or plain scripts. They need no framework.
- Code highlighting library, run at build time.
- Image pipeline: Astro assets, AVIF/WebP, responsive sizes. Video encoding.
- Exact breakpoints between 390 and 1440, as long as 1024–1280 hold, which the mock already does.
- The 404 page, Open Graph image, sitemap and canonical URL, in the site's style.

## 10. Open items for Jason (do not block the build; content is filled as answers arrive)

- Full copy for the ten main projects and the 17 tiles. Write it from the brief and the reports, then have Jason review.
- Cleaned report PDFs (Jason will clean them later).
- Teams for projects the reports don't cover: other ECE348 assignments, ECE321 P1–3, and the ECE436 assignments.
- Which report figures may be used (one approval per figure).
- **Launch blocker:** Jason removes the Lab 5 submission archive (its file name has students' names and IDs) from his ECE415 repo before launch. The N-body and ECE415 Code links depend on it.
- A current lab screenshot or recording showing a demo running, to replace the idle screenshot in the mock.

## 11. Acceptance gate (Jason, 2026-10-20)

**Every test, and every installed skill that tests websites, must pass** on every page, at every milestone, before it's shown to Jason:

1. **Playwright checks** in `mocks/` (section 7.3): `check.js`, `check-hero.js`, `check-hero-overlap.js`, ported to the built site and run against `npm run preview`.
2. **design-taste-frontend `inspect.mjs`** (real-browser render at 1440, 768 and 390 px): exit code 0, no FAIL. WARNs are fixed or defended in writing in the milestone report.
3. **design-taste-frontend `lint.mjs`** over `src/`: exit code 0, no FAIL.
4. **Impeccable `detect`** over the built pages: no findings. Its contrast check reads colours statically and could not resolve the CSS tokens in the mock (it assumed black text). The build must set colours so the detector resolves them (e.g. explicit colour declarations where text sits on a panel), so the check passes for real rather than being ignored.
5. **Lighthouse** 90+ in every category (CLAUDE.md).
6. **Accessibility and UX:** WCAG AA contrast measured on the rendered page, keyboard focus, reduced motion; ui-ux-pro-max's pre-delivery checklist where it applies to the web.

**Allowed exceptions** are only those written here, each marked in code with the tool's own mechanism (`taste-skill-ignore` comment, an Impeccable ignore rule) and a reason:

- the Menu sheet's shadow (it floats over the page).

**Known failures in the approved mock that the build must fix** (from the 2026-10-20 run; the mock itself is not patched):

- headlines covered by another element while scrolling (investigate: sticky bar or reveal state);
- four card headlines wrap to 3–4 lines at 390 px: shorten or set a wider measure, as a last resort a smaller size;
- 14 font sizes in use: reduce to a scale of about five (display, heading, lead, body, small);
- a paragraph about 176 characters wide: cap at about 65 characters;
- unequal page margins: balance the left trace gutter with the frame on the right;
- every resting shadow, ring, glow, gradient and hairline listed by the linter, replaced as in section 6 (tone steps, flat fills, spacing);
- the blur on the project hero caption;
- the hidden "Live FPGA Lab" pill counted as hidden text under reduced motion: hide it with `hidden`/`display:none` until shown, not visibility;
- "Project N of 5" eyebrow labels on the course page, and a mis-detected eyebrow on home ("ECE433" above "Projects") and project page ("GitHub" above "Tools"): find the cause;
- the project page: only one real picture and no footage (add approved repo media), and the tools section leaving most of the width empty;
- the course step strip scrolling sideways at 768 and 390 px;
- text within 16 px of the screen edge at 768 px on the project page ("What's next");
- text under 13 px.

