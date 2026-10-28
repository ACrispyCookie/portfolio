---
title: "Seven-segment display"
kind: "course"
course: "ece333"
main: false
step: 1
order: 112.5
headline: "Four-digit display driver"
summary: "Four-digit display driver"
tools: ["Verilog", "Vivado/Vitis", "Bash", "Git"]
team: []
group: "Four-digit display driver"
code: { file: "seven-seg.v", lang: "verilog", url: "https://github.com/ACrispyCookie/ECE333-Digital-Systems-Lab/blob/2cd308ca4de39300c2eb230602528e12910e5670/Lab1/part_b/AnodeDecoder.v#L1-L20", caption: "Each digit is switched on for only part of its turn, after its segments are set, so the last digit's pattern never shows on the next." }
---

## What it is

The first lab: driving the Nexys A7 board's four seven-segment digits in Verilog to show a fixed message, then a message that scrolls, first one step per button press and then on its own.

## One digit at a time

The four digits share their segment lines, so only one can show a character at any moment. A counter cycles through them faster than the eye can see, setting the segments for one digit and switching that digit on, then the next.

The decoder turns a 6-bit character into the segments to light: the whole English alphabet, the digits 0 to 9 and a space. A testbench checked every character, and printed each one as it would look on a display, which caught a few wrong bits.

## What only the board showed

The simulation looked right, but on the board the digits showed faint copies of other characters, known as ghosting: a digit was switched on while the segments were still changing. The fix switches a digit on one step after its segments are set, and off one step before they change.

## Buttons

A button bounces: one press looks like many. Every button goes through a synchroniser and a debouncer, which waits for the signal to stay steady before passing it on. On the board the first debouncer's counter was too short to work reliably; a wider counter fixed it.

The message lives in a small memory, and the button moves the four-character window along it one step per press; the last version moves it on a timer instead.
