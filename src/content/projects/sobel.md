---
title: "Sobel filter"
kind: "course"
course: "ece415"
main: false
order: 100
step: 1
headline: "Image edges, 21× faster"
summary: "Image edges, 21× faster"
tools: ["OpenMP", "C", "Python", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
group: "Image edges, 21× faster"
results:
  text: "Speed against the original C code on one core of an Intel Core i5-1235U, 4096×4096 image, Intel compiler at its fastest setting. Each version ran 12 times; the average leaves out the fastest and the slowest run."
  bars:
    - { label: "Original", value: 1, display: "1×" }
    - { label: "Loop interchange", value: 2.79, display: "2.79×" }
    - { label: "Loop unrolling", value: 4.25, display: "4.25×" }
    - { label: "Strength reduction", value: 5.02, display: "5.02×" }
    - { label: "Fast convolution", value: 17.30, display: "17.30×" }
    - { label: "Fast convolution and square root", value: 21.49, display: "21.49×" }
code: { file: "sobel.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE415-High-Performance-Computing/blob/50c8f6c75a6140f34fd8d9d1eef9700d61565a0b/Lab1/src/14_sobel_fast_conv_sqrt.c#L98-L120", caption: "The fastest version's main loop: the convolution as additions and shifts, then the square root from the float's bits." }
figures:
  - { section: "reading-memory-in-order", src: "../../assets/projects/sobel-access.png", alt: "Reading down a column: each read loads a whole cache line (0 to 63) but uses only its first value before moving to the next row" }
---

## What it is

A Sobel filter finds the edges in an image: for every pixel it weighs the eight pixels around it twice, once for change across and once for change down, and combines the two. We started from the course's plain C version and made it as fast as we could on a single core of an Intel Core i5-1235U, measuring every change on a 4096×4096 image.

No threads and no GPU in this one: only the way the code reads memory and does its maths. Every change was timed with the compiler's optimisations off (`-O0`) and at its fastest setting (`-fast`), because a change that helps one can do nothing, or harm, at the other.

## Reading memory in order

The original loops walked down each column. Every read pulls a whole cache line into the processor's cache, but a walk down a column uses one value from that line and moves on to the next row, so the rest is thrown out before it's ever used.

Swapping the two loops so they walk along rows cut cache misses from 57.7M to 2.6M (22×) with optimisations off, and on its own made the fastest build 2.79× faster.

## Less work per pixel

Then the classic changes, one at a time. Unrolling handles four pixels per pass of the inner loop, so the loop counts and checks a quarter as often. The convolution function became inline code instead of a call. Squares became multiplications instead of calls to `pow()`. Together they reached 5.02×.

Not every textbook change helped. Working out repeated expressions once, outside the loop, made the fastest build slightly slower (4.38× to 4.12×): the compiler already did it, and better. Later, once the maths got cheap, the program was limited by memory instead, so the final versions drop the unrolling and the merged error check that read a second image in the same loop.

## Simpler maths

The Sobel filter's weights are only 1 and 2, so each convolution becomes additions, subtractions and shifts, worked out one row of the filter at a time so the reads follow memory. This one change took the fastest build from 6.11× to 17.30×.

## A faster square root

Each output pixel needs a square root. Like the fast inverse square root trick, ours reads the floating-point number's bits as an integer, halves it and adds a constant: one shift and one addition. The approximation comes from treating log₂(1 + x) as x + 0.043.

Two other tricks, a branch-free `min()` and a rearranged error check, made the fastest build slower (13.18× and 11.69×), so the final version keeps only the fast convolution and the fast square root: 21.49×.
