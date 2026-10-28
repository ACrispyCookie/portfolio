---
title: "Monitors"
kind: "course"
course: "ece321"
main: false
step: 3
order: 111
headline: "The same problems, with monitors"
summary: "The same problems, with monitors"
tools: ["C", "pthreads", "Java", "Bash", "Git"]
team: ["tsogkas", "tvangos"]
group: "The same problems, with monitors"
code: { file: "monitors.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE321-Concurrent-Programming/blob/f840faa556c2f3d867830648c341e346bfedf01f/Project3/assignment3/src/assignment3.c#L113-L135", caption: "A car arriving at the bridge: it claims it, waits, or goes, then wakes the next car of its colour if there is room and it is still their turn." }
---

## What it is

The same problems again, solved with monitors: one lock around shared state, and condition variables to wait on inside it. The prime-checking pool was also written in Java.

Each solution came with an argument for why it is correct, not only tests, because monitors don't all behave alike.

## Correct under any monitor

When one thread signals another, which runs first? In a signal-and-block monitor the woken thread runs at once; in signal-and-continue the signaller carries on. Some monitors also let a new thread slip in ahead of the woken one.

We wrote every solution to be right under all of them: each function signals only as its last step, and counters of waiting threads keep a newcomer from cutting in.

## A semaphore from a monitor

Our binary semaphore again, now as a monitor: down lowers the value and waits if it went below zero; up raises it and wakes one waiting thread if any are left. An up when it is already 1 is still lost.

## The worker pool

Two versions. In the first, the main thread hands each number to a sleeping worker and waits until it is taken. In the second, the main thread adds jobs to a queue and never waits: a worker takes the next job, or sleeps until there is one.

## The bridge and the roller coaster

The bridge keeps one colour on it at a time, at most a set number of cars, and a limit on how many of one colour cross while the other waits. A car leaving decides who goes next: another of its colour, the other colour once the last car is off, or nobody, freeing the bridge.

The roller coaster's train fills, rides and empties, with passengers waiting to board and waiting to get off.
