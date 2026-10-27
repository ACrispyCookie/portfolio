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
  video: "/videos/dvd.mp4"
figures:
  - section: "drawing-the-logo"
    diagram: "dvdpipe"
    alt: "Diagram: the logo in block RAM is drawn into a 128 by 96 frame, each pixel is shown as a 5 by 5 block, and the picture leaves at 640 by 480 over HDMI"
numbers:
  - { value: "640×480", label: "HDMI output on the Smart Zynq SL" }
  - { value: "51×23", label: "pixel DVD logo, stored in block RAM" }
---

## What it is

The DVD logo bouncing around a screen, built in hardware, and the second demo in my [Live FPGA Lab](/projects/live-fpga-lab). It bounces off the edges and changes colour, or you tilt the board and it slides that way.

## Where it came from

It started in a course lab. In ECE333's VGA lab I added the bouncing logo as an optional extra. In the next lab I drove it with the board's accelerometer, which the lab never asked for. Later I ported it to HDMI on the Smart Zynq SL.

## How it works

### Drawing the logo

The 51×23 logo sits in block RAM. It is drawn into a small 128×96 frame, and every pixel of that frame is shown as a 5×5 block to fill the 640×480 screen. An encoder turns the picture into HDMI, with a 25.175 MHz pixel clock and a serial clock five times faster. The logo's position changes only at the end of a frame, so it never moves halfway down the screen.

### Three ways to move it

- **Bouncing:** the logo reflects off every edge and changes colour each time it hits one.
- **Tilting:** the board's accelerometer is read over SPI at 5 MHz, and its X and Y tilt push the logo, held inside the screen at the edges.
- **Buttons:** with the other modes off, the board's buttons move it one step at a time.

The accelerometer wins over bouncing, and bouncing over the buttons. Every button and switch is synchronised and debounced before the logic sees it.

### Sensor readings on the side

The X, Y and Z readings and the temperature are averaged and sent as text over UART at 57,600 baud, so a serial terminal can watch the sensor live. The SPI, UART and sprite logic each have their own testbench.
