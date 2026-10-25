---
title: "Distributed runtime"
kind: "course"
course: "ece348"
main: true
order: 6
headline: "Programs move between machines while they run"
summary: "A distributed runtime with a shared tuple space, live thread migration between nodes, load balancing and graceful draining."
tools: ["Python", "Bash", "Git"]
team: []
diagram: "runtime"
figures:
  - section: "a-tuple-space-every-machine-shares"
    diagram: "tupletake"
    alt: "Diagram: a take across machines: the request goes to every machine, one offers its tuple and holds it aside, and the asker confirms or cancels"
  - section: "moving-a-running-thread"
    diagram: "migrate"
    alt: "Diagram: moving a thread: it leaves its queue, its waiting request is cancelled, it steps back one instruction, and it resumes on the new machine"

---

## What it is

A runtime that runs small programs across several machines. The programs share data through a distributed tuple space, and a running thread can move to another machine without stopping.

The programs are written in SimpleScript, a small scripting language, which the runtime parses and interprets itself.

## Inside the runtime

### Running a script

A parser checks the script's header, every instruction's name and arguments, and where each label points. An interpreter then steps a thread forward one instruction at a time. On each machine a scheduler, on its own thread, keeps three queues: threads ready to run, threads asleep, and threads waiting for a tuple.

### A tuple space every machine shares

Threads share data as tuples: they put one in, read one, or take one out. A read or take that can't be met yet waits. When a new tuple arrives, it first completes the waiting reads and at most one take, and is kept only if no take used it.

Across machines, every read or take is broadcast. A machine that can meet it sends the tuple back. For a take, it holds the tuple aside until the asker confirms or cancels, so two machines can never take the same tuple.

### Moving a running thread

To move a thread, the scheduler takes it out of its queue and sends its state to another machine. A thread waiting for a tuple has its request cancelled everywhere and steps back one instruction, so the new machine asks again. A sleeping thread carries its wake-up time, so it sleeps only as long as it has left.

### Load balancing

Machines regularly share how many threads they run. A machine moves a thread to the least busy one only when the gap is 2 or more, so threads don't bounce back and forth.

### Leaving gracefully

A machine that shuts down stops its scheduler and tells the others. It waits until every one of them has acknowledged, then hands all its threads and tuples to another machine, so nothing is lost.
