---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/projects","src/pages/courses"]
---

# Home page (njason.dev)

Scope: the home page, plus the project and course page templates that inherit its world. Visitor mode: Experience (the work leads). Dark only for now (Jason, 2026-10-20).

Audience and job: recruiters skimming on a phone for 30–60 s, then engineers going deep. They must learn who Jason is, see the strongest work with honest numbers, and be able to try the live board. Structure and content are fixed in docs/PROJECT_BRIEF.md (wireframe v6 at https://claude.ai/artifact/E1jvR9fMXqxmK4sA3VYzn4).

Avoid (Jason): too packed, too generic, too "hacker". Signature moment (Jason): the live lab widget.

## Direction contract

THESIS: The site is one dark teal circuit board and the live FPGA lab widget is the powered part on it; rounded copper traces carry the eye from that live part into the work. It refuses the category default of neutral dark panels with an accent colour and equal card grids.

OWN-WORLD: Solder-mask teal-black ground (#0b1d21) with two raised mask shades (#11282d, #183539) for depth instead of borders; silkscreen off-white type (#eaf2f1), muted silkscreen (#93aeb0); cyan (#41e2f2) only for live and primary actions; ENIG gold (#d8b46a) round pads as the only ornament, always at a trace end. Bricolage Grotesque display, Hanken Grotesk text. Everything rounded: pill buttons, 22–28 px panels, round pads, traces with rounded bends.

STORY: Visitors see Jason's face to Fuji, his name, and a real board running his team's GPU right now; they believe the work is real; they open the lab or follow a trace into the projects.

FIRST VIEWPORT: Top bar (name, four links, "Live FPGA Lab" pill with status dot). Below: cover photo 330 px wide at left, the name at about 86 px in two lines in the middle with the ECE line and GitHub/LinkedIn/Contact, the live board panel 440 px at right outlined in cyan with a gold pin header, three meters, a live sparkline and "Open the lab" as the primary action. "Currently working on" widgets underneath; traces leave the board's bottom pads into the page.

FORM: Assigned direction, candidate 4 of 7 on the ordered list (circuit board world). seed:21f684e263512cda. Raised by: cracktro (hierarchy by depth), oscilloscope (numbers with units and conditions), glazier (one card one statement, selection floods colour), Swiss wall (one master grid).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Signature motion for the traces (draw-on once on load vs. a current pulse when the board is live).
- How far traces reach below the hero (projects only, or every section).
