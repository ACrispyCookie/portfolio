---
title: "DVD Logo FPGA"
kind: "personal"
main: true
order: 10
headline: "A hardware DVD logo you steer by tilting the board"
summary: "Started as an optional extra in a lab, then ported to HDMI on the Smart Zynq SL. It is the second demo in the Live FPGA Lab."
tools: ["Verilog", "Vivado/Vitis", "Git"]
team: []
links:
  repo: "https://github.com/ACrispyCookie/DVD-Logo-FPGA"
  demo: "https://fpga.njason.dev/?start=dvd-logo-video" # the lab joins this demo's queue on arrival
fromCourse: "ece333"
media:
  src: "../../assets/projects/dvd.jpg"
  alt: "A hand tilting the FPGA board beside the monitor it drives, where the DVD logo moves the same way"
  video: "/media/dvd.mp4"
numbers:
  - { value: "640×480", label: "HDMI output on the Smart Zynq SL" }
  - { value: "51×23", label: "pixel DVD logo, stored in block RAM" }
---

## What it is

The DVD logo bouncing around a screen, built in hardware. It bounces off the edges and changes colour, or you tilt the board and it slides that way. It is the second demo in my [Live FPGA Lab](/projects/live-fpga-lab).

It started in a course lab. In ECE333's VGA lab I added the bouncing logo as an optional extra. In the next lab I drove it with the board's accelerometer, which the lab never asked for. Later I ported it to HDMI on the Smart Zynq SL.

## How it works

- The accelerometer is read over SPI, and its X and Y tilt move the logo.
- In automatic mode the logo bounces off every edge and changes colour on each hit.
- The logo sits in block RAM and is drawn into a 128×96 frame, and every pixel is scaled up five times to fill 640×480.
- The position updates between frames.
- The board's buttons can also place the logo directly.

## My part

A solo project: I designed and built all of it.
