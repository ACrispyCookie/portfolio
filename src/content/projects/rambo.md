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
  section: "what-we-measured"
  text: "Bit errors in the 128-bit message at 64 bps, by distance. Up to 32 bps there were none at any distance we tested. At 128 bps it failed beyond 25 cm."
  bars:
    - { label: "25 cm", value: 9.67, display: "9.67%" }
    - { label: "50 cm", value: 16.4, display: "16.4%" }
    - { label: "100 cm", value: 29.68, display: "29.68%" }
---

## What we showed

We reproduced published research (RAMBO) showing that a computer with no network connection can still leak data, through the radio emissions of its RAM, to a radio nearby. The program that did it needed no administrator rights and no changes to the hardware.

## The setup

An unprivileged program ran on an old, offline laptop, and an ADALM-PLUTO software-defined radio with GNU Radio listened nearby, in an ordinary indoor room.

We sent the same 128-bit message at every bitrate from 2 to 128 bps, from 25, 50 and 100 cm away, and counted the bits that arrived wrong.

## What we measured

| Bitrate | Time for 128 bits | 25 cm | 50 cm | 100 cm |
|---|---|---|---|---|
| 2 bps | 64 s | 0% | 0% | 0% |
| 4 bps | 32 s | 0% | 0% | 0% |
| 8 bps | 16 s | 0% | 0% | 0% |
| 16 bps | 8 s | 0% | 0% | 0% |
| 32 bps | 4 s | 0% | 0% | 0% |
| 64 bps | 2 s | 9.67% | 16.4% | 29.68% |
| 128 bps | 1 s | 51.2% | failed | failed |

Two things limit the channel. The further the radio is, the weaker the signal against the room's own noise. And the faster the bitrate, the less time each bit has to stand out. Up to 32 bps both are small enough for a clean copy from a metre away.

## What it means for defenders

Physical isolation alone is not a security guarantee: an ordinary program on an offline machine could reach a cheap radio a metre away. Distance and noise are what limit it, so keeping receivers away from sensitive machines, and controls that account for radio emissions, matter as much as the missing network cable.
