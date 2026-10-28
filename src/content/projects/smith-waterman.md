---
title: "Smith-Waterman"
kind: "course"
course: "ece340"
main: false
order: 116
headline: "DNA alignment on FPGA"
summary: "DNA alignment on FPGA"
tools: ["Vitis HLS", "OpenCL", "ARM/Zynq", "C++", "Verilog", "Vivado/Vitis", "OpenMP", "C", "Python", "Tcl", "Bash", "Git"]
team: ["tsogkas"]
group: "DNA alignment on FPGA"
diagram: "alignment"
results:
  text: "Speed of each software version against the original C code on x86, aligning 256 letters against 300,000, averaged over 100 runs."
  bars:
    - { label: "Original", value: 1, display: "1×" }
    - { label: "Simpler loops", value: 1.43, display: "1.43×" }
    - { label: "No branches", value: 1.8, display: "1.8×" }
    - { label: "Reordered maximum", value: 2.93, display: "2.93×" }
    - { label: "Fewer memory reads", value: 3.81, display: "3.81×" }
    - { label: "Prefetch and restrict", value: 3.57, display: "3.57×" }
code: { file: "smith-waterman.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE340-Embedded-Systems/blob/6e0e9d49bb8d4807b125d16b87de9a31566d2eb1/Lab3/sw_x86/src/4-less-accesses.c#L57-L82", caption: "The fastest software version's inner loop: maximums picked without branches, and two neighbours carried over to the next cell instead of read again." }
figures:
  - { section: "one-cell-at-a-time", diagram: "alignment", alt: "The scoring matrix: each cell depends on the cells to its left, above it and above-left, so cells along each anti-diagonal can be computed together" }
---

## What it is

Smith-Waterman finds the most similar stretch between two DNA or protein sequences. We sped it up in C on x86 and Arm, then built a hardware accelerator for the FPGA of a Zynq board with Vitis HLS, where the Arm cores hand it the work.

The software got 3.81× faster. The hardware passed every simulation but, with one exception, didn't run on the board, so there is no hardware speedup to report.

## One cell at a time

The algorithm fills a table with one cell per pair of letters. Each cell takes the best of three neighbours, left, above and above-left, plus a score for a match, a mismatch or a gap. That makes rows and columns impossible to compute in parallel, but every cell on an anti-diagonal depends only on earlier ones.

## Faster software

We changed the C code one step at a time and measured each version:

- **Simpler loops:** two nested loops instead of one with a division, and a border of padding so the edges need no checks: 1.43×.
- **No branches:** written so the compiler uses conditional moves instead of jumps, with up to 95 times fewer branch mispredictions: 1.8×.
- **Reordered maximum:** the same comparisons in a different order, faster for reasons the assembly didn't explain: 2.93×.
- **Fewer memory reads:** walking along a row, a cell's value and its upper neighbour carry over to the next cell instead of being read again: 3.81×.

Prefetching and the `restrict` keyword made it slower again, and on Arm, which has no conditional move, removing branches did little.

## Hardware

The accelerator works along anti-diagonals, so every cell on one can be computed at once, and keeps only the last three of them instead of the whole table. Over seven versions we narrowed every number to the bits it needs, split arrays so they can be read in parallel, kept storage in block RAM, and streamed the second sequence through a sliding window. Most versions could start a new anti-diagonal only every two clock cycles; the last was built to start one every cycle.

## On the board

Every version passed simulation and hardware emulation but failed on the board. We ruled out the synthesis tools and rewrote the Arm program from scratch; the fault was in the accelerator's code, and we ran out of time to find it.

One variant did run, on a 32 × 65,536 input: about 8.8 ms on the board, against the 1.6 ms the tools estimated.
