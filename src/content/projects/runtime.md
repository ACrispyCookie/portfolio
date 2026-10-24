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

## Built on three earlier assignments

The course built up to this runtime one layer at a time:

- A request/reply library over UDP that runs each request at most once. Going from 1 to 16 worker threads raised the server from 112 to 1413 requests per second.
- Group communication with total-order multicast, so every member sees messages in the same order. A group of 4 used 64.2 packets per message, as the 4N² estimate predicted.
- A network file system with a client cache. Once the cache held the working set, throughput went from about 10.5 to about 53 MB/s.
