---
title: "CLAHE"
kind: "course"
course: "ece415"
main: false
order: 103
step: 4
headline: "Contrast enhancement on GPU"
summary: "Contrast enhancement on GPU"
tools: ["CUDA", "C++", "Python", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
group: "Contrast enhancement on GPU"
results:
  text: "Throughput on a Tesla K80 in MPixel/s, after each change, on the same test image. Each version ran 25 times, leaving out the two extremes."
  bars:
    - { label: "CPU", value: 55.8, display: "55.8" }
    - { label: "First GPU version, 3 kernels", value: 703.5, display: "703.5" }
    - { label: "2 kernels", value: 470.1, display: "470.1" }
    - { label: "256 threads per tile", value: 722.9, display: "722.9" }
    - { label: "Private histograms", value: 854.9, display: "854.9" }
    - { label: "Parallel scan", value: 897.6, display: "897.6" }
    - { label: "Streams", value: 1234.4, display: "1,234.4" }
    - { label: "Streams and events", value: 1333.8, display: "1,333.8" }
code: { file: "clahe.cu", lang: "cpp", url: "https://github.com/ACrispyCookie/ECE415-High-Performance-Computing/blob/50c8f6c75a6140f34fd8d9d1eef9700d61565a0b/Lab4/src/09_clahe_256-per-tile-priv-scan-stream-both-events.cu#L67-L90", caption: "Counting a tile's grey levels into private histograms, then adding them up." }
figures:
  - { section: "the-two-steps", src: "../../assets/projects/clahe-steps.png", alt: "CLAHE in steps: the image split into tiles, a histogram of grey levels for each tile, the counts above the limit spread across the other levels, and one lookup table per tile" }
---

## What it is

CLAHE (contrast-limited adaptive histogram equalisation) brings out detail in an image by evening out its contrast tile by tile, with a limit on how far it stretches any one tile. We moved it to an NVIDIA Tesla K80 GPU and made it faster one change at a time, measuring throughput in megapixels per second.

The final version runs at 1,333.8 MPixel/s, about 24× the CPU version's 55.8.

## The two steps

First, every tile counts how many of its pixels have each of the 256 grey levels, cuts every count above a limit, spreads the excess evenly over all the levels, and turns the counts into a lookup table of running totals. Then every pixel's new value is a blend of the lookup tables of its four nearest tiles.

## Fewer kernels isn't always faster

The first GPU version used three kernels: histograms, lookup tables, then the final pixels. Merging the first two, so the histograms never leave the GPU's fast memory, made it slower: 470.1 against 703.5 MPixel/s. Each block had 1024 threads, one per pixel, but only 256 of them had work in the lookup-table half, and the rest sat idle while still holding their place on the multiprocessor.

Blocks of 256 threads, each counting four pixels, fixed that: 722.9.

## Private histograms and a parallel scan

Threads adding to the same count with `atomicAdd` have to wait their turn. Each block now keeps 8 private copies of its histogram in shared memory, each used by a different group of threads, and adds them up at the end: 854.9.

The running totals for the lookup table became a parallel scan in shared memory, where the distance between the values each thread adds doubles at every step: 897.6.

## Overlapping copies with work

The profiler showed most of the time going on copying the image to and from the GPU, not on the kernels. CUDA streams split the image into parts, so one part is copied while another is processed; about 8 streams worked best: 1,234.4.

Events then replaced the wait for the whole GPU between the two steps: each part starts as soon as the parts it needs are done, reaching 1,333.8.
