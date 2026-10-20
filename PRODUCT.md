# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro + Tailwind CSS, TypeScript, static output (`site: 'https://njason.dev'`), self-hosted behind Jason's reverse proxy. Content lives in Astro content collections (`projects`, `courses`, `collaborators`). No React unless a component truly needs it; one animation library at most, loaded only where needed. See CLAUDE.md.

## Users

- **Primary: recruiters and hiring managers** (confirmed 2026-10-20). They skim for 30–60 seconds, often on a phone. Within the first screen they must know who Jason is and what he is strong at; within one scroll, why the main projects are impressive, in plain language, without opening GitHub.
- **Secondary: engineers** who open a project or course page and want real technical depth: how it works, results with their conditions, figures, and materials.

## Product Purpose

njason.dev is Jason Nikas's personal portfolio: a generic showcase of his projects. It is not a job-seeking page: no "open to internships", availability or similar messaging anywhere. Success means a visitor quickly understands who Jason is, sees the strongest work, and can go deeper on any project.

## Positioning

**From code down to silicon, live** (confirmed 2026-10-20). Jason works across the whole stack, from software, HPC and operating systems to processors on FPGAs. Visitors can use a real FPGA board that runs his team's RISC-V GPGPU, live from the browser (the Live FPGA Lab at https://fpga.njason.dev, hosted from his own homelab). No other student portfolio can truthfully claim the live board.

## Operating Context

- Identity line: "Jason Nikas, undergraduate student in Electrical and Computer Engineering at the University of Thessaly".
- Two kinds of page:
  - **Course pages** (`/courses/<code>`) hold every project from that course.
  - **Project pages** cover the 10 main projects, which get their own detailed page. Course projects nest under their course (`/courses/<code>/<project>`); personal projects live at `/projects/<name>`.
- Most work is team work. Collaborators are shown with GitHub avatars and credited as confirmed in `docs/PROJECT_BRIEF.md`.
- Live board status comes only from the public endpoints `GET https://fpga.njason.dev/api/public/board` and `/api/public/board/stream` (SSE, about one event every 2 s, CORS allowed for https://njason.dev). It must never show fake values; when the stream is unavailable, the page shows an honest fallback.

## Capabilities and Constraints

- Content truth lives in `docs/PROJECT_BRIEF.md`, with sources in `docs/REPORTS_INDEX.md`. Never invent facts, metrics, grades, collaborators or roles.
- The structure and card list are recorded under "Site structure decisions" in the brief.
- **Security projects (ECE455, ECE436):** describe at outcome level only.
- **Homelab:** never show IPs, subnets, VLANs, hostnames, ports, versions or topology. Show categories only.
- **Never publish:**
  - `reports/`, `research/` or `docs/GRADES.md`;
  - classmates' IDs or full names beyond the confirmed collaborators.
- **Grades:** only the selected course grades in the brief are shown.
- **No CV yet:** leave a hidden slot.
- **Must work at 390 px and 1440 px.** No runtime GitHub API calls; avatars and metadata are fetched at build time.
- **Decided since init (2026-10-20):** no courses section on the home page (grades sit in a folded report card under the stats); no 3D object in the hero for now; course pages explain every project in depth (pictures, code, description, cleaned reports); teams are shown per project.

## Brand Commitments

- Name: Jason Nikas, GitHub handle ACrispyCookie. The Minecraft-era portfolio (https://acrispycookie.dev) is linked from a compact origin card under Personal projects and from the timeline.
- Voice: plain, active, first person. Team work is written as "we". No filler ("passionate", "cutting-edge", "leveraging").
- Jason's binding visual constraints, recorded without expansion:
  - cyan accent, no violet or purple;
  - smooth, rounded shapes;
  - follow the design-taste-frontend house rules.
- **Reference he likes:** https://emmatsak.github.io/portfolio, for its aesthetics and interactivity. Must not be copied, and must not be a copy of tsiantosd.tech either.

## Evidence on Hand

- **Reports and presentations** in `reports/` (git-ignored, never published). Indexed in `docs/REPORTS_INDEX.md`, with numbers and their conditions, e.g. N-body 2,910× on 4× Tesla K80; GPGPU 2.38× vs the on-chip Cortex-A9.
- **Repo media** in `research/` (git-ignored), e.g. the N-body galaxy GIF, DVD-logo video, 3D-house screenshots and charts. Report figures are used only after Jason approves each one.
- **Photo:** `media/profile-fuji.jpg` (2000×2000; Jason from behind, facing Mount Fuji), used as the hero cover.
- **Live data:** the public board status stream.
- **Absent, never to be fabricated:**
  - testimonials from employers;
  - press;
  - player or user metrics beyond ColonyMC's 20–30 players;
  - the ECE455 2 m result, which was not captured.

## Product Principles

1. **Understandable with zero context.** Every project says what it is, why it's hard, and one honest proof, in plain language.
2. **Impressive by being accurate.** Lead with the strongest true fact, always with its conditions. Weak or misleading numbers stay off the overview.
3. **Live beats claimed.** Real demos and real board status are the strongest proof; show them, never simulate them.
4. **Course work and personal work are clearly distinct.** Grades and collaborators are stated briefly where they apply.
5. **Depth on demand.** The home page stays scannable; detail lives on course and project pages.

## Accessibility & Inclusion

WCAG AA contrast, visible keyboard focus, alt text, logical heading order. Content is fully readable without JavaScript, and `prefers-reduced-motion` is respected.
