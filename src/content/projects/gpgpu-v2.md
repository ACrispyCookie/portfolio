---
title: "GPGPU v2"
kind: "personal"
main: true
order: 7.5
headline: "Our GPGPU's next step: graphics and DDR memory"
summary: "We're extending our RISC-V GPGPU with graphics support, DDR memory, branch divergence and warp scheduling. A new host controller, with memory-mapped control registers over AXI, already works, and a command-line tool automates testing and synthesis. The memory controller is next."
tools: ["C", "Python", "JavaScript", "HTML/CSS", "Tcl", "Bash", "SystemVerilog", "Vivado/Vitis", "ARM/Zynq", "RISC-V", "Git"]
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
