# Proposal 01: Hero + "Now" windows

**Status: direction approved provisionally; mock under review** (2026-10-19). Mock: https://claude.ai/artifact/CPyBLTvziaEnJaxTPYSUTy

Answers (2026-10-19): 1 approved pending the mock · 2 follow the taste skill strictly (DESIGN_SYSTEM.md updated: no mono, no eyebrows, no outlines, square corners) · 3 Vivado view and ECE436 chart approved (the ECE436 chart now comes from the repo) · 4 photo beside the name.
Direction dealt by `design-taste-frontend`: **The contact sheet**, seed `2127919038`, palette and type kept from `DESIGN_SYSTEM.md`. Hero blueprint: "Lit strip, four corners". Signature motion: "Drag row". The sheet is saved in `.taste-skill/direction.json` (`node .claude/skills/design-taste-frontend/scripts/draw.mjs --show`).

Why this direction (of the three dealt: quiet-instrument, type-only-statement, contact-sheet): its strict rows of frames are the logic-analyzer capture. Every project becomes one "pulse" on a timebase, and the whole body of work is visible in the first screen, which suits a 30-second skim. Type-only would drop the photo. Quiet-instrument whispers when the strength is range.

## The idea
> On this page, **the signals Jason's own hardware produces** (the Vivado placement of 32 cores, the HDMI frame of the DVD logo, the N-body run, the decoded RAM emissions) become **a lit strip of captured frames on one timebase: the centred frame is "triggered" and lit, the rest wait in the dark.**

**The live thing:** the Live FPGA Lab block shows the real board state, pushed live over SSE from `fpga.njason.dev/api/public/board/stream`, e.g. "Board free · 47 °C" or "Running GPGPU n-body · 1 waiting", with a link to take the board. Without JS or when offline it shows "Status unavailable · open the lab". No fake values.

## Copy deck
- **h1 (display):** Jason Nikas
- **Supporting sentence** (≤ 60 characters, directly under the h1): "I build systems from code down to silicon." (42 characters)
- **Primary button:** "Try the live FPGA lab" → https://fpga.njason.dev
- **Secondary link:** "GitHub" → https://github.com/ACrispyCookie
- **Nav (top-right, plain links):** Work · Lab · About · Contact
- **Who block:** "Electrical & computer engineering student, University of Thessaly, Volos."
- **Now windows** (three short blocks, title + one sentence + state):
  1. **Extending our RISC-V GPGPU.** "Adding graphics, DDR memory, branch divergence and warp scheduling to the 32-core GPGPU we designed." State: In progress.
  2. **Keeping a real FPGA online.** Live line from the board (see "the live thing"), plus a "Take the board →" link.
  3. **Running my homelab.** "Self-hosted services, automation and networking. It also hosts the FPGA lab."
- **Strip frame titles** (under the lit frame only): project name + one fact, e.g. "Simple GPGPU · 2.38× faster than the ARM core next to it".

