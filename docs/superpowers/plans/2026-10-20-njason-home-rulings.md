# Plan 1 (home page): rulings and deferred minors

Every decision taken during Plan 1 (docs/superpowers/plans/2026-10-20-njason-home.md), copied from the execution ledger in order, each with what it costs if wrong. Decisions Jason made are marked with his name in the line. Generated 2026-10-21 at the end of the final review.

## Rulings

- Setup: Ruling: no worktree; fresh repo, Task 1 creates it. Implementation runs on branch build/home off main (main holds only the Task 1 docs commit) — Jason chose native execution; cost if wrong: a branch rename.
- Setup: Ruling: milestone stops in the plan override executing-plans' "continuous execution" — spec §0 and CLAUDE.md workflow require Jason's review per milestone; cost if wrong: extra pauses.
- Setup: Ruling: added .superpowers/ to .gitignore (plan list omitted it) — workspace must be git-ignored; cost: none.
- Task 2: Ruling: scaffolded package.json by hand instead of `npm create astro` (non-empty dir) — same deps and scripts; cost if wrong: none.
- Task 2: Ruling: typescript resolved to 6.0.3 (peer range of @astrojs/check), not 7.0.2 — plan allowed it; cost: none.
- Task 2: Ruling: webServer uses `astro preview --ignore-lock`; Astro 7 auto-backgrounds preview when it detects an agent, which Playwright reads as an early exit — cost if wrong: none (flag only disables the lock/background).
- Task 2: Ruling: footer is a full-width band (`.foot` outside `.wrap`, inner `.foot-in` on the content edge) instead of a panel card — spec §4 "no hairline, no card"; content-edge test measures `.foot-in > div`. No overflow-x clipping anywhere (test asserts body overflow-x visible) so overflow bugs can't hide.
- Task 4: Ruling: unit tests read content from disk via tests/unit/helpers/content.ts (yaml@2.9.1 added as devDependency) instead of astro:content in Vitest — Astro validates schema at sync/build; cost if wrong: a schema drift the helper misses (astro sync/check catch it).
- Task 4: Ruling: one course name each: ECE494 Microprocessor Design, ECE333 Digital Systems Lab, ECE415 High Performance Computing (brief/mock varied) — cost if wrong: a rename in JSON.
- Task 4: Ruling: tools per project = mock site.js M map plus brief-stated facts only (multicast Java; ECE321 P1–3 pthreads; ECE333 labs Verilog; Smith-Waterman Vitis HLS). Runtime and threads have no tools listed yet (brief names none) — Jason may add.
- Task 4: Ruling: `team` lists teammates other than Jason; Jason is the `jason` collaborator for avatars. Team of N = team.length + 1.
- Task 4: Ruling: videos live in public/media (Astro doesn't process video); posters are the optimised images.
- Task 5: Ruling: LabWidget.astro (static no-JS markup) and diagrams/Homelab.astro created here, not in Tasks 6/10 — the hero needs them to render and to test overlap; Task 6 adds behaviour on top. Cost: none.
- Task 5: Ruling: kept the mock's hue-rotate on the GPGPU block thumbnail (spec §6 allows colour-shifting diagram screenshots).
- Task 6: Ruling: active_demo is mapped to its name from `demos` when it's an id (brief shows ids like gpgpu-nbody); unknown ids show as given. Extra unit test.
- Task 6: Ruling: before the first event the widget keeps the static panel (no "Status unavailable" flash); it goes offline on stream failure, CLOSED, or 20 s without events (stale timer). Temperature shown rounded to whole °C.
- Task 6: Ruling: e2e tests scroll the widget into view (stream opens only on screen, spec §7.2) + added "stream stays closed off screen" test.
- Task 6: Ruling: page scripts go in Base's `scripts` slot, never inside <main> (a <script> in main broke the one-content-edge check).
- Task 7: Ruling: pill test checks "shown iff widget off screen" (v5 rule Jason kept); on phone the widget is partly on screen at y=0 so the pill is hidden there too; desktop-only test asserts hidden at the very top. Pill fade uses @starting-style, no JS class.
- Task 7: Ruling: pill-test page at /pill-test/ (noindex, excluded from gate); Plan 2 deletes it.
- Task 7: Ruling: snapped stray sizes (1rem, 1.08rem, 1.2rem) to the scale; inspector now sees 14/17/21/81 px.
- Task 8: Ruling: fetchAvatar(person {name, github}, fetchImpl?, dir?) instead of fetchAvatar(handle) — initials need the name; dir lets the test write to a temp dir, not src/ — cost if wrong: one signature change.
- Task 8: Ruling: avatars re-encoded with sharp to real 96px JPEG (GitHub serves PNGs too) and git-ignored (fetched each build, initials offline) — cost if wrong: offline builds show initials.
- Task 8: Ruling: courses.featuredProject is now reference('projects') (id), shown with the project's title — three names didn't match any title — cost if wrong: report-card labels are full titles ("RISC-V GPGPU").
- Task 8: Ruling: projectHref() created now in src/lib/links.ts (plan defines the rule in Task 10) — report card needs it — cost if wrong: none.
- Task 8: Ruling: grade bars use copper, not cyan — spec reserves cyan for live/primary actions — cost if wrong: a colour swap.
- Task 8: Ruling: "4 TA roles" computed as distinct courses in the timeline's teaching lane — keeps it true as entries change — cost if wrong: none.
- Task 8: Ruling: <Avatars> is rendered and tested in Task 10 with the cards that use it — no page renders it yet — cost if wrong: a broken component found one task later.
- Task 9: Ruling: reduced motion kept the mock's bug (each frame pulled `shown` back to the scroll target); now `shown = total` every frame under reduce — spec: whole trace drawn — cost if wrong: none.
- Task 9: Ruling: deep-link test targets the last `main > section[id]` (#contact doesn't exist until Task 11) — same rule, today's page — cost if wrong: re-point at #contact in Task 11.
- Task 9: Ruling: desktop/tablet frame centred by mirroring the trace gutter on the right (--rail-r); content column stays 1132px so the approved hero proportions (photo ~538px) hold — cost if wrong: 68px less content width than the 1200px spec reading.
- Task 9: Ruling: Playwright reuseExistingServer → false — a leftover preview could have been tested instead of the fresh build — cost if wrong: a busy port fails loudly.
- Task 9: Jason (2026-10-21) chose: centre everything not beside the trace (top bar, hero, footer); phone side gutters 16/16; sections beside the trace one gutter in. Edge tests rewritten to that rule. Ruling: closed Menu sheet set display:none — Chrome lays out closed <details> content, so the inspector measured its hidden links off-screen — cost if wrong: none.
- Task 10: Ruling: six headlines shortened in content to fit two lines at 390 (spec §11); proposed to Jason in the M3 message — cost if wrong: copy revert.
- Task 10: Ruling: card link wraps name + headline (+ summary on the wide card) and stretches over the card, instead of a stretched link on the title — the stretched layer covered the headline (inspector covered-text) — cost if wrong: longer link names for screen readers.
- Task 10: Ruling: wide GPGPU headline capped at 2.2rem with a 1.1fr:1fr split and its name at lead size — fits two lines at 1440 and is no longer read as an eyebrow — cost if wrong: one extra type size.
- Task 10: Ruling: closed report-card rows display:none — Chrome lays out closed <details>; this was the mock's "ECE433 above Projects" eyebrow — cost if wrong: none.
- Task 10: Ruling: videos have no autoplay attribute; a script plays them only on screen and never under reduced motion — no-JS shows posters — cost if wrong: no motion without JS.
- Task 11: Ruling: Other projects has 7 course cards, not the plan's 11 — only 7 courses have smaller projects (17 rows) — cost if wrong: none.
- Task 11: Ruling: "Timeline before Skills" asserted only once #skills exists (Task 12) — cost if wrong: none.
- Task 11: Ruling: timeline lane colours kept from the approved mock (education cyan, work gold, teaching mint) although the spec reserves cyan for live/primary — cost if wrong: one colour swap.
- Task 11: Ruling: phone rail text is "<Lane>: <sub>, <dates>" (no case changes) — lowercasing broke "University of Thessaly" — cost if wrong: none.
- Post-M4: Ruling: teaching entries say "Teaching assistant" (Jason's request); dropped "helping students" because the longer line wrapped and overlapped the next entry on desktop — new overlap test guards it — cost if wrong: one word back in the data
- Post-M4: Ruling: "Lab assistant" replaces "Teaching assistant" in the timeline, the lead and the At a glance readout (Jason: no official title, role was the lab part only); spec §5.1 sentence updated to match — cost if wrong: one word
- Post-M4: Ruling: ECE433 HW1–2 added to Other projects (Jason: ECE433 isn't one project), overriding the brief's homeworks-on-course-pages-only rule for ECE433 only; stats now 29 = 10 + 19; ECE338 HW and ECE436 assignments stay course-page-only — cost if wrong: two more content files each
- Post-M4: Ruling: Anastasios Kalousis added to all three ECE433 projects (Jason; named in all three reports, REPORTS_INDEX had missed him) — cost if wrong: one team entry
- Task 12: Ruling: tools lists filled from the repos' source files (C, Java/Gradle, Python, SystemVerilog, Bash) — spec says used-in is derived from tools, and empty lists would undercount C as 2 — cost if wrong: edit one tools line per project
- Task 12: Ruling: first chip is C (11), not CUDA as the brief's test assumed — sorted by count per spec; test asserts the first chip's own name — cost if wrong: none, ordering is the spec's rule
- Task 12: Ruling: MIPS assembly and Linux kernel modules join the coursework list (ECE219, ECE318 Project 1 are in the brief but not on the site); OpenCL, JavaScript, SQLite, Git get "Not in a project on this site yet." pending Jason — cost if wrong: one line
- Task 12: Ruling: Minecraft plugins enter the explorer as a skills-only origin entry in src/data/skills.json (spec: Java, Maven, Gradle, MySQL link there) — cost if wrong: one data entry
- Task 12: Ruling: `self` is the project's href (unique, already in the data) rather than a slug — cost if wrong: Plan 2 passes href
- Task 12: Ruling: no ring/inset shadow on the contact card (mock had one; spec §11 bans shadows); without JS all 38 chips show and no hint is written — cost if wrong: CSS only
- Task 12: Ruling: inspector WARN off-centre @390 (16/28) defended — every block (top bar, hero, all panels, footer) measures 16px from both edges; the 98th-percentile text edge moved because wrapped chips end inside the panel padding — cost if wrong: none visible
- Post-M5: Ruling: ECE433 HW1–2 removed again (Jason: homeworks, not projects); Kalousis stays on the house; stats back to 27 = 10 + 17 — cost if wrong: two content files
- Post-M5: Ruling: Menu sheet lab link removed (Jason: the pill covers it); picking a menu link closes the sheet — cost if wrong: one line
- Post-M5: Ruling: section links glide (scroll-behavior smooth, set only after load so deep links still land at once; off under reduced motion); scroll-padding-top 84px keeps headings below the 68px bar — cost if wrong: CSS only
- Post-M5: Ruling: found while testing the glide — the hero widget grew 85px when its status first arrived, moving everything below it; it now holds its space from load with "Checking the board…" (honest, not fake data) and an empty sub line keeps its height — cost if wrong: the widget is one line taller before data arrives on a fault-free board without a sub line
- Post-M5: Ruling: deep-link trace test polls up to 3s instead of a fixed 800ms wait (flaked under gate load only) — cost if wrong: none
- Post-M5: Ruling: widget status box keeps a 3-line min-height and centres shorter content; the empty sub line collapses (it had left a blank line under 'Status unavailable', Jason) — cost if wrong: CSS only
- Post-M5: Ruling: project tools now come from scripts/skills-evidence.mjs (public ECE repos + project repos + private homelab, tool names only); a unit test fails if content and evidence disagree — Jason's drops/adds encoded in the script — cost if wrong: rerun the script
- Post-M5: Ruling: Git names no coursework in its line (every repo has Git, the list would be all ten courses) — cost if wrong: one condition
- Post-M5: Ruling: Tcl, TypeScript, React added to the vocabulary under Jason's "anything used counts" — cost if wrong: three vocabulary entries
- Post-M5: Ruling: skills scan made strict (Jason: "make the checks stricter") — full repo map, derived outside/on-site, shared root tooling, declared third-party only, unknown file types and README gaps stop the scan; README rulings: GPGPU C++ is Verilator output, DVD ARM/Zynq is PL-only — cost if wrong: one map entry each
- Post-M5: Ruling: lines show the first 3 projects + "N more" (Jason); a list of 4 shows in full rather than "and 1 more"; coursework clause is always "In coursework: …" — cost if wrong: one constant
- Post-M5: Ruling: ECE333 Lab 1 card "Seven-segment display" / "Four-digit display driver" (README's words), order 112.5 before UART; stats 28 = 10 + 18 (Jason: it should have been listed) — cost if wrong: one content file
- Post-M5: Ruling: coursework moves to its own line; more than 2 courses fold behind "In coursework: Show N courses" (Jason) — cost if wrong: one constant
- Post-M5: Ruling: lab pill fades out too (display transitions with allow-discrete; reduced motion still hides at once) — cost if wrong: CSS only
- Post-M5: Ruling: "In other coursework" (Jason)
- Post-M5: Ruling: tablets added to the e2e suite (768×1024, 1024×768) and to the inspector widths; tests choose checks by layout (phone ≤760, rails ≤1100, two-column hero >1100), not by device name — cost if wrong: none
- Post-M5: Ruling: tablet fixes found by those tests — short pill ≤900 (bar wrapped to 98px at 768); compact cards stack ≤1100; cards one column ≤900; personal cards one per row with picture beside text at 901–1100; timeline rails ≤1100 (lanes overlapped); origin button under its text ≤900 — cost if wrong: CSS only; 768 page is long (~10,000px)
- Post-M5: Ruling: width sweep test (320–1920 every 20px + 26 device widths): no sideways scroll, no overlapping text anywhere (sticky bar excluded), card headlines ≤2 lines, one-line top bar — Jason: landscape timeline still overlapped (1110–1260 untested)
- Post-M5: Ruling: timeline switches to rails by measurement (scripts/timeline.ts: any overlap in a lane → rails), CSS fallback ≤1280 for no-JS; compact cards stack by container width (<1110); hero buttons wrap at 320; headlines scale to 5vw under 400px; origin button may wrap under 400px — cost if wrong: CSS/one script
- Post-M5: Ruling: sweep made two-dimensional and run as desktop and phone browser — rules: name on first screen; pictures ≤60% of screen height (hero photo ≤80%); peers in one row equal height (rows grouped by overlapping extents); pictures above text fill the card — Jason: phone landscape pictures too big, Now cards uneven
- Post-M5: Ruling: fixes — card media full width, max 60svh, crops; hero cover max 80svh, phone portrait cover max 35svh; phone landscape uses the photo-beside-name hero; Now cards stretch to one row height — cost if wrong: CSS only
- Final: Ruling: kept html.rv at init (reviewer suggested after first build) — adding it after the first rAF build would flash every section visible then hide it; instead unreachable sections light at once and a throwing build lights all — cost if wrong: a section could flash if build threw
- Final: Ruling: headline approval recorded (Jason approved the shortened headlines at M3: "I like the text") — the brief still said pending
- Final: Ruling: cyan education lane kept from the approved mock (spec reserves cyan for live/actions) — Jason saw it in M4 screenshots and did not object; offered a swap — cost if wrong: one colour token

## Final review: fixed

- stalled stream hangs on "Checking the board…" — widget.spec "a stream that opens but never sends gives up after the staleness limit" RED→GREEN, gate 8/8
- JSON fallback shown as live forever — widget.spec "without the stream, the JSON fallback keeps refreshing, and goes offline when it stops answering" RED→GREEN (polls every 5 s while on screen, staleness armed), gate 8/8
- odd lab data throws (demos null, non-string name/active_demo, faults) — board.test "odd demo lists and non-string fields never throw or print nonsense" RED→GREEN, gate 8/8
- sections the trace can't reach stay hidden; print hides unlit sections — trace.spec "a section the trace cannot reach is never left hidden" and "printing shows every section, lit or not" RED→GREEN, gate 8/8
- loose skills rules (SQLite matched any CREATE TABLE; ARM/Zynq matched the part number) — rescan dropped ECE311 SQLite (restored as Jason's statement: homeworks used SQLite, not in repo); ARM/Zynq on GPGPU, lab, Smith-Waterman verified as PS-side work; unit test content==evidence green

## Deferred minors

- LED does not breathe in project mode; ledBreathing unused; offline LED is ink not grey (spec §7.2)
- trace pulse keeps last status while the stream is closed off screen
- trace rAF loop never idles
- hero Now-row h3s come before the h1 in DOM order
- /pill-test/ ships in dist (delete in Plan 2)
- CV TODO HTML comment ships in page source
- gate does not detect a port-4321 clash; Chrome path hard-coded for this machine
- .impeccable cache/local files tracked in git
- lab-assistant count splits timeline titles on ", "; stats match course code to id by lowercasing
- no favicon

## After the PR was opened

- PR #1 follow-up (Jason, 2026-10-21): solo course cards show Jason's avatar alone instead of a "Solo" pill; spec §7.5 updated — cost if wrong: one line in ProjectCard.astro
