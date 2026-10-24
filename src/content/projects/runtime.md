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

## Why it's hard

Moving a thread while it runs means packing up its state, sending it and resuming it on another machine, while the other threads keep reading and writing the shared tuple space.

## How it works

- Each machine parses, interprets and schedules its own threads.
- A distributed tuple space that every thread can read and write.
- Load balancing: when one machine runs at least two more threads than another, a thread moves over.
- Graceful shutdown: a machine that leaves hands its threads to the others first.

## My part

A solo project, like the course's three assignments before it: a request/reply library, group communication with total-order multicast, and a network file system with a cache.
