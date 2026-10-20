# Reports Index

Map of `reports/` (git-ignored, never published) → project → one-line summary → key numbers. Built 2026-10-19.
Reuse this instead of re-reading the files. "p." = PDF page; `.tex` refs are section names.

Rules that apply here (from CLAUDE.md):
- Classmates are named only to record authorship. Nothing here is cleared for the site; the brief decides that.
- Student IDs, grades and professor comments are deliberately left out. Several `.tex` title blocks contain student IDs or ORCIDs, so crop any figure before reuse.
- **Security projects (ECE455, ECE436):** outcome level only. That means what was shown, the setup in one sentence, the measured results and the defensive takeaway.

Paths below are relative to `reports/`; `OL/` = `Overleaf Projects (31 items)/`.

---

## ECE338 Parallel Computer Architecture: Simple GPGPU (Tier 1)
**Authors:** Jason, Dimitrios Tsiantos, Panagiotis Nikolaos Tsogkas (team of 3)

| File | Summary |
|---|---|
| `ECE338 - Final Presentation.pdf` (51 p.) | Final presentation: architecture, verification, SoC integration, software stack, results |
| `OL/Parallel Computer Architectures - Project/main-GR.tex` | Full report "Simple GPGPU" (written in English despite the filename) |
| `OL/Parallel Computer Architectures - Project/main-EN.tex` | ⚠ Stale copy of the ECE415 N-body report. Ignore. |
| `OL/Parallel Computer Architectures - Homework 1–3/` | Coursework (pipelines, branch predictors, caches, predication). Authors: Jason + Tsogkas. Not portfolio material. |

**Key numbers** (presentation p.46–49 = report §Results and Evaluation):
- 32 RISC-V streaming processors in lockstep (SIMD) on a **ZedBoard**, at **~38.5 MHz**
- Peak ≈ **1.23 GINTOPS** (32 lanes × 1 IPC × 38 MHz)
- N-body, **32 bodies**, one step: GPGPU **~129 µs** vs on-board ARM Cortex-A9 at ~667 MHz **~308 µs** → **~2.38× faster** (p.46)
- Data memory: dual-port BRAM through an Nx2 crossbar, **307 MB/s**, 1-cycle latency (p.47)
- Bottleneck: host link over UART at 115200 baud ≈ 11.52 KB/s (p.48)
- Utilization: LUT 88%, FF 41%, DSP 44%, BRAM 3% (p.49)

**What was built:** a 3-stage → 5-stage pipeline with hazard and forwarding units, a shared fetch/decode front-end, a pipelined multiplier, and the crossbar (p.8–15). A banked memory with atomics was written but left out of the final bitstream (p.14). Verification used a Python golden model, constrained-random tests and an instruction fuzzer (p.18–21). Host integration went through the Zynq PS and AXI GPIO, after a PL-side UART proved unreliable (p.27–31). The C toolchain flow uses a custom linker script, per-thread stacks and a thread-ID register (p.34–42).
**Future work listed** (p.50): warp scheduling, divergence, floating point, more SMs, an AXI peripheral, PCIe.
**Jason's role:** not broken down in the report. The brief's ✅ (host ↔ device communication) comes from Jason.
**Best figures:** p.5 Vivado implemented-device view ("Runs on Zedboard!"); p.6 execution-flow diagram (C → gcc → UART → Zynq → AXI → IMEM → GPGPU).

---

## ECE415 High-Performance Computing: Projects 1–5 (Tier 1)
**Authors:** Jason, Tsiantos, Tsogkas (all five). Each folder has EN and GR versions; cite `main-EN.tex`.

| File (`OL/High Performance Computing - Project N/`) | Summary | Key numbers |
|---|---|---|
| Project 1 | Sobel filter, sequential C optimization (loop interchange, unrolling, fusion, inlining, CSE, strength reduction, fast convolution/sqrt) | 4096×4096 image on an Intel Core i5-1235U, icx compiler: best **21.49×** at `-fast` (0.469 s → 0.0218 s) and **18.56×** at `-O0` (1.754 s → 0.0945 s) |
| Project 2 | K-Means with OpenMP (parallel for, SIMD, critical vs atomic) | On the course server ("CSL Venus"): **17.31×** with 56 threads + atomic (0.206 s); 14.23× with 28 threads + critical |
| Project 3 | CUDA 2D convolution: limits, float vs double accuracy, divergence | 4× **Tesla K80** server: GPU vs CPU up to **16.97×** (float, 8192²) and 16.34× at 16384² |
| Project 4 | CUDA CLAHE (histograms, privatization, parallel scan, streams, events) | Tesla K80: **1333.8 MPixel/s**, 1.90× over the first 3-kernel GPU version and ~23.9× over CPU (55.8 MPixel/s) on `senator.pgm`. Profiling also on a GTX 1070. |
| Project 5 | **Galaxy N-body simulator**, CPU → OpenMP → CUDA optimization ladder | See below |

