---
title: "RAMBO air-gap"
kind: "course"
course: "ece455"
main: true
order: 3
headline: "Read an offline PC's data from its RAM's radio noise"
summary: "We reproduced published research showing that a computer with no network connection can still leak data through the radio emissions of its RAM."
tools: ["SDR (ADALM-PLUTO)", "GNU Radio", "C", "pthreads", "Python", "Git"]
team: ["tsiantos", "tsogkas"]
media:
  src: "../../assets/projects/rambo.jpg"
  alt: "The receiver setup next to the target laptop"
numbers:
  - { value: "0%", label: "bit errors at up to 32 bps, from 1 m away" }
  - { value: "128", label: "bits in the test message" }
  - { value: "4 s", label: "to send that message at 32 bps" }
results:
  text: "Bit errors in the 128-bit message at 64 bps, by distance. Up to 32 bps there were none at any distance we tested. At 128 bps it failed beyond 25 cm."
  bars:
    - { label: "25 cm", value: 9.67, display: "9.67%" }
    - { label: "50 cm", value: 16.4, display: "16.4%" }
    - { label: "100 cm", value: 29.68, display: "29.68%" }
---

## What it is

We reproduced published research (RAMBO) showing that a computer with no network connection can still leak data, through the radio emissions of its RAM, to a radio nearby.

## Why it's hard

The signal is faint and the room is full of other noise. Distance and that noise limit how fast and how far data gets through.

## How it works

An unprivileged program ran on an offline laptop, and an ADALM-PLUTO software-defined radio with GNU Radio listened nearby.

## Results

Physical isolation alone is not a security guarantee. Keeping receivers away from sensitive machines, and controls that account for radio emissions, matter too.

## How we tested it

We sent the same 128-bit message at bitrates from 2 to 128 bps, from 25, 50 and 100 cm away, in an ordinary indoor room.
