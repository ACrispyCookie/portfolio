---
title: "Semaphores"
kind: "course"
course: "ece321"
main: false
step: 2
order: 110
headline: "Bridge and roller-coaster problems"
summary: "Bridge and roller-coaster problems"
tools: ["C", "pthreads", "Bash", "Git"]
team: ["tsogkas", "tvangos"]
group: "Bridge and roller-coaster problems"
code: { file: "semaphores.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE321-Concurrent-Programming/blob/f840faa556c2f3d867830648c341e346bfedf01f/Project2/assignment1/src/mysem.c#L69-L86", caption: "Down on our semaphore: the value is changed under a lock, and the lock is let go before the thread can block." }
---

## What it is

Our own semaphores, built on the ones Linux provides, then used to solve three classic problems: a pool of workers, a narrow bridge and a roller coaster. Threads now sleep while they wait instead of looping.

## A binary semaphore

Our semaphore is binary: 0 or 1. An up when it is already 1 is lost, and reported as such. Each one keeps its value next to a Linux System V semaphore that does the blocking, with a lock around the value.

The order matters. A down that is about to block must let go of the lock before it blocks; otherwise no up could ever get in to wake it, and every thread using that semaphore would be stuck.

## A pool of workers

The same prime-checking pool, now with two semaphores: workers sleep on a queue until the main thread lets one through, and the main thread sleeps until that worker says it has taken the number.

## A narrow bridge

Cars come from both sides of a bridge that fits a few at a time and carries traffic one way at a time. The first car of a group claims the bridge for its side, the cars behind it follow while there is room, and the last one off hands the bridge back.

## A roller coaster

Passengers queue for a train that leaves only when full. The last passenger to arrive wakes the train; the train lets passengers board one by one, waits for each, rides, and leaves again once enough are waiting.