**Project 5 ladder** (Results table, average of 25 runs with min/max removed; "Improvement" is vs sequential CPU):

| Version | Billion interactions/s | Time (s) | vs sequential |
|---|---|---|---|
| Sequential CPU | 0.148 | 293.3 | 1× |
| OpenMP CPU | 10.65 | 4.04 | 71.8× |
| Naive GPU | 29.24 | 1.47 | 197× |
| + Streams → SoA → shared-memory tiling | 54.68 | 0.786 | 369× |
| + Read-only cache / FMA ("special functions") | 84.68 | 0.507 | 571× |
| + Coarsening (slower than the previous step) | 72.13 | 0.596 | 487× |
| + Multiple GPUs (OpenMP, one thread per GPU) | 322.27 | 0.134 | 2175× |
| + **Divergence removal** (padding), final | **431.27** | **0.0997** | **2910×** |

- Hardware for Project 5: **4× Tesla K80** (confirmed by Jason, 2026-10-19; not stated in the report).
- **Best figures:** `Project 5/plot_galaxy_data.png` (throughput per version) and `streams-gantt.png`.

---

## ECE494 Microprocessor Design: CV32E40P timing optimization (Tier 2)
**Authors:** Jason, Tsiantos, Tsogkas

| File | Summary |
|---|---|
| `ECE494 - Final.pdf` (19 p.) | Presentation: critical path, proposed change, results, use cases |
| `OL/Microprocessor Design/main.tex` | IEEE-style paper "Microarchitectural Timing Optimization of the CV32E40P RISC-V Core on FPGA" |

**What was built:** four CV32E40P variants (baseline, no MUL forwarding, no ALU forwarding, neither) on a ZedBoard (xc7z020) in Vivado. They share one minimal SoC wrapper, a Python golden-model RTL regression, and bare-metal RV32IM benchmarks.

**Key numbers** (no-MUL-forwarding vs baseline):
- Constraint 15 ns → 14 ns (66.667 → 71.429 MHz, **+7.1%**). Estimated **Fmax 66.8 → 73.2 MHz (+9.6%)**. Critical-path delay 14.871 → 13.44 ns (p.14).
- Area: LUTs 4171 → 4314 (**+3.4%**), registers 2057 → 2100 (report §Utilization). ⚠ The slide's "+0.27% LUTs" is percentage points of the whole device (7.84% → 8.11%), not a relative change.
- Power: total on-chip 120 → 121 mW (p.13)
- Break-even: the change is faster overall while multiplier-dependency stalls stay below **9.6%** of executed instructions (p.16–17)
- Measured benchmarks (report §Theoretical Performance + domain table):
  - **8.7% shorter execution time** on control_fsm (65.81 → 60.05 µs), sha256_small (308.62 → 281.64 µs) and ipv4_packet (194.86 → 177.83 µs). The same zero-penalty applies to vvadd, median, sort, rsort and dhrystone.
  - `multiply` (7.7% dependency rate): **2.0% faster**. `mm` (10.4%): **0.4% slower**.
- Root cause: routing congestion around the forwarding muxes. The delay histogram (p.11) shows the long tail disappearing.

**Best figures:** p.16 execution-time-change vs dependency-rate chart; p.11 datapath delay histogram.

---

## ECE455 Hardware Security: air-gap side-channel reproduction (Tier 2) *(outcome level only)*
**Authors:** Jason, Tsiantos, Tsogkas

| File | Summary |
|---|---|
| `Hardware Security Presentation.pdf` (13 p.) | Presentation: concept, setup, results, conclusion |
| `OL/Hardware Security - Project/conference_101719.tex` | IEEE-style report "SDR-Based DDR Air-Gap Data Exfiltration" |

**What was demonstrated:** they reproduced published research (RAMBO-style) showing that a network-isolated computer can still leak data through electromagnetic emissions from its RAM. The emissions were picked up by a nearby software-defined radio.
**Setup (one sentence):** an unprivileged program ran on an old, offline laptop, and an ADALM-PLUTO SDR with GNU Radio received at 25, 50 and 100 cm in an ordinary indoor room.

