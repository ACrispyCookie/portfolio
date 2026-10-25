---
title: "N-body on GPUs"
kind: "course"
course: "ece415"
main: true
order: 2
headline: "2,910× faster than the single-core version"
summary: "A galaxy simulation tuned step by step, from a single-core C program to four NVIDIA Tesla K80 GPUs at once."
tools: ["CUDA", "OpenMP", "C", "Python", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
media:
  src: "../../assets/projects/nbody.jpg"
  alt: "Galaxy simulation"
  video: "/media/nbody.mp4"
numbers:
  - { value: "2,910×", label: "faster than the single-core C version" }
  - { value: "431", label: "billion body-to-body interactions per second, up from 0.148" }
  - { value: "40×", label: "faster than our OpenMP version on the CPU" }
  - { value: "4", label: "NVIDIA Tesla K80 GPUs working at once" }
figures:
  - section: "keeping-the-gpu-busy"
    src: "../../assets/projects/nbody-kernels.png"
    alt: "Two kernel designs: with one record per body, the kernels are called many times each iteration; with a structure of arrays, each kernel is called once per iteration"
  - section: "keeping-the-gpu-busy"
    src: "../../assets/projects/nbody-streams.png"
    alt: "The Nsight Systems timeline: kernels from dozens of CUDA streams overlapping on the GPU"
  - section: "sharing-data-inside-a-block"
    src: "../../assets/projects/nbody-tiling.png"
    alt: "Memory flow inside the force kernel: each tile of positions is read into shared memory, the forces build up in registers, and only the finished velocities go to global memory"
  - section: "four-gpus-no-divergence"
    src: "../../assets/projects/nbody-gpus.png"
    alt: "How the work splits: rows of galaxies shared out across four GPUs, each galaxy its own CUDA stream, its bodies processed tile by tile"
results:
  text: "Billions of interactions per second after each step, on the same simulation."
  bars:
    - { label: "Single-core C", value: 0.148, display: "0.148" }
    - { label: "OpenMP", value: 10.65, display: "10.65" }
    - { label: "First GPU version", value: 29.24, display: "29.24" }
    - { label: "Streams, structure of arrays", value: 40.90, display: "40.90" }
    - { label: "Shared-memory tiling", value: 54.68, display: "54.68" }
    - { label: "Read-only cache, FMA", value: 84.68, display: "84.68" }
    - { label: "Four GPUs", value: 322.27, display: "322.27" }
    - { label: "No divergence", value: 431.27, display: "431.27" }
---

## What it is

A galaxy simulation: every body pulls on every other body, every step. We started from a plain single-core C program and made it faster one change at a time, ending on four NVIDIA Tesla K80 GPUs working together.

It was the last of five projects in the course, after a Sobel filter, K-means with OpenMP, and image convolution and contrast enhancement (CLAHE) in CUDA.

## One change at a time

The simulation runs many independent galaxies. Each time step has two phases: work out the force on every body and its new velocity, then move every body. Every change below was measured against the one before it, so each had to earn its place.

### On the CPU first

OpenMP gives each CPU thread its own galaxies, so the threads never have to wait for each other. The data also changed shape: instead of one record per body, all the x positions sit together, then all the y positions, and so on (a structure of arrays). Reading one coordinate for many bodies then reads memory in order.

### A first GPU version

One GPU thread per body. Each thread reads the position of every other body and adds up the forces, so a galaxy of N bodies means N² reads from the GPU's slow global memory. The forces and the positions are two separate kernels, so every velocity is ready before any body moves. The inverse square root runs on the GPU's special function units (`rsqrtf`).

### Keeping the GPU busy

Galaxies don't depend on each other, so CUDA streams run their kernels at the same time. With the structure of arrays, the 32 threads of a warp read neighbouring addresses, which the GPU serves in one memory transaction.

### Sharing data inside a block

Tiling: a block of threads loads a tile of bodies into fast shared memory once, and every thread in the block reuses it. The forces add up tile by tile and go back to global memory only at the end.

### Faster reads and faster maths

Positions are only ever read, so they go through the read-only data cache (`__ldg`). The force maths uses fused multiply-add (`fmaf`), one instruction for a multiply and an add.

### More work per thread, and its cost

Giving each thread several bodies (coarsening) first made it slower: the extra values didn't fit in the thread's registers and spilled to memory. Launch bounds that let each thread use 128 registers instead of 64 removed the spilling. The version that spilled ran at about half the speed.

### Four GPUs, no divergence

One OpenMP thread drives each of the four GPUs, each with an equal share of the galaxies. Finally, padding the number of bodies to a multiple of the block size removed the bounds checks, so the threads of a warp never take different paths.

## Results

Coarsening on its own was the one step that made it slower (487× against 571× before it), until launch bounds fixed it.

Each version ran 25 times. The average leaves out the fastest and the slowest run.
