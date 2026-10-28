---
title: "Busy-wait threads"
kind: "course"
course: "ece321"
main: false
step: 1
order: 109
headline: "Pipe, worker pool, merge sort"
summary: "Pipe, worker pool, merge sort"
tools: ["C", "pthreads", "Bash", "Git"]
team: ["tsogkas", "tvangos"]
group: "Pipe, worker pool, merge sort"
code: { file: "busy-wait.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE321-Concurrent-Programming/blob/f840faa556c2f3d867830648c341e346bfedf01f/Project1/assignment2/src/ask2.c#L140-L158", caption: "A worker: it spins on its command until the main thread gives it a number, then reports whether it is prime." }
---

## What it is

Three small programs with POSIX threads, coordinated only by shared variables that threads check over and over in a loop, known as busy waiting. No locks to sleep on yet: the point was to see what it takes to get the order right by hand, and what it costs.

## A pipe between threads

A pipe that one thread writes bytes into and another reads them out of, in order. It is a ring buffer with a read position and a write position. A writer facing a full buffer loops until a reader frees a place; a reader facing an empty one loops until a byte arrives, or until the writer says it is done.

## A pool of workers

The main thread reads numbers and hands each one to a free worker, which checks whether it is prime. Every worker has a state, available, working or finishing, and a command from the main thread: wait, check this number, or stop. Each side loops on the other's variable until it changes.

The order of writes matters: a worker clears its command before it says it is working, so it never checks the same number twice and never overwrites a new command.

## Sorting with threads

A merge sort over a file of integers. Each thread splits its part in two and starts a thread for each half, down to parts of 64 numbers or fewer, which are sorted in memory and written back. A parent loops until both children have finished, then merges their halves in the file.
