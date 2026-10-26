# Jason Nikas — Portfolio (https://njason.dev)

Personal portfolio for **Jason Nikas**, 5th-year Electrical & Computer Engineering student at the University of Thessaly (Volos, Greece). Started with Minecraft plugins (Java/Spigot); now builds systems from code down to hardware: RISC-V GPGPU, CUDA/HPC, FPGA, operating systems, distributed systems, and a self-hosted homelab that runs a public Live FPGA Lab.

All content, facts, project tiers and open questions live in `docs/PROJECT_BRIEF.md`. Read it before any content or layout work. The detailed technical source material is Jason's own reports and presentations in `reports/` (see Research material). The design system lives in `docs/DESIGN_SYSTEM.md` once it has been generated (see Design skills).

## Audience and goal
- **Primary reader: a recruiter, hiring manager or engineer**, skimming for 30–60 seconds, often on a phone. The site is a generic showcase of Jason's projects: **no "open to internships" or job-seeking message** anywhere (Jason, 2026-10-19).
- In the first screen they must know who Jason is and what he's strong at (hardware ↔ software).
- In one scroll they must see why the flagship projects are impressive, in plain language, without opening GitHub.
- The page should also prove **genuine passion**: the self-initiated projects (Live FPGA Lab, Homelab, DVD Logo FPGA, tools) get their own spotlight, because nobody assigned them.
- Secondary reader: an engineer who opens a project page and wants real technical depth.

## Stack and deployment
- **Astro + Tailwind CSS**, TypeScript. Static output (`output: 'static'`), `site: 'https://njason.dev'`.
- Content in **Astro content collections** with typed schemas: `projects`, `courses` (grades), `collaborators`. Never hardcode project data in components.
- Animation: one library only. Prefer native CSS (scroll-driven animations, `@starting-style`, View Transitions). Add **GSAP + ScrollTrigger** or **Motion** only for sequences CSS can't do. Load it only on pages that need it.
- Islands only where interaction needs it. No React unless a component truly requires it.
- Self-hosted: `npm run build` → serve `dist/` behind Jason's reverse proxy. No Vercel/Netlify-specific features.
- No runtime calls to the GitHub API. Data such as collaborator avatars or repo metadata is fetched at **build time**, with a graceful fallback if offline.

## Design skills
Both skills are used, with separate jobs so they don't fight:
1. **`ui-ux-pro-max` → the design system.** Run it first to generate the palette, type pairing, spacing scale, component rules and UX anti-patterns. Write the result to `docs/DESIGN_SYSTEM.md` and turn it into Tailwind theme tokens. Product context: developer portfolio, hardware/systems engineer, technical audience plus recruiters.
2. **`design-taste-frontend` → composition, motion and polish.** Layout, hierarchy, the signature visual idea, animation choreography, micro-interactions, and making it not look AI-generated.

If they conflict: `DESIGN_SYSTEM.md` wins on tokens (colour, type, spacing). Taste wins on layout and motion. The readability rules below override both.

## Design direction

The approved spec is `docs/superpowers/specs/2026-10-20-portfolio-design.md`; where this section and the spec differ, the spec wins.
- **Fancy, with substance.** Rich, deliberate animation and a few showpiece components, but every animated element must still communicate information. A recruiter must be able to read it in a glance.
- **Showpiece components** (design them as a coherent family, not a gimmick collection):
  - **"Currently working on" rows:** two compact whole-row links under the hero photo (GPGPU v2, Homelab). Content comes from the brief.
  - **Live FPGA Lab widget:** compact, in the hero (spec §7.2): a flat cyan title band, a breathing LED, one plain sentence, "Running now" from the public board stream, and **Open the lab** with Queue and temperature tags. Never fake live data; offline shows "Status unavailable".
  - **Grades:** a folded "Course grades" report card under At a glance, with flat grade bars linked to the matching project. Only show grades Jason has confirmed in the brief.
  - **Collaborator stacks:** overlapping avatar groups on team projects, linking to each collaborator's GitHub/portfolio. Only list people confirmed in the brief.
  - **Pill/badge system** (inspired by tsiantosd.tech, not copied): tech pills in the raised tone, with no domain colours, and context pills (`Live demo`, `Self-initiated`, `Course project`, `Team of N`, `In progress`, `Video`). Max ~6 tech pills per card.
  - **Scroll-driven storytelling** for the journey: Minecraft plugins → ECE → hardware. A timeline or "stack descending" metaphor from software to silicon fits well.
- **Signature visual idea: the circuit board.** One copper trace with gold pads runs from the hero through every section and switches each section on as it arrives (spec §6, §7.3). No dot grid, rings, shadows, gradients or glass (spec §11).
- **Not a copy of tsiantosd.tech.** Study it with Playwright for the pill patterns and info density Jason likes, then build a clearly different identity: layout, type, colour and motion.
- **Avoid the generic AI-portfolio look:** purple/blue gradient blobs, glassmorphism on everything, centered "Hi, I'm 👋" hero, fake terminal typing, emoji bullets, identical card grids for every section.
- **Motion rules:**
  - Animate `transform`/`opacity` only and stay at 60fps on a mid-range phone.
  - No scroll-jacking. Native scrolling always works.
  - Content is fully visible and readable without JS.
  - Respect `prefers-reduced-motion`: replace motion with simple fades or nothing.
  - Stagger reveals; never hold text back for more than ~400ms.
