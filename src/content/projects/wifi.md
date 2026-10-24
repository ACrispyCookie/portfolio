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
  section: "what-we-measured"
  text: "Average throughput on one access point."
  bars:
    - { label: "Fair station, alone", value: 87.7, display: "87.7 Mbit/s" }
    - { label: "Modified, sharing", value: 96.0, display: "96.0 Mbit/s" }
    - { label: "Fair, sharing", value: 0.02, display: "0.02 Mbit/s" }
---

## What we showed

One Wi-Fi station with a modified Linux driver (ath9k) can ignore 802.11's rules for sharing the channel and take almost all of it from a well-behaved neighbour.

## The setup

Automated, scripted experiments on NITLab, the university's wireless testbed. A fair station and a modified one each tried to send 150 Mbit/s of UDP traffic with iperf for 60 seconds, first alone, then together.

## What we measured

| Case | Fair station | Modified station |
|---|---|---|
| Each alone | 87.7 Mbit/s | 96.5 Mbit/s |
| Both unmodified, sharing | 38.5 Mbit/s | 48.2 Mbit/s |
| One modified, same access point | 0.02 Mbit/s | 96.0 Mbit/s |
| One modified, separate access points | 0.12 Mbit/s | 92.9 Mbit/s |
| The fair link changes channel | 4.16 Mbit/s | followed it |

With normal drivers the two stations split the channel roughly evenly. With one modified, the fair station was left with almost nothing, on the same access point or on separate ones, and even after it moved to another channel.

## What it means for defenders

Wi-Fi fairness depends on every device following the rules. One misbehaving device on ordinary hardware can take over a network, and changing channel does not escape it.
