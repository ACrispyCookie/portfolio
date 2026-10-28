---
title: "User-level threads"
kind: "course"
course: "ece321"
main: true
step: 4
order: 7
headline: "A thread library with its own preemptive scheduler"
summary: "A user-level thread runtime with round-robin scheduling, timer-based preemption, yield, sleep, join and semaphores."
tools: ["C", "pthreads", "Bash", "Git"]
team: ["tsogkas", "tvangos"]
diagram: "threads"
figures:
  - section: "choosing-the-time-slice"
    diagram: "timeslice"
    alt: "Chart: the run time rises in a straight line with the time slice, from about 0.04 s at 4 µs to 1.65 s at 1000 µs"

---

## What it is

A thread library that runs many threads inside one ordinary process, with its own scheduler instead of the operating system's. A timer interrupts the running thread, so no thread can keep the processor to itself.

## From coroutines to threads

### Coroutines first

The first layer is coroutines built on `ucontext`: each one has its own stack, and switching from one to another swaps the saved processor state. Nothing switches unless the code asks to.

### Then threads on top

The thread library adds a round-robin scheduler, a timer that preempts the running thread, and yield, sleep, join and semaphores.

A sleeping thread records when it should wake up and is skipped until then. If every thread is asleep, the scheduler puts the whole process to sleep until the next one is due.

Threads were first kept in an array. Removing one moved the last thread into its place, which quietly changed the order and so the priorities, and a program could even use that to favour its own threads. A linked list keeps the order fair.

## Preemption that can't break the library

A timer can interrupt a thread anywhere, even inside the library's own code. We switch the timer off while library code runs and turn it back on with the time the thread has left, so an interrupt never lands halfway through a scheduler update. Before a context switch the timer is off, and the thread that starts running turns it back on.

The timer also broke `scanf`, which kept returning early when interrupted. So the library has its own: when standard input changes, the scheduler wakes the threads waiting for input, and a thread takes the input only if it matches the format it asked for.

### Choosing the time slice

We timed our earlier pipe program, three runs at every time slice from 4 µs to 1 ms. The run time grows in a straight line with the slice, from about 0.04 s to 1.65 s, so a shorter slice is faster, down to a point. At 1 µs it took about 70 seconds, the same as a 40 ms slice, because even the quickest system calls can't finish inside one slice.

## Tested on our earlier work

We ported our earlier course work onto it: a pipe that transfers a file, a pool of prime-checking workers, the narrow-bridge and train-ride problems, and readers and writers.