**Measured results** (128-bit test message; slides p.10–11, report §Results and Analysis):
| Bitrate | 25 cm | 50 cm | 100 cm |
|---|---|---|---|
| 2–32 bps | 0% BER | 0% BER | 0% BER |
| 64 bps | 9.67% | 16.4% | 29.68% |
| 128 bps | 51.2% | failed | failed |

- Error-free range: **up to 32 bps at up to 1 m**. At 32 bps a 128-bit message takes 4 s.
- ⚠ **Contradicts the README's "up to 2 m at 128 bps".** The report tested no distance beyond 100 cm, and 128 bps failed at 50 cm and beyond.
- **Defensive takeaway** (report §Conclusion): physical isolation alone doesn't guarantee security. Distance and ambient noise sharply limit this channel, so physical separation from receivers and EM-aware controls matter.
- **Best figure:** slide p.9 setup photos (SDR + laptop). They are clean of names.

---

## ECE436 Wireless Communications: Wi-Fi fairness study (Tier 2) *(outcome level only)*
**Authors:** Jason, Dimitrios Tsiantos, Panagiotis Balamotis. ⚠ This team differs from the other courses.

| File | Summary |
|---|---|
| `ECE436 - Final.pdf` (33 p.) | Final presentation: motivation, experiments, results |
| `OL/Project - Wireless Communications/main.tex` | Full report "Wi-Fi Jammer Implementation on ath9k" |
| `OL/Wireless Communications - Assignments/assignment1–3/` | Earlier lab assignments (AP configuration, iperf measurements, MCS comparison, pcap analysis) |

**What was demonstrated:** a station running a modified Linux Wi-Fi driver can ignore 802.11's cooperative channel-sharing rules and take almost the whole channel from well-behaved neighbours.
**Setup (one sentence):** automated, scripted experiments on the university's NITLab wireless testbed, using UDP iperf at an offered 150 Mbit/s per station for 60 s.

**Measured results** (report §Results and Evaluation):
- Fair station alone: **87.7 Mbit/s** average. Modified station alone: **96.5 Mbit/s**.
- Both unmodified: roughly even split, 38.5 vs 48.2 Mbit/s
- Same AP, all modifications on: modified station **96.0 Mbit/s**, fair station **0.02 Mbit/s**
- Separate APs: **92.9 vs 0.12 Mbit/s**
- Even when the victim link switched channel, the modified side followed it and the fair flow averaged only **4.16 Mbit/s**
- **Defensive takeaway:** 802.11 fairness relies on every station behaving. A single misbehaving device on commodity hardware can starve a network, and simply changing channel doesn't protect against it.

**Best figure:** slide p.21 throughput-over-time chart (fair station collapses to ~0 when the modified station starts).

---

