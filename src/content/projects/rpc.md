---
title: "RPC library"
kind: "course"
course: "ece348"
main: false
step: 1
order: 104
headline: "Reliable calls over UDP"
summary: "Reliable calls over UDP"
tools: ["C", "pthreads", "Python", "Bash", "Git"]
team: []
group: "Reliable calls over UDP"
results:
  text: "Requests per second the server answered, by number of worker threads: 20 clients sending 500 requests each, every request a primality check on a large number. The fastest and slowest client times were left out."
  bars:
    - { label: "1 worker", value: 112.4, display: "112" }
    - { label: "2 workers", value: 224.4, display: "224" }
    - { label: "4 workers", value: 439.3, display: "439" }
    - { label: "8 workers", value: 852.3, display: "852" }
    - { label: "16 workers", value: 1412.8, display: "1,413" }
    - { label: "32 workers", value: 1165.1, display: "1,165" }
code: { file: "rpc.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE348-Distributed-Systems/blob/6caf1bf215a16ac048d3be27da8fc54b07b373c5/project1/server/src/internal_server.c#L144-L167", caption: "A request seen before: dropped while it is still being worked on, answered from the cache once it is done, or told it expired." }
figures:
  - { section: "when-things-fail", src: "../../assets/projects/rpc-ack-lost.png", alt: "Timeline of a client and server: a handshake gives the client its ID, a request is answered, and the client's acknowledgement is lost, so the reply stays in the server's cache until it times out" }
---

## What it is

A library for calling a service on another machine over UDP, which can lose, repeat or reorder any packet. The server side is in C, the client side in Python. A client finds a server by broadcasting a discovery message, sends its request, and gets the reply, with each request carried out at most once however many times it is sent.

## At most once

Every request carries the client's ID and a sequence number. The server remembers, for each client, the last number it saw and its reply, and keeps that memory on disk, so it survives a restart.

A repeat of a request still being worked on is dropped. A repeat of one already answered gets the stored reply again, without running it twice. Once the client acknowledges the reply, the server lets the stored copy go; if a repeat arrives after that, the server answers that the reply expired rather than running the request again.

## When things fail

We walked through each failure on its own. A lost request is simply sent again. A lost reply is resent from the server's memory. A client that crashes and restarts cancels what it had in flight. A server that crashes and restarts reloads its memory from disk, so it still recognises a repeat it had already run.

## Threads

The server runs three threads of its own: one receives and sorts packets, one sends replies, one answers discovery. The application's worker threads take requests from a queue per service.

With a single client, a request that does no work and its reply took 1.324 ms on average over 1,000 tries, all of which succeeded.
