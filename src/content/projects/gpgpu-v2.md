---
title: "GPGPU v2"
kind: "personal"
main: true
order: 7.5
headline: "Our GPGPU's next step: graphics and DDR memory"
summary: "We're extending our RISC-V GPGPU with graphics support, DDR memory, branch divergence and warp scheduling. A new host controller, with memory-mapped control registers over AXI, already works, and a command-line tool automates testing and synthesis. The memory controller is next."
tools: ["SystemVerilog", "RISC-V", "Vivado/Vitis", "ARM/Zynq", "C", "Python", "Tcl", "JavaScript", "HTML/CSS", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
fromCourse: "ece338"
status: "in-progress"
nowLine: "Graphics, DDR, warp scheduling"
diagram: "roadmap"
milestones:
  - { name: "Host controller over AXI", state: "done" }
  - { name: "CLI for tests and synthesis", state: "done" }
  - { name: "Memory controller", state: "now" }
  - { name: "DDR memory and graphics", state: "next" }
  - { name: "Branch divergence, warp scheduling", state: "next" }
links:
  repo: "https://github.com/ACrispyCookie/GPGPU"
  teamRepo: "https://github.com/PANAGIVTHS/ECE338-Parallel-Computer-Architecture"

---

## What it is

The next version of our [RISC-V GPGPU](/courses/ece338/gpgpu), with the same team and the same repository. We're adding graphics, DDR memory, branch divergence and warp scheduling.

## Why it's hard

The first version has no hardware support for branch divergence: all its lanes run in lockstep. Version 2 adds it, along with warp scheduling, on top of a new memory system.

## How it works

So far:

- A new host controller, with memory-mapped control and status registers over AXI. It works.
- A command-line tool in Python that automates testing and synthesis.
