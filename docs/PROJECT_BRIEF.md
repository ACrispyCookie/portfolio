# Project Brief — https://njason.dev

Source of truth for content and priorities. Facts come from Jason's answers, his reports and presentations in `reports/`, his GitHub READMEs, and his colleague's GitHub (October 2026).
- **✅** confirmed by Jason
- **📑** from Jason's own report/presentation in `reports/` (cite the file and page)
- **📄** from a repo README (accurate, but Jason should glance at it)
- **🌐** seen on a live website with Playwright (site + date)
- **❓** unknown or unverified. Don't publish until answered.

> **Materials (Jason, 2026-10-19):** everything available may be used as material: reports, presentations, figures, repo media. CLAUDE.md's privacy rules still apply: crop out student IDs, ORCIDs and logos, and never publish grades files.

> ⚠ **Privacy alert for Jason (2026-10-19):** the public repo `ACrispyCookie/ECE415-High-Performance-Computing` contains `Lab5/NIKAS-IOANNIS-IASON_…_TSOGKAS_…_TSIANTOS_…_lab5.tar.gz`, whose filename includes all three **student IDs**. Consider removing it from the repo and its history.

**Before writing any project copy:** go through `reports/` (see CLAUDE.md → Research material), build `docs/REPORTS_INDEX.md`, and upgrade 📄/❓ items to 📑 where a report confirms them. Reports have more depth and better numbers than the READMEs, so prefer them for highlights and "why it's impressive" lines.

## Identity
- **Name:** Jason Nikas (GitHub: ACrispyCookie) ✅
- **Now:** 5th-year Electrical & Computer Engineering student, University of Thessaly, Volos, Greece ✅
- **Job-seeking message: none** ✅. The site is a generic display of projects. Don't mention internships, "open to work", availability, areas or dates anywhere.
- **Role line (draft):** Electrical & Computer Engineering student building systems from code down to silicon.
- **Story (draft, Jason to edit):** I started programming by writing Minecraft plugins in Java. My own server, ColonyMC, grew to 20–30 players, and I went on to freelance plugins for other servers. Five years of shipping plugins, servers and APIs made me curious about what runs underneath, and ECE courses in digital design, computer architecture and FPGAs answered that. Now I work across the whole stack: co-designing a RISC-V GPGPU, optimizing CUDA code, writing operating-system and distributed-systems software, and running a homelab that hosts a public Live FPGA Lab.
- **Photo:** **yes, in the hero** ✅. Use Jason's **GitHub profile picture** ✅ (`https://avatars.githubusercontent.com/u/30019341?v=4`), fetched at build time and stored locally with a fallback.
- **CV:** none yet ✅. Leave a hidden slot.

## Links
| Link | URL |
|---|---|
| Portfolio (production) | https://njason.dev ✅ |
| GitHub | https://github.com/ACrispyCookie |
| Live FPGA Lab | https://fpga.njason.dev |
| Minecraft portfolio | https://acrispycookie.dev |
| LinkedIn | https://www.linkedin.com/in/jason-nikas-b64163255 |
| Email | nikasjason1@gmail.com |
| X | https://twitter.com/acrispycookie |

## "Now" windows (what Jason is doing now)
- **GPGPU v2:** extending our RISC-V GPGPU with graphics support, DDR memory, branch divergence and warp scheduling ✅
- **Live FPGA Lab:** keeping a real FPGA board online for anyone to run demos on ✅
- **Homelab:** self-hosted infrastructure, automation and networking 📄
- ❓ Optional: thesis topic or anything else current.

## Live FPGA Lab — signature feature (self-initiated) ✅
- https://fpga.njason.dev: hardware demos served from a homelab bench, with live board access and control.
- **1 board.** One visitor controls it at a time; others wait in a **queue with a maximum wait limit**, so nobody hogs the board and the next visitor isn't starved.
- **2 demos:**
  1. **N-body simulation running on the GPGPU** we designed (see GPGPU).
  2. **HDMI driver showing a moving DVD-logo sprite** with collision detection (see DVD Logo FPGA).
- **Worth featuring: yes, strongly.** It is a separate, self-initiated project combining hardware, web, scheduling/fairness and self-hosting. It's the best proof of passion on the site.
- **Board: Smart Zynq SL** (Zynq-7020, `xc7z020`) ✅. The dashboard shows live status (idle/busy), temperature and fault health (🌐 fpga.njason.dev, 2026-10-19). The **GPGPU was ported from the ZedBoard to the Smart Zynq SL** ✅, and not only for the lab: Jason's colleagues now use this project and board to test the GPGPU.
- **How visitors interact** (🌐 site + 📄 `research/Live-FPGA-Lab`):
  1. Pick a demo and press **Start**. If the board is free, it gets programmed for your session; otherwise you join the **queue** and see your place, the number of people waiting, an ETA and a progress bar.
  2. The demo opens embedded in the dashboard (with fullscreen) or in a new tab. **End** frees the board.
  3. **Fairness:** sessions have no time limit while nobody is waiting. Once someone queues, the active session gets **5 minutes** (`contended_session_seconds`) plus a 1-minute handoff. Idle disconnected sessions are dropped after 90 s.
  4. A "Recent sessions" log shows past runs.
- **What each demo shows:**
  - **N-body:** an interactive **3D three.js view** (orbit, zoom, play/pause) whose positions are computed **on the GPGPU on the FPGA over UART**. The demo launches the real FPGA backend; a docstring saying "software backend" is out of date.
  - **DVD Logo:** the FPGA's HDMI output is captured and streamed live to the browser as **MJPEG**.
- **Stack** 📄: Python **FastAPI** web API with a WebSocket state/command channel, an in-memory queue/session manager and a demo proxy. A separate **FPGA agent** service sits next to the board and handles discovery, telemetry, PL/PS programming, reset and fault latching through Xilinx tooling, connected over a local socket. Frontend: **Vite + React**. Deployed as two Docker containers; tests in pytest.
  - Homelab privacy: on the site, describe the architecture as boxes (browser → web app → hardware agent → board). No hosts, ports or paths.
