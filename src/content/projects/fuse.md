---
title: "Deduplicating filesystem"
kind: "course"
course: "ece318"
main: false
step: 2
order: 107
headline: "Stores each block once"
summary: "Stores each block once"
tools: ["FUSE", "C", "Python", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
group: "Stores each block once"
diagram: "dedup"
code: { file: "fuse.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE318-Operating-Systems/blob/fc0be06d24cb4ccfb9e6a19f341ebae7d8031323/Project3/final/filesystem/fs_manager.c#L344-L359", caption: "Deleting a file's block: it is freed only when no file uses it any more." }
figures:
  - { section: "each-block-stored-once", diagram: "dedup", alt: "Two files made of 4 KB blocks; blocks with the same content are stored once and both files point to them" }
---

## What it is

A Linux filesystem that stores identical data only once. Files are cut into 4 KB blocks, and a block whose content is already on disk isn't written again: the file just points to the copy that's there. It runs in user space through FUSE, built on the Big Brother File System from a FUSE tutorial.

We tested it with a Python suite of 14 tests, and it held up well enough to run a Minecraft server on it, until the game's multithreaded world generation became the limit.

## Each block stored once

Every block is identified by its SHA-1 hash. A table maps each hash to where the block sits on disk and how many files use it. Writing a block either adds a reference to one that exists or stores it as new. A file on disk is then only a list of hashes plus the size of its last block, which is all it takes to rebuild it.

With 4-byte block numbers, it holds up to 2³² unique blocks: 16 TB of unique data.

## Deleting safely

A block can't be thrown away when one file is deleted, because another may still use it. Its reference count goes down, and the block is freed only at zero.

Freed blocks go on a sorted list, and new blocks fill those gaps first. When more than 10% of the store is gaps, blocks from the end move into them until it is under 10% again. That keeps the store compact, but it tends to hover around the limit.

## Folders

Each folder keeps its own table of the names, types and IDs inside it, linked into a tree. The tree is read into memory when the filesystem mounts and written back when it unmounts. Each entry takes 273 bytes, so the Linux kernel's source, about 89,000 files and folders, would need about 23 MB of it.
