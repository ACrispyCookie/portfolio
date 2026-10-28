---
title: "VGA controller"
kind: "course"
course: "ece333"
main: false
step: 3
order: 114
headline: "Video out from BRAM"
summary: "Video out from BRAM"
tools: ["Verilog", "Vivado/Vitis", "Python", "Bash", "Git"]
team: []
group: "Video out from BRAM"
code: { file: "vga.v", lang: "verilog", url: "https://github.com/ACrispyCookie/ECE333-Digital-Systems-Lab/blob/2cd308ca4de39300c2eb230602528e12910e5670/Lab3/src/part_a/pixel_controller.v#L38-L56", caption: "The pixel controller: it asks the memory for the next 16 pixels one cycle early, and sends black outside the visible area." }
figures:
  - { section: "on-the-board", src: "../../assets/projects/vga-monitor.jpg", alt: "A monitor showing red, green and blue stripes from the Nexys A7 board on the desk in front of it" }
---

## What it is

A VGA video output in Verilog: a picture stored in the FPGA's own memory, sent to a monitor at 640×480. As an optional part I added a DVD logo that bounces around the screen, the start of [DVD Logo FPGA](/projects/dvd-logo-fpga).

## A picture in block RAM

The board's block RAM is small, so the picture is 128×96 with one bit per colour, kept in three memories, one each for red, green and blue. A Python script turns an image into their starting contents. Every stored pixel is drawn five times across and five times down, filling 640×480.

## Timing a frame

A monitor expects each line and each frame in fixed parts: a sync pulse, a pause, the visible pixels, and another pause. Both the horizontal and the vertical timing come from one state machine, written once with the number of cycles of each part as parameters. Its clock is 25 MHz, made from the board's clock.

The memory takes one cycle to answer, and returns 16 pixels at a time, so the pixel controller asks for the next 16 one cycle before it needs them.

## On the board

The picture showed on the first try on a real monitor, without flicker or misplaced pixels.

## A bouncing logo

The logo lives in a block RAM of its own. Between two frames, while the monitor shows nothing, there is time to copy the whole picture again, so the logo is redrawn at its new place then and never shows half-moved. Another module moves it diagonally at a steady speed and turns it around at the edges, though in this version the bounce didn't always land right; DVD Logo FPGA fixes it.
