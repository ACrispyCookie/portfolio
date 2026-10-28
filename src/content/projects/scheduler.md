---
title: "CPU scheduler"
kind: "course"
course: "ece318"
main: false
step: 1
order: 108
headline: "SJF without starvation"
summary: "SJF without starvation"
tools: ["C", "Python", "Bash", "Git"]
team: ["tsiantos", "tsogkas"]
group: "SJF without starvation"
code: { file: "scheduler.c", lang: "c", url: "https://github.com/ACrispyCookie/ECE318-Operating-Systems/blob/fc0be06d24cb4ccfb9e6a19f341ebae7d8031323/Project2/Scheduler_VM/src/schedule.c#L17-L21", caption: "The two formulas: each task's next burst predicted from its last one, and the score that adds how long it has waited." }
figures:
  - { section: "adding-the-wait", src: "../../assets/projects/scheduler-goodness.png", alt: "Tasks plotted by expected burst against wait time: the scheduler prefers those that waited long and those with short bursts" }
---

## What it is

A CPU scheduler decides which waiting task runs next. We wrote two for a scheduling simulator: Shortest Job First, and a version of it that can't starve a task, then ran both on the same mixes of interactive and number-crunching tasks and drew what each one did.

## Shortest Job First

Shortest Job First always runs the task it expects to finish its turn soonest. It can't know that ahead of time, so it predicts each task's next burst from its last one and its last prediction.

That keeps short, interactive tasks quick, but a long task can wait forever. With 25 interactive tasks and one long computation, the computation stopped getting the CPU at all: its predicted burst stayed the longest, so it was never picked. In our runs it began to starve at about 20 interactive tasks.

## Adding the wait

Our version scores every task by two things with equal weight: its predicted burst, compared with the shortest in the queue, and how long it has waited, compared with the longest wait. It runs the task with the best score, so a task that has waited long enough gets the CPU even if its burst is long.

## What we saw

On the same 25-and-1 mix the computation kept running. With five tasks of each kind, plain Shortest Job First ran the long tasks only when no interactive task needed the CPU; ours gave every task its turn. With only long tasks, both behaved like round robin, taking turns.

The fairness has a cost: more work on every scheduling decision, and sometimes a long task runs ahead of an interactive one. With few interactive tasks plain Shortest Job First is the better choice; with many, ours keeps the long tasks moving.
