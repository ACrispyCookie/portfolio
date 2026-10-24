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
numbers:
  - { value: "2", label: "demos on one real board: the GPGPU and the DVD logo" }
  - { value: "5 min", label: "per turn once someone is waiting, plus a minute to hand over" }
---

## What it is

A real FPGA board in my homelab that anyone can use from the browser. Pick a demo and press Start, and the board is programmed for your session. If someone else is using it, you join a queue and see your place and an estimated wait.

The board is a Smart Zynq SL. It runs two demos: the n-body simulation on our [RISC-V GPGPU](/courses/ece338/gpgpu), and the [DVD logo](/projects/dvd-logo-fpga) over HDMI.

## Why it's hard

The hardest parts were the Vivado Tcl scripts that program the board's logic and processor automatically, and making the lab recover from faults on its own, without anyone touching it.

## How it works

- A web app keeps the queue and the sessions, and talks to the browser live over a WebSocket.
- A hardware agent next to the board finds it, reads its temperature and health, programs it, resets it and catches faults.
- Turns have no time limit while nobody is waiting. Once someone queues, the current turn gets 5 minutes plus a minute to hand over, and idle sessions that disconnect are dropped after 90 seconds.
- The n-body demo shows a 3D view in the browser, with the positions computed on the GPGPU.
- The DVD logo demo streams the board's HDMI output to the browser as video.

## My part

A solo project: I designed and built all of it.