- **Hardest part** ✅: getting the **Vivado Tcl scripts** right (automated programming of PL and PS), and making the lab **recover from faults on its own, without manual intervention**.
- **Live status on the portfolio** ✅. Checked 2026-10-19:
  - The only public REST endpoint, `GET /api/status`, returns just `{"status":"ok","board":true}`. It sends **no CORS header** and **sets a new anonymous `fpga_user` cookie on every call**.
  - The rich data (status, temperature, faults, demos, queue, recent sessions) exists only on the WebSocket. That needs a visitor cookie and registers the visitor as a lab user, so it's wrong for a portfolio widget.
  - **Recommendation:** add one public, read-only endpoint to the **web API**, e.g. `GET /api/public/board`. Built from `BoardManager._public_board()` + `sessions.queue_length()` + the active session, it should return the first available board (falling back to the first board):
    `{ "name": "Smart Zynq SL", "fpga": "xc7z020", "status": "idle|running|fault|offline", "mode": "demo|project", "temperature_c": 45.6, "healthy": true, "active_demo": "gpgpu-nbody" | null, "queue_length": 0, "demos": [{"id","name"}], "updated_at": "…" }`
    - CORS `Access-Control-Allow-Origin: https://njason.dev` (GET only), no cookie, `Cache-Control: max-age=10`.
    - Leave out `device_id` (board serial), bitstream IDs, JTAG context, user and session IDs, and raw fault payloads. Use `healthy` plus fault *types* at most.
    - `mode: project` = "reserved for owner projects" (colleagues testing the GPGPU). Show it as "In use for GPGPU testing".
  - **Don't expose the fpga-agent API.** It has `POST` program/reset/mode/clear-faults routes and JTAG target details. A public proxy, even a filtered one, would let anyone reprogram or reset the board and would leak homelab internals. The web API already holds everything the widget needs.
  - **Implemented** on branch `feature/public-board-status` of Live-FPGA-Lab (commit `049f640`, not merged): `GET /api/public/board` (JSON) and **`GET /api/public/board/stream` (Server-Sent Events, pushed on every change, no polling)**. Env: `WEB_API_BOARD_LABEL=Smart Zynq SL`, `WEB_API_PUBLIC_CORS_ORIGINS=https://njason.dev`.
  - Portfolio side: a tiny island that opens an `EventSource` only while the spotlight is in view, falls back to one JSON fetch if SSE fails, and shows an honest offline state ("Status unavailable · open the lab"). No fake values.

## Collaborators
- **GPGPU team: 3 people** ✅📑. Jason, **Dimitrios Tsiantos** and **Panagiotis Nikolaos Tsogkas** (`reports/ECE338 - Final Presentation.pdf`, p. 1). The earlier "3 colleagues" wording is superseded.
  - Team repo: https://github.com/PANAGIVTHS/ECE338-Parallel-Computer-Architecture. Owner **PANAGIVTHS = Panagiotis Nikolaos Tsogkas** (GitHub profile name). Commits: TsiantosD 123, ACrispyCookie 90, PANAGIVTHS 63. Internal context only; don't present commit counts as contribution shares.
  - Dimitrios Tsiantos: https://github.com/TsiantosD, https://tsiantosd.tech
