---
title: "User-level threads"
kind: "course"
course: "ece321"
main: true
order: 7
headline: "A thread library with its own preemptive scheduler"
summary: "A user-level thread runtime with round-robin scheduling, timer-based preemption, yield, sleep, join and semaphores."
tools: ["C", "pthreads", "Bash", "Git"]
team: ["tsogkas", "tvangos"]
diagram: "threads"

---

## What it is

A thread library that runs many threads inside one ordinary process, with its own scheduler instead of the operating system's. A timer interrupts the running thread, so no thread can keep the processor to itself.

## Why it's hard

Preemption can interrupt a thread anywhere, even inside the library's own code. We switch the timer off during those critical sections, so an interrupt never lands halfway through a scheduler update.

## How it works

- Coroutines first, built on ucontext, with explicit context switches.
- Then threads on top: a round-robin scheduler, timer-based preemption, yield, sleep and join.
- Semaphores built into the runtime.

## How we tested it

We ported our earlier course work onto it: a pipe that transfers a file, a pool of prime-checking workers, the narrow-bridge and train-ride problems, and readers and writers.
