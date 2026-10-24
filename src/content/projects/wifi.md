---
title: "Wi-Fi jammer"
kind: "course"
course: "ece436"
main: true
order: 4
headline: "Cut a neighbour's Wi-Fi from 87.7 to 0.02 Mbit/s"
summary: "One station with a modified Wi-Fi driver ignored 802.11's sharing rules and starved a well-behaved neighbour on a wireless testbed."
tools: ["ath9k", "C", "Bash", "Git"]
team: ["tsiantos", "balamotis"]
media:
  src: "../../assets/projects/wifi.jpg"
  alt: "Throughput of the fair and unfair stations over time"
  paper: true
numbers:
  - { value: "0.02", label: "Mbit/s left for the well-behaved station, down from 87.7" }
  - { value: "96.0", label: "Mbit/s taken by the modified station" }
  - { value: "4.16", label: "Mbit/s for the fair link, even after it changed channel" }
results:
  text: "Average throughput on one access point."
  bars:
    - { label: "Fair station, alone", value: 87.7, display: "87.7 Mbit/s" }
    - { label: "Modified, sharing", value: 96.0, display: "96.0 Mbit/s" }
    - { label: "Fair, sharing", value: 0.02, display: "0.02 Mbit/s" }
---

## What it is

We showed that one Wi-Fi station with a modified Linux driver (ath9k) can ignore 802.11's rules for sharing the channel and starve a well-behaved neighbour.

## How it works

We ran automated, scripted experiments on NITLab, the university's wireless testbed, with a fair station and a modified one on the same network.

## Results

With both drivers unmodified, the two shared the channel roughly evenly (38.5 and 48.2 Mbit/s). On separate access points the result was the same: 92.9 against 0.12 Mbit/s.

Wi-Fi fairness depends on every device behaving. One misbehaving device on ordinary hardware can take over a network, and changing channel does not escape it.
