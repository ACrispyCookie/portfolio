---
title: "Homelab"
kind: "personal"
main: true
order: 8
headline: "Home servers running my services and the FPGA lab"
summary: "Self-hosted infrastructure for services, automation and networking experiments. It hosts the Live FPGA Lab."
tools: ["Proxmox", "Docker", "Traefik", "WireGuard", "Ansible", "Nginx", "Pi-hole", "PostgreSQL", "MySQL", "SQLite", "JavaScript", "Bash", "Git"]
team: []
diagram: "homelab"
status: "in-progress"
nowLine: "Web, media, remote access, monitoring"

---

## What it is

My own servers at home. They run the services I use every day and the [Live FPGA Lab](/projects/live-fpga-lab).

## How it works

- Virtual machines and containers for every service.
- A reverse proxy in front of the web services.
- A VPN for remote access.
- DNS filtering for the whole network.
- Home automation.
- The bench where the Live FPGA Lab's board lives.

## My part

A solo project: I set up and run all of it.