- Must look excellent at **390px** and **1440px**. Meet WCAG AA contrast.

## Content rules
- **Never invent facts.** No made-up metrics, grades, speedups, player counts, team sizes, collaborators or roles. If something isn't in `docs/PROJECT_BRIEF.md`, `reports/` or the repo, leave `TODO(jason): …` and ask.
- Items marked ❓ in the brief are unconfirmed. Don't publish them until Jason answers.
- Team work is described as team work ("we designed…", "co-designed with…"). Jason's specific contribution is stated only where the brief gives it.
- Write for recruiters: what it is → why it's hard → proof (a number, demo or video) → tech. Short sentences, active voice, no filler ("passionate", "cutting-edge", "leveraging", "robust").
- **Tiers** in the brief decide each project's size and position. Don't reorder without asking.
- Minecraft is the origin story: one compact section linking to https://acrispycookie.dev.
- **Homelab privacy:** never show IPs, subnets, VLAN IDs, internal hostnames or domains, port numbers, software versions, firewall/VPN topology, or where security tooling sits. Show capabilities and service categories only. Exception (Jason, 2026-10-20): the skills explorer may name the homelab's software (e.g. Traefik, WireGuard) and link it to the Homelab project, without versions or layout.
- No CV yet. Don't render a CV button; leave a `TODO(jason)` slot in the contact section.
- **Security projects (ECE455, ECE436):** describe at outcome level only, in the site, the brief and REPORTS_INDEX.md alike: what was demonstrated, the setup in one sentence, the measured results, and the defensive takeaway. No step-by-step reproduction, code-level attack mechanics, payload/encoding details, or driver/tuning parameters. **Deferred (Jason, 2026-10-25):** the RAMBO and Wi-Fi pages need richer detail and media; leave them unchanged until a future plan takes them up. That plan also fixes RAMBO's results table, whose column headings squeeze on windows under ~400px (known exception in tests/e2e/shapes.spec.ts, 2026-10-26).

## Workflow
1. **Plan before building.** For each page or section, propose layout, hierarchy, motion and copy first, and wait for approval.
2. Build **one section at a time**: hero (photo, name, widget, Now) → copper trace and At a glance → projects and personal projects → other projects and timeline → skills, contact and footer → project and course pages.
   - Every milestone passes `npm run gate` before Jason sees it (spec §11).
3. After each section, run the dev server and use **Playwright** to screenshot at 390px and 1440px, including mid-animation states. Critique like a senior designer, fix the top issues, then show Jason.
4. Before calling the site done:
   - accessibility pass: alt text, focus states, heading order, contrast, reduced-motion check
   - SEO: title, meta description, Open Graph image, sitemap, canonical `https://njason.dev`
   - performance: Lighthouse, aiming for 90+ in every category: `npx lighthouse http://localhost:4321 --view`

## Commands
- `npm run dev` — dev server (http://localhost:4321)
- `npm run build` — static build to `dist/`
- `npm run preview` — preview the production build

## Research material
Sources, in order of trust:
1. **Jason's answers** (✅ in the brief).
2. **`reports/`:** Jason's own reports and presentations for every project. Best source for real numbers, team members, methodology, results and figures.
3. **Repo READMEs and media:** cloned into `research/` when needed.
4. **Websites:** tsiantosd.tech, fpga.njason.dev, acrispycookie.dev (open with Playwright).

When sources disagree, use the higher-trust one and note the conflict for Jason.

**How to use `reports/`:**
- Start by building an index. List every file and map it to its project/course code, then save the index to `docs/REPORTS_INDEX.md` (file → project → one-line summary → key numbers found). Reuse the index instead of re-reading every file each session.
- Read PDFs with text extraction (e.g. `pdftotext -layout`). For figures, tables and scanned or slide-based pages, render the page to an image and look at it. Numbers often live only in charts and tables. For `.pptx`/`.docx`, extract the text and embedded images.
- Extract for each project:
  - what was built
  - Jason's role and the team members
  - key results with exact numbers and their conditions (hardware, input size, baseline)
  - the best 1–2 figures worth showing
  - anything that resolves a ❓ in the brief
- Write findings back into `docs/PROJECT_BRIEF.md` marked **📑** with the source file name, e.g. `(📑 reports/ECE415/final.pdf, p. 12)`. Remove a ❓ only when a report clearly answers it.
- Report numbers must be quoted with their context ("7.3× faster than the OpenMP baseline on an RTX 3060"), never rounded up or generalized.

**Privacy and publishing rules for `reports/` and `research/`:**
- Both folders are **git-ignored** and are never imported, linked or copied into `public/` or the build.
- Reports may contain classmates' full names, student IDs, grades, professor comments and course handouts. Never publish those. Collaborators appear on the site only as confirmed in the brief.
- Figures or diagrams from reports may be used only after Jason approves each one. Jason (2026-10-25) approved using any figure from his reports and presentations on the project pages. Re-export them cleanly into `src/assets/`, cropped to remove names, IDs and course logos.
- Don't publish full reports or slides. Ask Jason before linking any of them.