## Layout at 1440
```
┌───────────────────────────────────────────────────────────────────────────┐
│ [avatar] Jason Nikas  (display, ~88px)               Work  Lab  About  Contact │
│ I build systems from code down to silicon.                                  │
│                                                                             │
│ Who block     │ Now: GPGPU          │ Now: FPGA lab ● live  │ Now: Homelab   │
│ (14–16px)     │ (title + sentence)  │ Board free · 47 °C    │                │
│───────────────────────────────────────────────────────────────────────────  │
│ ▒▒▒▒ ▒▒▒▒▒▒ ▒▒▒▒ ███████████ ▒▒▒▒▒▒ ▒▒▒▒ ▒▒▒▒▒▒ ▒▒▒▒  → drags sideways     │
│ ▒▒▒▒ ▒▒▒▒▒▒ ▒▒▒▒ █ lit frame █ ▒▒▒▒▒▒ ▒▒▒▒ ▒▒▒▒▒▒ ▒▒▒▒   (≈34vh, 12 frames) │
│ _|‾|___|‾‾|__|‾|___|‾‾‾‾‾‾‾|__|‾‾|___|‾|___   ← one trace: a pulse per frame │
│                   Simple GPGPU · 2.38× vs Cortex-A9      [Try the live FPGA lab] │
└───────────────────────────────────────────────────────────────────────────┘
```
- **Top band:** the name at display size across the top (`text-hero`, 88px ≈ 6.1vw, inside the sheet's 6–9vw). Jason's GitHub photo sits square, 1 cap-height tall (~64px), immediately left of the name. That makes the photo part of the title, not a separate "photo card".
- **Block row:** the who block plus the three Now windows on a 12-column grid (3 columns each), 16px text. Window treatment: a `--surface` tone step, title in full ink, sentence in muted ink, state at the bottom. No traffic lights, no outlines.
- **Strip:** 12 frames of real project media at one height (34vh), natural widths, 10px gaps, square corners, edge to edge. It scrolls sideways (native, scroll-snap). The frame nearest the centre is at full brightness; the others sit at 55%.
- **The trace:** one 2px waveform drawn under the strip, the figure of a logic-analyzer channel, not a divider. It's high under every frame and low in the gaps, so the strip itself is the signal. The pulse under the lit frame is amber.
- **Bottom:** the lit frame's title + fact on the left (aligned to its left edge), the primary button on the right.

## Layout at 390
- Avatar + name (44px) and a menu link at the top. Sentence under it.
- The strip grows to 46vh, one frame wide with neighbours cropped at the edges, swiped by thumb, with the trace under it.
- Lit frame title, then the button full width (≥ 44px).
- The Now windows follow just below the first screen, stacked; the live-lab window comes first.

## Frames (12, all real; ⓡ = report figure, needs your approval)
1. **GPGPU:** Vivado implemented-device view ⓡ (ECE338 slides p.5), the lit frame on load.
2. **Live FPGA Lab:** dashboard screenshot (fpga.njason.dev).
3. **ECE415:** N-body galaxy GIF (repo), as a moving picture.
4. **DVD Logo / ECE333:** frame from the accelerometer VGA sprite video (repo), as a moving picture.
5. **ECE455:** SDR + laptop setup photo (repo `docs/assets/setup.jpg`).
6. **ECE494:** execution-time vs dependency chart (repo).
7. **ECE436:** fair vs modified station throughput chart ⓡ.
8. **ECE433:** 3D house screenshot (repo).
9. **ECE348:** cache throughput chart (repo).
10. **ECE318:** FUSE block/node diagram (repo).
11. **ECE415:** CPU-to-GPU throughput chart (repo), restyled in the palette.
12. **Minecraft:** DynamicDisplays still (acrispycookie.dev / repo).

Charts are restyled in the page palette when built, so the strip reads as one family.

## Motion (transform/opacity only)
- **Load:** name rises 24px + fades (0 ms) → sentence (80 ms) → the four blocks (160–340 ms, 60 ms stagger) → strip frames slide in from the right (40 ms stagger) → the trace reveals left to right (scaleX on a mask). Nothing is held back more than 400 ms.
- **Signature, "drag row":** native horizontal scroll with snap. The centre frame brightens via a scroll-driven animation (`animation-timeline: view(inline)`), with an IntersectionObserver fallback. Its title crossfades.
- **Live:** the lab window's status dot pulses only while the board is actually running something. "Movement means live."
- **Feedback:** button press/hover, frame hover brightens, keyboard focus outline on frames (each frame links to its project).
- **Reduced motion:** no travel. The first frame is lit statically, the trace is static, and the dot is solid.

## Decisions needed
1. **Approve the direction** ("contact sheet"). It also shapes later sections (e.g. the About section becomes a large paragraph with the photo as a drop cap; the footer becomes a board of tiles).
2. **Taste house rules vs `DESIGN_SYSTEM.md`.** The taste skill bans monospace labels, small uppercase labels, eyebrows, 1px outline boxes and more than 2 typefaces. CLAUDE.md says the design system wins on type, so this is your call. **Recommendation:** adopt the taste rules. Drop JetBrains Mono except inside the waveform drawing itself (channel names on the trace are part of the instrument). Set numbers in Plex Sans with tabular figures, use sentence-case labels, and use tone steps instead of borders. I'd update `DESIGN_SYSTEM.md` to match.
3. **Report figures** for the strip: the Vivado device view (lit frame) and the ECE436 throughput chart.
4. **Photo placement:** square avatar beside the name (recommended), or the avatar as the first frame of the strip.

## Revision 2 (2026-10-19)
v1 (contact sheet, amber) was rejected by Jason: blocks and buttons not smooth, drag-to-advance on desktop, too many unrelated frames, the scope motif barely readable, and amber disliked. He asked for something more modern that shows the main information better, in cyan or purple.

v2, same mock URL (version 2):
- **Direction:** **split-stage** (dealt via `draw.mjs --direction split-stage`, saved in `.taste-skill/v2/direction.json`).
- **Layout:** rounded reading panel (20 px radius) and pill buttons on the left. On the right, a sticky **scope screen** (`data-ui` interface fragment, so its graticule is allowed) that switches per section:
  - live board temperature + free/in-use channel;
  - 32 lockstep GPGPU lanes;
  - the N-body speedup ladder on a log scale;
  - how the lab queue works.
- **Readout bar:** carries the live board state.
- **Palette:** dark scope screen with phosphor **cyan** (`#3DD9E8`), with electric blue (`#6FB2FF`) as an alternative. The dealt palette ("cobalt on sand") was overridden because Jason asked for cyan. **Purple isn't offered:** the taste skill's house rules ban violet/indigo, and Jason asked to follow those rules.
- **Content:** shows the main information in the first two screens: who, Now, then the GPGPU (2.38×) and N-body (2910×) flagship sections with collaborators, then the Live FPGA Lab.

## Revision 3 (2026-10-19)
v2 (split stage with a scope screen) was rejected: too distracting and not immediately understood. Cyan stays. Jason asked for the parked alternative signature (die floorplan), using both UI/UX Pro Max and the taste skill.

v3, same mock URL (version 3):
- **Taste direction:** **dense-tiles** ("the well-kept board"), saved in `.taste-skill/v3/direction.json`.
  - Hero redrawn once from "Name band and rails" to "Two-by-two board", because the first hero crops the name at both ends, which fails the five-second test.
  - Dealt palette ("navy on white") overridden by Jason's cyan.
- **UI/UX Pro Max:** bento pattern (`bento-box-grid` style and the "Bento Grid Showcase" landing pattern). Taken from it:
  - 16 px corners;
  - hover scale 1.02;
  - cards usable without hover;
  - 4 → 2 → 1 columns.
  - Its soft shadows were dropped because the taste rules ban shadows.
- **Signature:** the GPGPU's real Vivado floorplan, tinted cyan and dimmed, runs through two diagonal tiles of the first screen as one picture continued across the board, captioned "Our 32-core RISC-V GPGPU, placed on the FPGA". The tiles read as placed blocks.
- **Layout:**
  - First screen: name tile, statement with 2.38× and 2910×, accent tile with the live lab status.
  - A marquee band carries the claim.
  - Then the work board:
    - **Large tiles:** GPGPU (2.38×, team) and N-body (2910× with a log-scale ladder).
    - **Live FPGA Lab** tile.
    - **Small tiles, each with one number:** CV32E40P, Wi-Fi, air-gap, distributed, FUSE, threads, DVD Logo, homelab.
  - Footer: wordmark tile + contact tile.
- **Not used:** the die-floorplan motif replaces the waveform motif. The scope and waveform are parked.
