---
title: "UART"
kind: "course"
course: "ece333"
main: false
step: 2
order: 113
headline: "Serial link in Verilog"
summary: "Serial link in Verilog"
tools: ["Verilog", "Vivado/Vitis", "Bash", "Git"]
team: []
group: "Serial link in Verilog"
code: { file: "uart.v", lang: "verilog", url: "https://github.com/ACrispyCookie/ECE333-Digital-Systems-Lab/blob/2cd308ca4de39300c2eb230602528e12910e5670/Lab2/part_a/baud_controller.v#L1-L13", caption: "The baud controller: for each of the eight speeds, how many 100 MHz clock cycles to count between samples." }
figures:
  - { section: "on-the-board", src: "../../assets/projects/uart-board.png", alt: "The Nexys A7 board with a finger on a button, its seven-segment display showing a received message" }
---

## What it is

A UART, the simple serial link behind most debug ports, built in Verilog: a transmitter, a receiver that catches transmission errors, and a controller that sends a set of test messages from one to the other.

## Eight speeds

Both sides must agree on a speed in advance, the baud rate: eight are built in, from 300 to 115,200 bits per second, chosen with three switches. The receiver looks at the line 16 times per bit, so a counter on the 100 MHz clock pulses 16 times per bit. Rounding the count to whole cycles puts every rate within 0.47% of its exact value.

## Sending

The transmitter is a state machine with a state per bit: a start bit, eight data bits, a parity bit that is all the data bits combined with XOR, and a stop bit. It reports when it is busy, so the controller knows when it can send the next byte.

## Receiving, and catching errors

The receiver waits for a start bit, then reads each bit in the middle of its time on the line, when it is most likely to be steady. It catches two kinds of error. A parity error: the parity bit doesn't match the data. A framing error: the line changes in the middle of a bit, which happens when the two sides run at different speeds.

Each error is a state of its own, held until the receiver is switched off and on again. A first version kept the errors in extra flip-flops; making them states was simpler and used three fewer.

Separate testbenches sent a wrong parity bit, used the wrong speed on purpose, and sent clean messages.

## On the board

The controller sends four stored bytes, one per button press, and the receiver stores them. As an optional part, the received bytes go to the seven-segment driver from the first lab, so every press shows the next message on the display. Switches choose the speed and turn each side on or off.
