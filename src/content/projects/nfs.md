---
title: "Network file system"
kind: "course"
course: "ece348"
main: false
step: 3
order: 106
headline: "With a client cache"
summary: "With a client cache"
tools: ["C", "pthreads", "Python", "Bash", "Git"]
team: []
group: "With a client cache"
results:
  text: "Read throughput by cache size, in 4 KB blocks, for a workload that uses 2,560 blocks. Below that size the cache can't hold them all and keeps throwing out blocks it will need again."
  bars:
    - { label: "1,000 blocks", value: 10.5, display: "10.5 MB/s" }
    - { label: "2,000 blocks", value: 10.5, display: "10.5 MB/s" }
    - { label: "2,500 blocks", value: 10.6, display: "10.6 MB/s" }
    - { label: "2,750 blocks", value: 53.0, display: "53.0 MB/s" }
    - { label: "3,000 blocks", value: 53.5, display: "53.5 MB/s" }
code: { file: "nfs.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE348-Distributed-Systems/blob/6caf1bf215a16ac048d3be27da8fc54b07b373c5/project3/client/src/client.c#L181-L203", caption: "A read: a fresh cached block is used as it is; otherwise the server is asked, with the cached copy's timestamp." }
figures:
  - { section: "a-server-that-forgets", src: "../../assets/projects/nfs-server-restart.png", alt: "Timeline of a client and server: a read fails because the server closed the unused file, the client opens it again and gets a new file number, and repeats the read, which now succeeds" }
---

## What it is

A network file system: programs open, read, write and truncate files that live on another machine, through a C library over UDP. The client keeps recently used blocks in a cache, so it doesn't ask the server for the same data again and again.

## A server that forgets

The server keeps no record of its clients. It holds only a map from the file numbers it hands out to the files it has open, forgets files that go unused, and saves the last number it gave out, so it never reuses one after a restart. When the server has closed or forgotten a file, the client opens it again and repeats the request.

## The cache

The cache holds blocks by file and position and throws out the least recently used one when it is full. A block counts as fresh for a set time after it was fetched. After that, the client asks the server again and sends the time the file was last changed; if it hasn't changed since, the server answers with nothing to read, and the client keeps its copy.

A write of a whole block updates the cache and goes on to the server.

## How much it helps

Reading a 10 MB file, a big enough cache cut the packets sent from about 12,800 to about 2,600. Without a cache, larger blocks were faster on their own: under 3 MB/s with 1 KB blocks, about 21 MB/s with 8 KB.

The cache pays off only once it holds the whole working set: at 2,500 blocks it was no faster than none at all, and at 2,750 it was five times faster.
