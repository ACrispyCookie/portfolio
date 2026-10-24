---
title: "RISC-V GPGPU"
kind: "course"
course: "ece338"
main: true
order: 1
headline: "Our 32-core RISC-V GPGPU, running on a real FPGA"
summary: "Runs an n-body step 2.38× faster than the ARM core on the same chip. My colleagues now use it on the Smart Zynq SL, and it runs live in the FPGA lab."
tools: ["Verilog", "RISC-V", "Vivado/Vitis", "ARM/Zynq", "C", "Python", "Tcl", "JavaScript", "HTML/CSS", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
links:
  repo: "https://github.com/ACrispyCookie/GPGPU"
  demo: "https://fpga.njason.dev"
media:
  src: "../../assets/projects/gpgpu.jpg"
  alt: "The GPGPU on a ZedBoard, wired to a laptop that shows its n-body simulation"
  video: "/media/gpgpu.mp4"
  overlay: "fpga"
numbers:
  - { value: "2.38×", label: "faster than the ARM core on the same chip, for one n-body step" }
  - { value: "32", label: "RISC-V cores running in lockstep" }
  - { value: "1/17", label: "of the ARM core's clock speed" }
  - { value: "88%", label: "of the FPGA's logic (LUTs) in use" }
figures:
  - section: "inside-the-gpgpu"
    src: "../../assets/projects/gpgpu-device.jpg"
    alt: "The GPGPU placed on the ZedBoard's FPGA in Vivado: its logic, in cyan, fills most of the chip"
  - section: "inside-the-gpgpu"
    src: "../../assets/projects/gpgpu-block.jpg"
    alt: "The GPGPU wired to the Zynq's ARM core, in Vivado's block design"
  - section: "from-c-code-to-the-board"
    diagram: "flow"
    alt: "How a program reaches the GPGPU: C code, compiled by the RISC-V gcc into assembly, sent over UART to the Zynq's ARM core, which writes it over AXI into the GPGPU's instruction memory"
results:
  text: "One step of a 32-body n-body simulation, GPGPU at about 38.5 MHz against the ZedBoard's ARM Cortex-A9 at about 667 MHz."
  bars:
    - { label: "GPGPU, 38.5 MHz", value: 129, display: "129 µs" }
    - { label: "Cortex-A9, 667 MHz", value: 308, display: "308 µs" }

---

## What it is

A small processor for parallel work, built from 32 RISC-V cores that all run the same instruction at the same time. The Zynq chip's ARM core sends it a program and data, and it runs the work on all 32 cores at once.

We first ran it on a ZedBoard. It now also runs on the Smart Zynq SL, where my colleagues use it, and it is one of the two demos in my live FPGA lab.

## Inside the GPGPU

- One shared fetch and decode stage feeds 32 lanes running in lockstep.
- Each lane has a 5-stage pipeline with hazard detection and forwarding, plus a pipelined multiplier.
- A crossbar connects the lanes to dual-port block RAM.
- It uses 88% of the FPGA's logic.

## From C code to the board

The ARM core sends programs and data to the GPGPU over AXI GPIO, after a UART inside the FPGA logic proved unreliable.

## Results

That is 2.38× faster at about a seventeenth of the clock. Peak throughput is about 1.23 billion integer operations per second, and data memory moves 307 MB/s. The slowest part is the UART link to the host, at about 11.5 KB/s.

## How we tested it

- A Python golden model that every result is checked against.
- Constrained-random tests and an instruction fuzzer.
- End-to-end tests running real programs on the board.

## What's next

[Version 2](/projects/gpgpu-v2) adds graphics, DDR memory, branch divergence and warp scheduling.
