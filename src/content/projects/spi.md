---
title: "Accelerometer over SPI"
kind: "course"
course: "ece333"
main: false
step: 4
order: 115
headline: "Tilt-controlled sprite"
summary: "Tilt-controlled sprite"
tools: ["Verilog", "Vivado/Vitis", "Bash", "Git"]
team: []
group: "Tilt-controlled sprite"
code: { file: "spi.v", lang: "verilog", url: "https://github.com/ACrispyCookie/ECE333-Digital-Systems-Lab/blob/2cd308ca4de39300c2eb230602528e12910e5670/Lab4/part_b/src/spi_master.v#L162-L182", caption: "The SPI master's states: load a byte, then alternate reading a bit and shifting out the next, eight times." }
---

## What it is

The last lab: reading the board's ADXL362 accelerometer over SPI in Verilog, averaging its readings and sending them over the UART from the second lab as text. Then, on my own initiative, I connected it to the bouncing logo from the third lab, so tilting the board moves the logo on screen. That wasn't part of the lab, not even as an optional extra.

## Numbers as text

The readings are binary, but a terminal shows text. A converter finds the sign, then turns the number into decimal digits with the double dabble method, shifting and adding one step at a time, and adds the code of the character 0 to each digit. Its testbench found two bugs: the digits weren't cleared between conversions, and one step ran once too often, adding 3 to digits that didn't need it.

## SPI

SPI sends and receives one bit per tick of a clock the master drives. Ours runs at 5 MHz, made by the board's clock manager, and a counter on the fast clock tracks where in each slow tick it is, so the state machine knows when to read the incoming bit and when to change the outgoing one.

On top of it, one module sends the accelerometer its setup commands and another reads its X, Y and Z values.

## Tilt to move

The accelerometer's readings drive the logo's position, in place of the steady motion it had before. The same work later became [DVD Logo FPGA](/projects/dvd-logo-fpga), with HDMI output, its own board and tilt, automatic and button modes.