## ECE348 Distributed Systems: Assignments 1–4 (Tier 2)
**Authors:** solo (confirmed by Jason; the PDFs don't name authors). The course code isn't printed; ECE348 comes from the brief.

| File | Summary | Key numbers |
|---|---|---|
| `Distributed Systems - Assignment 1.pdf` (25 p.) | UDP request/reply library with at-most-once semantics, server discovery, persistent reply cache; failure cases (lost packet/ack, client/server crash) | Null request-reply latency **1.324 ms** average (single client, 1000/1000 succeeded). Server throughput **112 → 1413 req/s** going from 1 to 16 worker threads, then dropping to 1165 at 32 (p.24–25). |
| `Distributed Systems - Assignment 2.pdf` (27 p.) | Group membership service + layered reliable → uniform → **total-order multicast** chat app | Single-sender throughput 27,802 msg/s at group size 1 → 264 at 7. Measured **64.2 packets per message** for a group of 4, which matches the predicted 4N² = 64 (p.24–27). |
| `Distributed Systems - Assignment 3.pdf` (21 p.) | Stateless network file system + client-side **LRU block cache** with freshness checks | Throughput **~10.5 MB/s → ~53 MB/s (~5×)** once the cache reaches the 2560-block working set (p.21) |
| `Distributed Systems - Assignment 4.pdf` (17 p.) | **SimpleScript distributed runtime**: parser, interpreter, scheduler, distributed tuple space, **live thread migration**, load balancing (migrate when the load gap is ≥ 2), graceful shutdown that hands threads off | No benchmarks |

**Best figures:** A1 p.25 throughput vs worker threads; A3 p.21 baseline vs cache throughput.

---

## ECE321 Concurrent Programming: Projects 1–4 (Tier 2)
**Authors:** team (confirmed by Jason). Repo contributors: ACrispyCookie, PANAGIVTHS (Tsogkas), Tvangos (unidentified). Projects 1–3 are written in Greek, Project 4 mostly in English.

| File | Summary |
|---|---|
| `ECE321 - Project 1.pdf` (10 p.) | Busy-wait pthreads: a byte pipe (ring buffer), a prime-checking worker pool, recursive parallel merge-sort |
| `ECE321 - Project 2.pdf` (13 p.) | Binary semaphores built on System V semaphores; worker pool, narrow-bridge and roller-coaster ("train ride") problems |
| `ECE321 - Project 3.pdf` (42 p.) | The same problems solved with **monitors**, with correctness argued for signal-block/continue and open/eggshell monitor models |
| `ECE321 - Project 4.pdf` (46 p.) | `mycoroutine` library (`ucontext`) → **`mythreads` user-level thread runtime**: round-robin scheduler, **timer-based preemption** (alarm disabled during critical library sections), yield/sleep/join and semaphores; earlier workloads ported onto it |

**Key numbers:** none. These are design and correctness reports.
**Best figure:** none. Slides are pseudocode. A small API/state diagram redrawn for the site would work better.

---

## ECE318 Operating Systems: Projects 2–3 (Tier 2)
**Authors:** Jason, Tsiantos, Tsogkas (both projects). There's no Project 1 report, so the brief's syscall/sysfs/Kyber work rests on the README alone.

| File (`OL/`) | Summary | Key numbers |
|---|---|---|
| `Operating Systems - Project 2/main.tex` (Greek) | SJF CPU scheduler vs a modified SJF that adds a "goodness" score to prevent starvation. Four workload mixes profiled with Gantt charts. | Qualitative conclusion: the variant fixes starvation of long jobs but costs extra work per scheduler call and sometimes favours non-interactive tasks |
| `Operating Systems - Project 3/main-EN.tex` | **Deduplicating FUSE filesystem**: 4 KB blocks addressed by SHA-1 and stored once, reference counts, free-block list with defragmentation, persistent node hierarchy. The test list also covers **compression**. | Design limits: 2³² unique blocks × 4 KB = **16 TB** max unique data; 273 B of metadata per node. Python `unittest` suite with 14 functional tests. No performance numbers. |

- ⚠ "**Ran a Minecraft server on top of it**" is **not in the report**. It rests on the README alone (keep 📄).
- ❓ Compression isn't mentioned in the brief. Confirm with Jason whether the final filesystem compresses blocks.
- **Best figures:** `Project 3/file_structure_memory.png`, `free_blocks_list.png`, `fragmentation.png`; `Project 2/sjf-mod-plain.png` (Gantt chart).

---

## ECE340 Embedded Systems: Smith-Waterman on FPGA (Tier 3)
**Authors:** Panagiotis Nikolaos Tsogkas (1st author), Jason (2nd)

| File (`OL/`) | Summary |
|---|---|
| `Embedded Systems - Lab 3/conference_101719.tex` | IEEE-style report "Local Sequence Alignment Algorithm FPGA Implementation": software optimization on x86 and Arm, then a Vitis HLS accelerator through seven implementations (bit-width reduction, anti-diagonal parallelism, initiation interval 2) |

Labs 1–2 (floating-point adder, AXI IP) have no report in `reports/`.

**Key numbers:**
- x86 software: best version (Iteration IV) up to **3.81×** over the original on large inputs (256×300000); Iteration I reached 1.43×, Iteration II 1.8× (§Execution)
- Roofline analysis with Intel Advisor; Arm runs were profiled separately
- **FPGA: not benchmarked.** Every hardware version passed HLS emulation but failed on the board, except one Implementation IV variant at 32×65536. HLS estimated 1.6 ms; the board measured **~8.8 ms**. (§Hardware Execution)
- → No FPGA speedup to claim. **Stays Tier 3.**

**Best figure:** roofline chart (§Roofline Analysis). No clean speedup chart exists.

---

## ECE333 Digital Systems Lab: Labs 1–3 (Tier 2, with DVD Logo FPGA)
**Author:** Jason alone (all three labs)

| File (`OL/`) | Summary | Key numbers |
|---|---|---|
| `Digital Systems Lab - Lab 1/main.tex` (Greek) | 7-segment decoder, 4-digit LED driver, button-stepped scrolling message, debouncers | — |
| `Digital Systems Lab - Lab 2/main.tex` | UART: baud controller, transmitter and receiver FSMs, testbenches | Baud divisor error ≈ 0.0064% at 4800 baud |
| `Digital Systems Lab - Lab 3/main.tex` | VGA controller: BRAM VRAM, pixel controller, HSYNC/VSYNC FSMs, live board test, plus an **optional DVD-logo bouncing sprite** that Jason did on his own initiative | 640-pixel lines at a 25 MHz pixel clock from an MMCM |

- Lab 3's optional sprite section is the origin of the self-initiated **DVD Logo FPGA** project (Live FPGA Lab demo 2).
- No report for the SPI/ADXL362 accelerometer part or the capstone. Those rest on the README (📄).
- **Best figures:** `Lab 3/PXL_20241120_140410061.RAW-01.COVER.jpg` (photo of the monitor output, needs checking), `dataflow.drawio.png`.

---

## ECE433 Computer Graphics: Homeworks 1–3 (Tier 2)
**Authors:** Jason + Tsogkas (all three). Written in Greek, Fall 2025.

| File (`OL/`) | Summary |
|---|---|
| `Computer Graphics - Homework 1/` | Drawing lines and curves (rasterization) |
| `Computer Graphics - Homework 2/` | Polygon filling (active edge table), transformations, clipping |
| `Computer Graphics - Homework 3/ece433_template.tex` | **"Visiting a house or a 3D space"**: C++/OpenGL engine with an object tree, Game/Input/Window/Lighting/Texture/Material managers, camera with physics, OBJ asset loader, a modelled house with rooms and furniture, sky/sun, terrain and forest, and a **NURBS mountain range** |

**Key numbers:** none.
**Best figures:** `Homework 3/all_views_house.png`, `carDay.png`.

---

## Other coursework (not portfolio material)
| File (`OL/`) | Course | Authors | Summary |
|---|---|---|---|
| `Algorithms - Problem Set 1–3/` | Algorithms | Jason + Tsogkas | Problem sets (Greek) |
| `Algorithms - Project/` | Algorithms | Jason + Tsogkas | Girvan–Newman-style graph splitting via edge betweenness, with CPL/component plots and runtime |
| `Databases - Project/` | Databases I | Jason + Tsiantos | ER diagram → relational schema → normalization (Greek) |
| `Signals And Systems - Homework 1–2/` | Signals & Systems | Jason | Problem sets (Greek) |
| `Signals And Systems - Project/` | Signals & Systems | Jason + Tsogkas | Echo/reverb systems, impulse/step response, poles–zeros, audio restoration |
| `Electornics - Lab 1/` | Electronics | Jason | NMOS/PMOS characteristic curves at 0.18/0.25/0.35 µm, 27/70 °C |

---

## What the reports resolve (feeds the brief)
| Brief ❓ | Answer from reports |
|---|---|
| #1 GPGPU team | **Team of 3:** Jason, Tsiantos, Tsogkas (ECE338 p.1). Repo owner PANAGIVTHS is probably Tsogkas; confirm with Jason. |
| #2 Team projects | T3 (Jason + Tsiantos + Tsogkas): ECE338, ECE415, ECE494, ECE455, ECE318. ECE436: Jason + Tsiantos + Balamotis. ECE340, ECE433: Jason + Tsogkas. ECE333: solo. ECE348: solo, ECE321: team (Jason). |
| #5 ECE415 | Final N-body 2910× vs sequential CPU (431 B interactions/s), on 4× Tesla K80 (Jason). |
| #6 ECE455 | Error-free to 32 bps at ≤1 m. **"2 m at 128 bps" is not supported.** |
| #7 ECE494 | +9.6% Fmax, +3.4% LUTs, +1 mW; 8.7% faster on non-multiplier-dependent workloads |
| #8 ECE340 | No FPGA speedup measured → stays Tier 3 |
| #9 Key numbers | ECE348 cache ~5×, total-order multicast 64.2 packets per message (as predicted); ECE436 96.0 vs 0.02 Mbit/s; ECE318 and ECE321: no numbers |
| #10 GPGPU details | 32 SPs, lockstep, 5-stage, crossbar, 38.5 MHz, 2.38× vs Cortex-A9, 88% LUT |
| Not in any report | Grades, internship preferences, photo, Live FPGA Lab details, Minecraft |
