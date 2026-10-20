# Proposal 02: Site structure, home page and project pages

**Status: scrapped by Jason** (2026-10-19): "not structured, focuses too much on getting the aesthetic right, some boxes too big with stretched images, 'Built because I wanted to' has projects I don't want." Next step: agree structure and content before any visuals.

Previous status: mock v4 under review (2026-10-19). Built on Jason's feedback on v3: "the aesthetic is right, but it's packed, the numbers aren't impressive, it isn't coherent, the message isn't clear, it doesn't paint a picture of who I am, the project cards aren't clear, and every project needs its own detailed page."

Skills used: `frontend-design` (plan → review → build → critique; restraint; copy), `design-taste-frontend` (house rules, one idea, sections differ), `ui-ux-pro-max` (bento sizing, radius, responsive collapse, a11y), all on top of `DESIGN_SYSTEM.md` (cyan).

## What changes
1. **One clear message first.** The hero says who Jason is and what he does in one plain sentence. Numbers only appear where they are impressive and explained (2.38×, 2910×, the live lab). The weak ones (0.02 Mbit/s, +9.6%) leave the home page and live on their project pages with context.
2. **A portfolio structure, in this order:** who I am → what I work on → featured work → more projects → built because I wanted to → how I got here → contact. Each section has a different composition.
3. **Clear project cards.** Every card answers the same three questions in the same order: *what is it* (plain sentence), *what's notable* (one line), *where to go* (its own page). Each card has one real picture of the project.
4. **Every project gets its own page** (`/projects/<slug>`), from one template:
   - overview;
   - my role;
   - how it works;
   - results with their conditions;
   - pictures and video;
   - team;
   - links and materials.

## Design plan (tokens)
- **Colour:** ground `#070D0F` (cyan-tinted, chosen to sit under the floorplan), tile `#0F191C`, raised tile `#142226`, ink `#E6F0F1`, soft ink `#9CB1B4`, accent cyan `#3DD9E8` (actions and the one live element only).
- **Type:** IBM Plex Sans Condensed (display, 600) + IBM Plex Sans (text). One family, two widths. Sentence case everywhere, no eyebrows, no all-caps labels.
- **Layout:** left-aligned on a 12-column grid with 8 px gaps. Tiles are filled with 16 px corners. Tile sizes follow hierarchy: one large thing per section, never a uniform card grid.
- **The one memorable thing:** the GPGPU's real FPGA floorplan. It's the hero picture and returns as the header picture of the GPGPU page. Nothing else gets decoration.
- **Motion:** one orchestrated load sequence in the hero, plus responses to actions (hover/press on cards and buttons, page transitions). No scroll-triggered fade-ups on every section, and no marquee.
- **Reviewed against the generic defaults:**
  - Dropped the marquee, the eight identical small number tiles, the middle-dot meta strings and the arrows appended to buttons, because they read as template.
  - Kept: the filled-tile board, but only where it carries hierarchy.

## Home page wireframe (1440)
```
┌───────────────────────────────┬───────────────────────────────┐
│ [photo] Jason Nikas      Work About Contact          GitHub    │
├───────────────────────────────┬───────────────────────────────┤
│ I build from code down to     │                               │
│ silicon.                      │   GPGPU floorplan (real)      │
│ ECE student at the University │   caption: what it is         │
│ of Thessaly. I design         │                               │
│ processors on FPGAs, make code│                               │
│ fast on GPUs and run the      │                               │
│ servers behind it myself.     │                               │
│ [See my work] [Try the live FPGA]  · live status line         │
├───────────────────────────────┴───────────────────────────────┤
│ What I work on: three rows (area · one sentence · its projects)│
├───────────────────────────────────────────────────────────────┤
│ Featured work: GPGPU (large: picture + what/notable/link)      │
│                N-body (half)        Live FPGA Lab (half)       │
├───────────────────────────────────────────────────────────────┤
│ More projects: a list of rows: name · what it is · area · page │
├───────────────────────────────────────────────────────────────┤
│ Built because I wanted to: DVD Logo FPGA, Homelab, tools       │
│ How I got here: Minecraft plugins → ECE → hardware (short)     │
│ Contact                                                        │
└───────────────────────────────────────────────────────────────┘
```

## Project page template (GPGPU as the example)
Header picture (floorplan) → title + one-sentence summary → facts panel (role, team with avatars, course, status, links) → overview → my role → how it works (subsections) → results table with conditions → pictures → what's next → materials (report/slides only after Jason approves each).

## Open questions for Jason
- Can the GPGPU report and presentation be linked from its page, or only shown as excerpts?
- Which figures from the reports may be used on project pages (beyond the Vivado view and the ECE436 chart)?