- **Authors per course, from report title pages** (📑, see `docs/REPORTS_INDEX.md`):
  | Project | Team |
  |---|---|
  | ECE338 GPGPU, ECE415 HPC 1–5, ECE494, ECE455, ECE318 OS 2–3 | Jason + Tsiantos + Tsogkas |
  | ECE436 Wireless | Jason + Tsiantos + **Panagiotis Balamotis** |
  | ECE340 Embedded Lab 3, ECE433 Graphics | Jason + Tsogkas |
  | ECE333 Digital Systems Lab | Jason alone |
  | ECE348 Distributed | **solo** ✅ |
  | ECE321 Concurrent | **team** ✅: Jason + Tsogkas + **Tvangos** (a colleague, ECE321 teammate ✅; GitHub https://github.com/Tvangos, no public name, so show the handle unless Jason gives a name) |
- **tsiantosd.tech credits Jason** (🌐 2026-10-19) as "Project collaborator" on **Parallel Computer Architecture (Simple GPGPU)**, **Microprocessor Design**, **High Performance Computing**, **Operating Systems**, **Wireless Communications** and **Hardware Security**. Each is "Team of 3": Tsiantos + Jason + Tsogkas, except Wireless, which is Tsiantos + Jason + Balamotis. This matches the reports. Dimitrios's **Embedded Systems** team is with a different partner (Zerdalis), and Jason's ECE340 was with Tsogkas, so the two were separate teams. His site links Jason's LinkedIn, not GitHub.
  - His site also hosts a "GPGPU 3D Visualizer". ✅ That's the team's 3D n-body demo for the GPGPU, the same one the Live FPGA Lab serves.
- Collaborator stacks approved ✅. **Avatars:** public GitHub avatars, fetched at build time, with an initials fallback ✅. Handles: Tsiantos https://github.com/TsiantosD · Tsogkas https://github.com/PANAGIVTHS ✅ · Balamotis https://github.com/Balamotakos ✅ · Tvangos https://github.com/Tvangos. Link each avatar to GitHub.

## Grades (for the score boxes)
Source: `docs/GRADES.md` ✅ (Jason's file; **never publish the file itself**, it includes failed and ungraded courses). Rule from Jason: show only **relevant, strong** grades, nothing below the 8.5–9 line. Applied as **≥ 9.0**, and only courses with a project on the site:

| Course | Grade | Links to |
|---|---|---|
| ECE494 Processor Design | 10 | CV32E40P card |
| ECE436 Wireless Communications | 10 | Wi-Fi fairness card |
| ECE318 Operating Systems | 10 | FUSE card |
| ECE321 Multithreaded/Concurrent Programming | 10 | threads runtime card |
| ECE433 Computer Graphics | 10 | 3D house card |
| ECE415 High Performance Computing | 9.5 | N-body flagship |
| ECE455 Hardware Security | 9.5 | air-gap card |
| ECE348 Distributed Systems | 9.5 | distributed runtime card |
| ECE338 Parallel Computer Architecture | 9 | GPGPU flagship |
| ECE333 Digital Systems | 9 | Digital Systems Lab card |

- **Not shown** ✅: ECE340 and ECE219 (8.5).
- **No "Also 10/10" line** ✅. Only the 10 project-linked grades above.

## Project tiers (✅ approved structure, with Jason's requested changes applied)

### Tier 1 — Flagship (large cards near the top + full case-study page)
**1. GPGPU: RISC-V GPGPU on an FPGA** — team project
- Co-designed and implemented a GPGPU built from RISC-V cores, with the host software to program it ✅
- **Ran on a ZedBoard with 32 cores, running an N-body simulation** ✅. That N-body demo is live on the FPGA Lab.
- **Results:** at **~38.5 MHz**, a 32-body N-body step takes **~129 µs** on the GPGPU vs **~308 µs** on the ZedBoard's own ARM Cortex-A9 at ~667 MHz, so it's **~2.38× faster at about 1/17 of the clock** (📑 `reports/ECE338 - Final Presentation.pdf`, p. 46). Peak ≈ 1.23 GINTOPS; data memory 307 MB/s (p. 46–47).
- **Architecture:** 32 RISC-V lanes in lockstep behind a shared fetch/decode front-end, a 5-stage pipeline with hazard/forwarding units, a pipelined multiplier, and an Nx2 crossbar into dual-port BRAM. No hardware divergence yet, which is why v2 adds it. (📑 same file, p. 8–15)
- **Verification:** Python golden model, constrained-random tests and an instruction fuzzer, extended to end-to-end tests on the board (📑 p. 18–21, 32)
- Integration through the Zynq ARM core and AXI GPIO, after a PL-side UART proved unreliable (📑 p. 27–31). Uses 88% of the FPGA's LUTs (📑 p. 49). The host UART link (~11.5 KB/s) is the bottleneck (📑 p. 48).
- Host toolchain compiles programs, loads instruction memory over UART, runs kernels in resumable chunks with state kept in data memory, and plots the output live as SVG 📄
- Jason's role: joint co-design and implementation, with extra depth in host ↔ device communication ✅. The report doesn't break down individual roles.
- Figure candidates (need Jason's approval): the Vivado implemented-device view "Runs on Zedboard!" (p. 5) and the execution-flow diagram (p. 6)
- Next: graphics, DDR memory, divergence, warp scheduling ✅ (`In progress` pill)
- Repos: https://github.com/ACrispyCookie/GPGPU · team repo above. Pills: `Team project` `Live demo` `In progress`.

**2. Live FPGA Lab** — self-initiated (see the section above). Pills: `Self-initiated` `Live demo`.

**3. ECE415 High-Performance Computing: CUDA N-body optimization**
- Progression from CPU loop optimization (Sobel) → OpenMP K-Means → CUDA 2D convolution → CUDA CLAHE → galaxy N-body simulator 📄
- N-body CUDA optimization ladder: Structure-of-Arrays, shared-memory tiling, FMA/fast math, thread coarsening, launch-bound tuning, divergence reduction, **multi-GPU** 📄
- Media: N-body animation GIF and a CPU-vs-GPU throughput chart in the repo 📄
- **N-body result:** the final multi-GPU version runs **2910× faster than the sequential CPU code** (293.3 s → 0.0997 s; 0.148 → **431 billion interactions/s**), and 40× faster than the OpenMP CPU version (📑 `reports/Overleaf Projects/High Performance Computing - Project 5/main-EN.tex`, §Results and measurements). Steps: OpenMP 72× → naive GPU 197× → tiling 369× → read-only cache/FMA 571× → multi-GPU 2175× → divergence removal 2910×.
- **Other projects in the progression** (📑 HPC Projects 1–4): Sobel **21.49×** over the original C code on an Intel Core i5-1235U (4096², `-fast`); K-Means OpenMP **17.31×** with 56 threads; CUDA convolution up to **16.97×** over the CPU on a Tesla K80; CUDA CLAHE **1334 MPixel/s**, about 24× the CPU version on a Tesla K80.
- **Hardware: 4× NVIDIA Tesla K80** ✅ (the multi-GPU step uses all four). The same server ran Projects 3–4.
- The repo chart `research/ECE415-High-Performance-Computing/docs/images/lab5-throughput-comparison.png` matches the report (final ≈ 431 B interactions/s) 📄📑. It's a good candidate for a restyled chart.

### Tier 2 — Featured (medium cards, short write-up, project page optional)
**ECE318 Operating Systems: deduplicating FUSE filesystem** ⬆ raised
- Content-addressed storage: 4 KB blocks hashed with SHA-1 and stored once, reference counting, a circular free-block list with partial defragmentation, and a persistent node hierarchy 📄
- Confirmed by the report, plus a **16 TB** unique-data limit (2³² blocks × 4 KB) and a 14-test Python suite (📑 `reports/Overleaf Projects/Operating Systems - Project 3/main-EN.tex`). **The final version deduplicates blocks** ✅. Don't describe it as a compressed filesystem (tsiantosd.tech calls it "Compressed Filesystem"; ours says deduplicating).
- **Ran a Minecraft server on top of it** ✅, through FUSE, until multithreaded chunk generation became the limit. The report doesn't mention it, but Jason confirms it.
- Also: Linux syscall and kernel module work (sysfs, Kyber I/O scheduler module) 📄 (no report for this project). A modified-SJF CPU scheduler that prevents starvation, analysed with Gantt charts (📑 `Operating Systems - Project 2/main.tex`; qualitative, no headline number).

**ECE321 Concurrent Programming: user-level threads runtime** ⬆ raised
- Coroutine library (`ucontext`) → user-level thread runtime with round-robin scheduling, **timer-based preemption**, yield/sleep/join and semaphores, then earlier workloads ported onto it 📄
- Plus pthreads, System V semaphores and monitors (narrow bridge, train ride, readers/writers) 📄
- Confirmed by 📑 `reports/ECE321 - Project 1–4.pdf`. Project 4 covers the coroutine → `mythreads` runtime and preemption that's safe in critical sections. There are no performance numbers, so lead with the design.

**ECE494 Microprocessor Design: CV32E40P timing optimization** ⬆ raised
- Small FPGA SoC around the **CV32E40P** RISC-V core on a ZedBoard. Found the critical path in Vivado and compared four variants with forwarding paths removed ✅📄
- Removing multiplier forwarding (stalling instead) let the clock period drop **15 ns → 14 ns** (target 66.7 → 71.4 MHz, +7.1%). Estimated **Fmax 66.8 → 73.2 MHz (+9.6%)**; critical path 14.87 → 13.44 ns (📑 `reports/ECE494 - Final.pdf`, p. 14)
- **Cost:** LUTs 4171 → 4314 (**+3.4%**), power 120 → 121 mW (📑 `Overleaf Projects/Microprocessor Design/main.tex`, §Utilization and Power; slides p. 12–13). ⚠ The slide's "+0.27% LUTs" means percentage points of the whole device, so don't quote it as a relative increase.
- **Measured effect:** **8.7% shorter run time** on workloads without multiplier dependencies (Dhrystone, SHA-256, IPv4 packet processing, control FSM, sorts); 2.0% faster on `multiply`; 0.4% slower on matrix multiply. Break-even is at a 9.6% dependency rate. (📑 main.tex §Theoretical Performance; slides p. 16)
- Cause: removing the forwarding muxes eased routing congestion (📑 slides p. 11, delay histogram)
- Verified with assembly regression tests against a Python golden model and benchmarked with RV32IM programs 📑
- Grade **10/10** ✅

**ECE455 Hardware Security: RAMBO air-gap side-channel reproduction** *(outcome level only; see CLAUDE.md)*
- **What it showed:** reproduced published research (RAMBO) demonstrating that a computer with no network connection can still leak data through the radio emissions of its RAM ✅📑
- **Setup:** an unprivileged program on an offline laptop, with an ADALM-PLUTO software-defined radio and GNU Radio listening nearby (📑 `reports/Hardware Security Presentation.pdf`, p. 4, 9)
- **Results:** a 128-bit message got through with **0% bit errors at up to 32 bps from 1 m away**. Errors rose at 64 bps (9.7–29.7%), and 128 bps failed beyond 25 cm. (📑 same file, p. 11; `Overleaf Projects/Hardware Security - Project/conference_101719.tex`, §Results and Analysis)
- **2 m at 128 bps:** Jason says ✅ the team did achieve it, but it **wasn't captured** (no log, not in the report). **Don't use it on the site** ✅. Publish only the measured table (≤ 1 m). The ECE455 README still states it; that's Jason's call, not a site concern.
  - Minor conflict: per-run error rates in the repo logs differ somewhat from the report's table (e.g. 64 bps at 25 cm). The report wins as the higher-trust source.
- **Defensive takeaway:** physical isolation alone isn't a security guarantee. Distance and ambient noise sharply limit the channel. (📑 report §Conclusion)
- Media: setup photo + live decoding GIF in the repo 📄. Slide p. 9 photos are clean of names.

**ECE348 Distributed Systems: distributed runtime with live migration**
- UDP request/reply with at-most-once semantics → causal/total-order group communication (Java) → network file system with an LRU cache → **SimpleScript distributed runtime** 📄
- The runtime has a distributed tuple space, **live thread migration** across nodes, load balancing, and graceful draining on shutdown 📄📑 (`reports/Distributed Systems - Assignment 4.pdf`, p. 10–17)
- **Numbers:** the client-side cache raised file-system throughput from **~10.5 MB/s to ~53 MB/s (~5×)** once it held the working set (📑 Assignment 3, p. 21). The request/reply server scaled from **112 to 1413 req/s** going from 1 to 16 worker threads (📑 Assignment 1, p. 25). Total-order multicast measured **64.2 packets per message** in a group of 4, matching the predicted 4N² (📑 Assignment 2, p. 26–27).
- **Solo project** ✅

**ECE333 Digital Systems Lab + DVD Logo FPGA**
- Verilog on the Nexys A7: UART pipeline, VGA renderer with BRAM framebuffer, SPI driver for the ADXL362 accelerometer. Capstone: **accelerometer-controlled VGA sprite** (demo video in repo) 📄
- 📑 Labs 1–3 reports are Jason's alone (`Overleaf Projects/Digital Systems Lab - Lab 1–3/`). Lab 3 (VGA, 25 MHz pixel clock) already includes an **optional DVD-logo bouncing sprite Jason added on his own**, which is where DVD Logo FPGA started. The SPI/accelerometer capstone has no report (📄 only).
- **Four labs** ✅ (Jason, 2026-10-19): Lab 1 7-segment/LED driver, Lab 2 UART, Lab 3 VGA controller, **Lab 4 SPI driver for the accelerometer**. In Lab 3 both the **DVD-logo sprite and the video shown through the VGA controller were optional**. In Lab 4 Jason brought the Lab 3 DVD logo over and **drove it with the accelerometer**, a Lab 3 → Lab 4 connection that **wasn't even listed as an optional extension**.
- Mention briefly ✅: Jason **ported the final project to HDMI on the Smart Zynq SL** (https://github.com/ACrispyCookie/DVD-Logo-FPGA). 640×480 via TMDS, sprite bouncing with edge collision and colour change, tilt or button control. This is the second **Live FPGA Lab** demo. Pill: `Self-initiated`.

**ECE436 Wireless Communications: Wi-Fi fairness study** *(outcome level only; see CLAUDE.md)*
- **What it showed:** one station with a modified Linux Wi-Fi driver (ath9k) can ignore 802.11's cooperative sharing rules and starve well-behaved neighbours 📄📑
- **Setup:** automated, scripted experiments on the university's **NITLab** wireless testbed (📑 `reports/ECE436 - Final.pdf`, p. 13–17)
- **Results:** a fair station alone gets **87.7 Mbit/s**. Once the modified station joins, the modified station gets **96.0 Mbit/s** and the fair one **0.02 Mbit/s**. The fair link stayed starved (4.16 Mbit/s) even after switching channel. (📑 `Overleaf Projects/Project - Wireless Communications/main.tex`, §Results and Evaluation; slides p. 21)
- **Defensive takeaway:** Wi-Fi fairness depends on every device behaving, so one misbehaving commodity device can take over a network.
- Team: Jason + Tsiantos + Balamotis (📑 p. 1)

**ECE433 Computer Graphics: explorable 3D house (OpenGL)**
- First-person explorable house in C++/OpenGL: day/night cycle, dynamic lighting with a flashlight, transparency sorting, OBJ model loading, NURBS terrain, hot-reloadable assets 📄
- Media: several screenshots in the repo 📄
- 📑 `Overleaf Projects/Computer Graphics - Homework 3/` confirms the engine (object tree, managers, OBJ loader, **NURBS mountain range**). Team: Jason + Tsogkas.

### Self-initiated band: "Built because I wanted to"
A visual band of its own (the passion proof). Live FPGA Lab and DVD Logo FPGA link back to their cards.
- **Homelab** ✅: self-hosted infrastructure for services, automation and networking experiments. Hosts the Live FPGA Lab.
  - Show only a **privacy-safe diagram**: service categories (Virtualization, Containers, Reverse proxy, VPN access, DNS filtering, Home automation, FPGA bench), with no IPs, hostnames, VLANs, ports, versions or topology.
  - ❓ Jason is making a diagram; until then use a stylized category diagram.
- **GoWin IDE Docker image**: runs the GoWin FPGA IDE in a container with GUI and USB forwarding 📄
- **KoukBot** (❌ not on the site for now, Jason 2026-10-19): Discord bot started during COVID online school. Announces upcoming classes from a timetable, plus music, leveling and to-dos (Java) 📄
- **AutoRapidTest**: automated, cron-scheduled COVID self-test submissions on gov.gr with scheduling and email copies (Node.js) 📄

### Tier 3 — Compact list ("More on GitHub")
- **ECE340 Embedded Systems:** floating-point adder (single-cycle and pipelined) → packaged as AXI IP on Zynq → Smith-Waterman sequence alignment accelerated with Vitis HLS 📄. **Stays Tier 3:** software reached up to 3.81× on x86, but the FPGA versions failed on the board apart from one unbenchmarked run (~8.8 ms vs 1.6 ms estimated), so there's no hardware speedup to claim (📑 `Overleaf Projects/Embedded Systems - Lab 3/conference_101719.tex`, §Execution, §Hardware Execution). Team: Jason + Tsogkas.
- **ECE219 Computer Organization:** MIPS assembly, single-cycle and extended Verilog CPU, C optimization labs 📄
- **dotfiles**

### Origin story — Minecraft (compact section, scroll timeline)
- ~5 years of Java/Spigot/BungeeCord development ✅📄
- **Own server peaked at about 20–30 players** ✅
- After ColonyMC: freelance plugin work for other servers (no client names ✅). Earlier answer "3+ projects for the second client" is superseded: don't mention clients specifically.
- 🌐 acrispycookie.dev (2026-10-19) answers the Colony question: the **Colony plugins were for Jason's own server, ColonyMC** ("Server owner and main developer", Dec 2019 – Apr 2021), so they're not client work. It lists ColonyModeration, ColonySkyblockCore, ColonyVikingItems, ColonyHubCore, ColonySpigotLib and ColonyBungeeCore.
  - **InjectPvP** (May–Jul 2021): one project, then work with their dev team on a bigger one. **InjectDuels** (duels with wagers) is listed. Then freelancing (Jul 2021 – present, "2–3 projects for other customers").
  - ✅ **Don't mention specific clients** (Jason: the client work was small). ColonyMC is the server that peaked at **20–30 players** ✅.
  - ✅ Anything on acrispycookie.dev may be used: project names and short descriptions, and the testimonials.
  - ⚠ Stale detail on that site: a "Download Resume" link to an old PDF (Jason is 22, so the age is correct ✅; "© 2024" also old). Jason will update the site himself ✅ (2026-10-20).
- Notable: **DynamicDisplays** (shows images and videos in Minecraft using text displays), **CrispyPluginAPI** (shared config and database framework for his plugins), CrispyCommons 📄
- Message: "where I learned to ship software real people use." Link to https://acrispycookie.dev.

## Skills (pills, grouped by domain)
- **Hardware & FPGA:** Verilog, SystemVerilog, RISC-V, Vivado/Vitis, Vitis HLS, ARM/Zynq, MIPS assembly
- **Parallel & HPC:** CUDA, OpenMP, OpenCL, pthreads
- **Systems & OS:** Linux kernel modules, FUSE, Docker, Proxmox
- **Networking:** Traefik, Nginx, WireGuard, Pi-hole, Ansible, ath9k
- **Security & Wireless:** SDR (ADALM-PLUTO), GNU Radio
- **Languages:** C, C++, Python, Java, JavaScript, Bash, MATLAB
- **Data & Tools:** PostgreSQL, MySQL, MongoDB, SQLite, Git, Maven, Gradle
- **Graphics:** OpenGL

## Reference: what works on tsiantosd.tech (🌐 2026-10-19; learn from it, don't copy)
- **Context pill under the title:** a solid "Team of 3" pill with tiny person icons. You read the team size before anything else.
- **Small outlined tech pills** (≈11 px, rounded, thin border) with a **"+N" overflow pill** on cards, and the full set on the detail page. This keeps cards tidy. → Use the same overflow idea, colour-coded by domain.
- **Card footer meta row:** "📖 N projects · 👥 N people · Open →". Scannable and consistent. → Ours: course code · team size · status, plus links.
- **Collaborator chips:** avatar + name + LinkedIn icon in a "PROJECT COLLABORATORS" box. Clear credit with one click. → Ours: overlapping avatar stack linking to GitHub.
- **Grade:** a ring gauge on the course page and a "%" badge on the card image. → Ours: grade tiles, confirmed grades only.
- **Snapshot stats strip** (12 courses · 24 projects · 93% avg · 9 collaborators): dense and recruiter-friendly.
- **Section eyebrows** ("● SNAPSHOT", "● SELECTED WORK") and a sticky course sub-header with "← back" and a "Repository" button.
- **Things not to repeat** (our identity must differ): dark navy hero with a centered photo card, a fake terminal "$ currently" box, a marquee strip of all-caps skills, stock/AI hero images per course, mint-green accent on light blue-grey grid cards, and identical 3-column card grids. Several of these are on the CLAUDE.md avoid-list anyway.

## Card template
1. **What it is:** one plain-language line.
2. **Why it's impressive:** one line, ideally with a real number.
3. **Highlights:** 2–3 bullets (Tier 1–2).
4. **Pills:** tech (max ~6) + context.
5. **Collaborators:** avatar stack (confirmed people only).
6. **Grade box:** if confirmed.
7. **Links:** Code · Run on live FPGA · Video · Case study.

Suggested `projects` collection fields: `title`, `slug`, `tier`, `order`, `summary`, `whyItMatters`, `highlights[]`, `tech[]`, `domains[]`, `context[]` (`course` | `team` | `self-initiated`), `status` (`complete` | `in-progress`), `course` (code, name), `grade?`, `collaborators[]` (refs), `links {repo, teamRepo, fpga, video, page}`, `media`, `year`.

## Still open (❓ summary), with where to look first
| # | Question | Look in | Then |
|---|---|---|---|
| 1 | GPGPU team size and members' names | ✅📑 Team of 3 (Jason, Tsiantos, Tsogkas) | Avatar consent still needs Jason |
| 2 | Which course projects were team projects, and with whom | ✅ Answered (see Collaborators table). Jason (2026-10-21): ECE321 Projects 1–4 all with Tsogkas + Tvangos; ECE348 Assignments 1–4 all solo. | — |
| 3 | Grades to display | ✅ 10 tiles, ≥ 9.0, project-linked only | — |
| 4 | Live FPGA Lab: board, how visitors see the board, web stack, hardest part | ✅🌐📄 Smart Zynq SL; queue + 5-minute contended slot; 3D view / MJPEG stream; FastAPI + React + hardware agent | Ask Jason what was hardest |
| 5 | ECE415 speedups and GPU model | ✅📑 2910×, 4× Tesla K80 | — |
| 6 | ECE455: "2 m at 128 bps" claim, bit-error results | ✅📑 Publish only the measured ≤ 1 m table; 2 m was achieved but not captured, so don't use it | — |
| 7 | ECE494: benchmark speedup/slowdown, LUT/FF/power changes | 📑 Answered | — |
| 8 | ECE340: measured x86 / ARM / FPGA results (could raise its tier) | 📑 Answered: no FPGA result, stays Tier 3 | — |
| 9 | ECE318, ECE321, ECE348, ECE436 key numbers | 📑✅ answered | — |
| 10 | GPGPU: architecture details (warps, pipeline, memory) and results on the ZedBoard | 📑 Answered | — |
| 11 | Minecraft: clients | ✅ Don't name clients; Colony plugins = own server ColonyMC (20–30 players) | — |
| 12 | Internship messaging | ✅ None at all; generic project showcase | — |
| 13 | Photo: yes or no | ✅ GitHub profile picture | — |

## Site structure decisions (Jason, 2026-10-19)
- **Two kinds of page.** Course pages `/courses/<code>` hold every project of that course as a section (flagship first). Personal projects live at `/projects/<name>`.
- **Projects with their own page:** the five flagships (GPGPU, N-body, RAMBO, 3D house, Wi-Fi jammer), **ECE348 Assignment 4 distributed runtime** (Jason corrected: he meant this, not the RPC library). **Rule:** only the 9 cards under Projects and Personal projects get a separate page; everything else (FUSE, user-level threads, RPC library, …) is a section on its course page. All other course projects are sections on their course page.
- **Home-page cards link to the project's section on its course page.**
- **Minecraft plugins:** no page; a mention linking to https://acrispycookie.dev.
- **KoukBot:** left out for now.
- **DVD Logo FPGA (HDMI port on the Smart Zynq SL):** its own personal page `/projects/dvd-logo-fpga`. The ECE333 course page lists it after Lab 4 as a continuation "just because I wanted to make something more fun".
- **ECE340 grade shown** (8.5) on its course row and page, so every course has a grade; ECE340 comes last in the courses order (Jason, 2026-10-19).
- **Home page order (revised after the wireframe, Jason 2026-10-19):** Who + Now as **one connected block** → **summary with a few statistics** → Projects → Personal projects → Other projects → Courses (shown in a more meaningful way, lower down) → Timeline → Contact. ~~Courses right after Now~~ (rejected: the course rows only said the grade).
- **Timeline:** like acrispycookie.dev's vertical timeline, but one section with **several parallel threads** (e.g. education, work, teaching).
- **Card headlines must be accurate and the most impressive fact:** "0% bit errors" (RAMBO) is not accurate; "Day, night and a flashlight" (3D house) isn't the most impressive thing.
- **Projects section:** not a separate "flagship" category. 7–10 normally sized cards; the flagships come first and look slightly different (more emphasis). The remaining course projects go in a **smaller grid** ("Other projects") placed below Personal projects.
- **Cards, final list (Jason, 2026-10-19):** Projects + Personal projects together hold **9 cards**: GPGPU, N-body, RAMBO, Wi-Fi jammer, 3D house, Distributed runtime | Live FPGA Lab, DVD Logo FPGA, Homelab. **Everything else** (CV32E40P, RPC library, FUSE, user-level threads, multicast, NFS cache, CLAHE, K-means, Sobel, CUDA convolution, scheduler, ECE333 labs, Smith-Waterman) goes to the smaller **Other projects** grid. Homeworks and assignments (ECE338 HW1–3, ECE433 HW1–2, ECE436 assignments) appear only on their course pages.

## Timeline (Jason, 2026-10-19) ✅
Projects are **not** on the timeline; it holds education, work and volunteering only.
- **12/2019 – 04/2021:** ColonyMC, own Minecraft server, owner and main developer (🌐 acrispycookie.dev), peaked at 20–30 players.
- **Freelance Minecraft plugin development:** **05/2021 – 09/2021**, then 07/2022 – ~05/2023. acrispycookie.dev (🌐 2026-10-19) says freelancing began with InjectPvP in May 2021 ("After ColonyMC I started working as a freelancer"), so the first period starts 05/2021 ✅. Supersedes "Jul 2021 – present" from acrispycookie.dev.
- **09/2022:** started Electrical and Computer Engineering, University of Thessaly.
- **Volunteer teaching assistant**, picked for each course because of a good grade. Duties across these roles: helping students and answering their questions, grading, and oral exams.
  - Programming I: 09/2025 – 01/2026, and again 09/2026 – now (helping)
  - Programming II: 02/2026 – 06/2026 (helping)
  - Numerical Analysis: 02/2026 – 06/2026 (helping)
  - Computer Organization and Architecture: 09/2026 – now (grading)

Project dates (for project pages, not the timeline): GPGPU (ECE338) ~03/2026 – 06/2026; Live FPGA Lab public ~08/2026.
- **Now section (Jason, 2026-10-19):** modern widgets, not plain text. Project widgets (GPGPU v2, Homelab: name + 3–5 words) link to their project pages, and GPGPU v2 also has "Run the demo". A separate **Live FPGA Lab widget** shows live board state and links to https://fpga.njason.dev.
- **Contact (Jason, 2026-10-19):** a simple, typical contact section.
- **Live FPGA Lab card under Personal projects** is a normal card (picture, sentence, link to its page); the full live widget lives only in Now ✅. Contact: heading, one line, email with copy button, GitHub, LinkedIn; more links possibly later ✅.
- **Summary statistics:** ~~2,910× biggest speedup~~ (Jason: not relevant there) → proposed replacement "2 demos you can run live on a real FPGA board" ❓; **27 projects** on the site (10 main + 17 smaller); 4 volunteer TA roles since 2025; writing code since 2019. No average grade.
- **Card headlines (approved 2026-10-19):** GPGPU "32 RISC-V cores we designed, running on a real FPGA" · N-body "2,910× faster than the single-core version" · RAMBO "Read data from a computer with no network, using only its memory's radio noise" (outcome only) · Wi-Fi jammer "One modified Wi-Fi card cut its neighbour from 87.7 to 0.02 Mbit/s" · 3D house "A 3D engine we wrote from scratch in C++ and OpenGL" · Distributed runtime "Running programs move between machines without stopping".
- **Who + Now (approved):** one shared panel; photo, name, role line; the live lab widget beside the name on desktop; "Currently working on" with GPGPU v2 and Homelab widgets below.
- **Courses (approved):** grouped by area (Hardware · Parallel and HPC · Systems · Networks and Security); each course shows what was built in it and its flagship; the grade is a small badge.
- **Timeline (approved):** one vertical time axis with three lanes (Education, Work, Teaching); on a phone the lanes merge into one line with a lane tag per entry.
- **Wireframe v2 feedback (Jason, 2026-10-19):** bigger photo; **ECE321 P4 user-level threads becomes a main Projects card with its own page** (10 main cards: 7 projects + 3 personal); **GPGPU gets a bigger card** than the other flagships; ECE321 P1–P3 go into Other projects. Likes the lane timeline. Unsure whether a Courses section adds value or bloats the page.
- **Inspiration (Jason):** https://emmatsak.github.io/portfolio, for its aesthetics and interactivity: dark layered surfaces, a rotating 3D line-art object in the hero (canvas), cards with real screenshots, tabbed interactive panels (workflow, skills, experience), contact card with photo. Keep our cyan and the taste rules (no eyebrows, no mono pills, no violet).
- **Wireframe v3 feedback (Jason, 2026-10-20):** **no Courses section on the home page** (not helpful); courses live only on their own pages, reached from the project cards. The phone timeline must keep the separate threads (now: three rails, git-graph style). **Minecraft plugins must be mentioned** → compact "Where I started: Minecraft plugins" link card under Personal projects (→ acrispycookie.dev), and the timeline says "Minecraft plugin developer". Stats: Jason likes "27 projects" and the TA stat; the others lacked meaning → proposed "5 courses graded 10/10, each with a project on this site", then changed by Jason (2026-10-20) to **"8 courses graded 9.5 or higher, each with a project on this site"** ✅ (ECE494, ECE436, ECE318, ECE321, ECE433 at 10; ECE415, ECE455, ECE348 at 9.5).

- **Photo and grades (Jason, 2026-10-20) ✅:** hero photo as a **cover** (phone: wide band across the top of the Who + Now panel, name under it; desktop: tall rounded picture on the left of the panel). Course grades shown as a **folded report card** under "At a glance": one closed line ("Course grades, 11 courses") that opens into a list with a bar per grade and the linked project; covers the 11 courses with a project on the site, ECE340 included. Options board: https://claude.ai/artifact/Fm1YHTYZ5wcpf4VNzz4pMb. The current photo is the 400 px GitHub avatar (Jason from behind, facing Mount Fuji); Jason supplied the 2000×2000 original ✅ (saved as `media/profile-fuji.jpg`, outside `reports/`/`research/`). On the phone the cover shows the whole square photo, uncropped ✅.
- **Wireframe v5 decisions (Jason, 2026-10-20) ✅:** no 3D hero object for now. GPGPU "Run the demo" goes **directly to the lab** (https://fpga.njason.dev). Skills: the layered "code down to silicon" stack was rejected (Jason: the tools cannot be categorized correctly). A flat chip list was "too plain". Now a **skills explorer** before the Timeline: ungrouped chips (left; on phone a sideways-scrolling block of rows) and a dark panel (right; below on phone) showing the chosen tool and the projects that use it as small picture cards, linked to the projects. Mapping comes from each project's tool list ❓. Per-card pictures and full copy are deferred.
- **Wireframe v6 (2026-10-20), proposed ❓:** sticky top bar (name; Projects, Skills, Timeline, Contact; a "Live FPGA Lab" pill; a Menu sheet on phone) and a footer card (name, line, GitHub, LinkedIn, Email, Live FPGA Lab, Minecraft plugins, © and "Built with Astro, self-hosted"). **Project page template** (example GPGPU): breadcrumb to the course, title, headline, tags, buttons (Run the demo → lab, Code, Team repo), large media, four key numbers, then a side table of contents (sideways strip on phone) over What it is, Why it's hard, How it works (diagram), Results (chart), How we tested it, My part, What's next, Tools (chips open the skills explorer), Team (people with links), and previous/next project. **Course page template** (example ECE415): title, one-line intro, team, grade box, a step strip only when the projects form a sequence, then each project as a section, the main one first with a heavier outline and "Read the full page", alternating picture sides.
- **Course page detail (Jason, 2026-10-20) ✅:** the course page must explain **each project in detail, with images, code, descriptions and reports**. Wireframe v6.1: each project is a full card with headline, tags, buttons (Code, Report (PDF), plus "Read the full page" for the main project) and five tabs: **Overview** (gallery + description), **How it works** (steps + a figure), **Results** (chart + conditions), **Code** (an excerpt with a GitHub link), **Report** (cover, "Read the report", "Download"). Without JS all tabs show stacked. Project page template approved ✅.
  - **Reports on the site:** Jason wants them linked. Per CLAUDE.md each one is published only as a **cleaned copy** (no student IDs, other students' full names beyond confirmed collaborators, professor comments or course handouts) and only after Jason approves that specific file ❓.
- **Teams on course pages (2026-10-20):** each project shows its own team (tag "Team of N" or "Solo" + avatars), because teammates can differ between projects of one course; the course header shows no team. Reports: Jason will clean them himself later ✅.
- **Visual direction (Jason, 2026-10-20) ✅:** **dark only**, no light theme for now. Signature moment: **the live lab widget**. Must not feel too packed, too generic or too "hacker". Chosen world: **the circuit board**: teal-black solder-mask ground with raised mask shades for depth, off-white silkscreen type, cyan only for live/primary, gold round pads at trace ends, rounded copper traces leading from the live board into the page; Bricolage Grotesque + Hanken Grotesk. Sketch: https://claude.ai/artifact/MvEDsriWx3H1yRwZ2cpaFu. Direction contract: `.impeccable/surfaces/src-pages-index-astro.md`.
- **Styled mock feedback (Jason, 2026-10-20):** likes the circuit-board design. Wants: one **continuous trace** from the live board through every section with the pulse running the whole way, drawn as you scroll (also on phone); **more cohesion**: the skills explorer appears on project and course pages too (filtered to their tools); **contact as its own card**; **no extra outline on flagship cards** (it doesn't make them stand out). Mock v2: flagships are bigger 2-column cards, the other two are compact horizontal cards. Mock: https://claude.ai/artifact/WaA48oCosrJ1nbBZEPsB2c.
- **Builder-check answers (Jason, 2026-10-20) ✅:**
  - Homelab-only tools may be named and linked to Homelab in the skills explorer (software names OK; versions, hosts, IPs, ports, VLANs, layout still hidden).
  - MySQL, Java, Maven and Gradle link to the Minecraft plugins.
  - MongoDB, PostgreSQL and MATLAB stay as chips, from courses not on the site.
  - Jason will remove the ECE415 Lab 5 archive (students' names/IDs in its file name) from the repo before launch.
  - High school 09/2019 – 06/2022 confirmed for the timeline.
- ✅ **Styled mock v4–v6 decisions (Jason, 2026-10-20):**
  - Hero: photo with "Currently working on" under it (left), name, one sentence, buttons and a compact live card (right). A small photo crop is fine.
  - Hero sentence approved: "I build systems from code down to hardware: GPUs on FPGAs, CUDA programs, operating systems and distributed systems." Changed by Jason (2026-10-21): "operating systems" overstated the OS work, so the sentence now ends "…CUDA programs, filesystems and distributed runtimes." (FUSE filesystem, ECE348 runtime) ✅
  - Hero buttons: See my projects (highlighted), GitHub, LinkedIn. No Contact button.
  - Live FPGA Lab mentioned less: removed from the footer and the contact card. The top-bar pill appears only once the hero widget is off screen.
  - Contact's last row and a footer link: "Older portfolio" (acrispycookie.dev).
  - Skills: inline chips with project counts and a one-line "Used in …"; the two-panel explorer was too bloated.
  - Timeline comes before Skills; the quiet 2023–2025 stretch is shortened behind a break.
- ✅ **Design doc approved, with the tester gate (Jason, 2026-10-20):**
  - Every test and every installed website-testing skill must pass (taste `inspect.mjs` and `lint.mjs`, Impeccable `detect`, Playwright checks, Lighthouse 90+).
  - To pass them: no dot grid (drawn vias and copper stubs by the trace instead); the live widget gets a flat cyan title band and a breathing LED instead of a ring and shadow; the top bar is solid with no blur.
  - Course page breadcrumb reads "Home / <code>", with more space above the header.
  - The previous v6 look is kept in `docs/superpowers/mocks/styled-v6-glass/` in case he wants it later.
- **Card headlines shortened for phones (proposed 2026-10-21, pending Jason):** spec §11 requires every card headline to fit two lines at 390 px. Proposed: RAMBO "Read an offline PC's data from its RAM's radio noise"; Wi-Fi "Cut a neighbour's Wi-Fi from 87.7 to 0.02 Mbit/s"; DVD Logo "A hardware DVD logo you steer by tilting the board"; Homelab "Home servers running my services and the FPGA lab"; Threads "A thread library with its own preemptive scheduler"; Runtime "Programs move between machines while they run". GPGPU kept verbatim (wider measure on phone).
- **Personal projects order (Jason, 2026-10-21):** Homelab first (the lab is mentioned a lot), then Live FPGA Lab, then DVD Logo FPGA. Some card images to be improved later (Jason).
- **Timeline teaching wording (Jason, 2026-10-21):** each Teaching entry must say clearly it was an assistant role → entries now read "Teaching assistant" ("Teaching assistant, grading" for the current one). "Lab assistant" ❓: Jason would prefer it; waiting on whether that's the official title for all four courses.
