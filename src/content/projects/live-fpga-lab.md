---
title: "Live FPGA Lab"
kind: "personal"
main: true
order: 9
headline: "A real FPGA board anyone can use from the browser"
summary: "A real FPGA board in my homelab. Visitors pick a demo, wait in a fair queue if someone else is using it, and run it live."
tools: ["Vivado/Vitis", "ARM/Zynq", "TypeScript", "React", "Python", "Docker", "C", "Tcl", "HTML/CSS", "Git"]
team: []
links:
  site: "https://fpga.njason.dev"
media:
  src: "../../assets/projects/lab.jpg"
  alt: "The lab's dashboard: the board's status and the demos anyone can start"
figures:
  - section: "how-a-turn-works"
    diagram: "session"
    alt: "Diagram: a session goes from queued to starting to active to ended; it ends by the visitor, time up, programming failed, a board fault, or the board going offline"
  - section: "behind-the-board"
    diagram: "labwiring"
    alt: "Diagram: the browser talks to the web app over a WebSocket; the web app talks to the hardware agent over a local connection; the agent programs and watches the board"
numbers:
  - { value: "2", label: "demos on one real board: the GPGPU and the DVD logo" }
  - { value: "5 min", label: "per turn once someone is waiting, plus a minute to hand over" }
---

## What it is

A real FPGA board in my homelab that anyone can use from the browser. Pick a demo and press Start, and the board is programmed for your session. If someone else is using it, you join a queue and see your place and an estimated wait.

The board is a Smart Zynq SL, and it runs two demos, both described below.

## How a turn works

There are no accounts: each visitor gets an anonymous cookie, and the page stays up to date live over a WebSocket. A session moves from queued, to starting while the board is programmed, to active, and then to ended. Only one session can own the board at a time.

Turns have no time limit while nobody is waiting. Once someone queues, the current turn gets 5 minutes plus a minute to hand over, and idle sessions that disconnect are dropped after 90 seconds. Every session ends with a reason you can see: ended by the visitor, time up, programming failed, a board fault, or the board going offline.

A link can also start a demo directly: the "Run the demo" buttons on this site open the lab and join that demo's queue straight away.

## Behind the board

Two programs share the work. A web app keeps the queue and the sessions, talks to every browser, and passes the running demo through to the page. A hardware agent runs next to the board: it finds it, reads its temperature and health, programs its logic and its processor, resets it and catches faults. The two talk over a local connection, never the network, so the board can only be reached through the web app's own rules.

A small public, read-only status feed is what shows "Running now" and the board's temperature on this site's home page.

## The two demos

- **N-body on our [RISC-V GPGPU](/courses/ece338/gpgpu):** a 3D view in the browser that you can orbit and zoom, with every position computed on the GPGPU on the FPGA.
- **The [DVD logo](/projects/dvd-logo-fpga):** the board's HDMI output, streamed to the browser as live video.
