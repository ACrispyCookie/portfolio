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
results:
  text: "Billions of interactions per second after each step, on the same simulation."
  bars:
    - { label: "Single-core C", value: 0.148, display: "0.148" }
    - { label: "OpenMP", value: 10.65, display: "10.65" }
    - { label: "First GPU version", value: 29.24, display: "29.24" }
    - { label: "Shared-memory tiling", value: 54.68, display: "54.68" }
    - { label: "Read-only cache, FMA", value: 84.68, display: "84.68" }
    - { label: "Four GPUs", value: 322.27, display: "322.27" }
    - { label: "No divergence", value: 431.27, display: "431.27" }
---

## What it is

A galaxy simulation: every body pulls on every other body, every step. We started from a plain single-core C program and made it faster one change at a time, ending on four NVIDIA Tesla K80 GPUs working together.

It was the last of five projects in the course, after a Sobel filter, K-means with OpenMP, and image convolution and contrast enhancement (CLAHE) in CUDA.

## Why it's hard

Every body interacts with every other one, so the work grows with the square of the number of bodies. On a GPU, speed depends on where the data sits in memory, how threads share it, and how often threads in the same group take different branches.

## How it works

- CUDA streams, and the data laid out as a structure of arrays so neighbouring threads read neighbouring memory.
- Shared-memory tiling: a block of threads loads bodies once and every thread reuses them.
- The read-only cache and fused multiply-add for the force maths.
- Four GPUs at once, with one OpenMP thread driving each.
- Padding the data so threads in a warp never take different paths.

## Results

Thread coarsening was the one step that made it slower (487× against 571× before it).

## How we tested it

Each version ran 25 times. We dropped the fastest and slowest runs and averaged the rest.
