---
title: "K-means"
kind: "course"
course: "ece415"
main: false
order: 101
step: 2
headline: "Clustering on 56 threads"
summary: "Clustering on 56 threads"
tools: ["OpenMP", "C", "Python", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
group: "Clustering on 56 threads"
results:
  text: "Speed against the sequential version on the course server, by thread count and by how the threads add to the shared sums."
  bars:
    - { label: "Critical, 28 threads", value: 14.23, display: "14.23×" }
    - { label: "Critical, 56 threads", value: 13.24, display: "13.24×" }
    - { label: "Atomic, 28 threads", value: 14.16, display: "14.16×" }
    - { label: "Atomic, 56 threads", value: 17.31, display: "17.31×" }
code: { file: "kmeans.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE415-High-Performance-Computing/blob/50c8f6c75a6140f34fd8d9d1eef9700d61565a0b/Lab2/src/par_kmeans.c#L102-L123", caption: "One round: OpenMP shares the points across the threads, and each adds to the group sums atomically." }
---

## What it is

K-means sorts points into k groups: each point joins its nearest centre, each centre moves to the average of its points, and the two steps repeat until the groups stop changing, or for at most 500 rounds. We parallelised the course's sequential C version with OpenMP on the course server, an Intel Xeon E5-2695 v3 machine with 56 threads.

## Where the parallel work is

The rounds can't run in parallel: each one needs the centres from the round before. Inside a round, though, every point finds its nearest centre on its own, so one `#pragma omp parallel for` shares the points out across the threads. The second loop, which turns the sums into new centres, has no dependencies either and gets the same treatment.

## Adding to shared sums

Every thread adds its points to one running sum per group, so two threads can update the same sum at once. Our first version wrapped those additions in a critical section, which lets one thread in at a time. With 56 threads it ran slower than with 28 (13.24× against 14.23×): more threads meant more of them queuing for the lock.

Atomic additions use the processor's own atomic instructions instead. They were 27% faster at 56 threads, and that combination gave the best result: 17.31×.

## SIMD for the distances

Intel VTune showed most of the time going into the function that measures the distance from a point to a centre. Splitting it across threads made it slower: each call has too little work. Instead, `#pragma omp simd` turns its loop into vector instructions, and the Xeon's AVX2 does 8 float operations at once.

## What didn't work

We also tried threads inside the nearest-centre search, with a hand-written minimum, since the OpenMP version we had couldn't reduce arrays. It was slower than the sequential code. Nesting, with 14 threads over the points and 3 inside the search, did no better: starting and managing the extra threads cost more than they saved.
