---
title: "Total-order multicast"
kind: "course"
course: "ece348"
main: false
step: 2
order: 105
headline: "Group chat, same order"
summary: "Group chat, same order"
tools: ["Java", "Gradle", "Python", "Bash", "Git"]
team: []
group: "Group chat, same order"
results:
  text: "Messages delivered per second with one member sending, by group size. Every message reaches every member, in the same order everywhere."
  bars:
    - { label: "1 member", value: 27802, display: "27,802" }
    - { label: "2 members", value: 3294, display: "3,294" }
    - { label: "3 members", value: 1935, display: "1,935" }
    - { label: "4 members", value: 1592, display: "1,592" }
    - { label: "5 members", value: 428, display: "428" }
    - { label: "7 members", value: 264, display: "264" }
code: { file: "multicast.java", lang: "java", url: "https://github.com/ACrispyCookie/ECE348-Distributed-Systems/blob/6caf1bf215a16ac048d3be27da8fc54b07b373c5/project2/simple-chat-app/src/main/java/dev/ioannikas/group/library/catoc/CatocManager.java#L434-L447", caption: "Delivery: a message waits until every message numbered before it has been delivered." }
figures:
  - { section: "one-order-for-everyone", src: "../../assets/projects/multicast-total-order.png", alt: "Timeline of three members: member B sends a message to everyone, coordinator A gives it delivery number 1 and sends that number to the group, and each member then delivers the message to the application" }
---

## What it is

A group chat where every member sees every message in exactly the same order, even when messages are sent at once from different machines. It is written in Java: a membership service over TCP keeps track of who is in each group, and messages travel over UDP.

## Three layers

Each message passes down through three layers, and each one adds a guarantee:

- **Reliable:** every member gets the message and acknowledges it.
- **Uniform:** a member delivers it only once everyone has it, and drops duplicates.
- **Total order:** every member delivers it in the same position.

## One order for everyone

One member acts as coordinator. When a message arrives, the coordinator gives it the next delivery number and sends that number to the whole group. Every member holds messages until the one numbered just before has been delivered, so all of them deliver in the same order. If the coordinator leaves or fails, another member takes over the numbering.

## The cost in packets

The guarantees aren't free. Reliable delivery to N members costs 2N packets; the uniform layer has every member pass the message on, 2N²; and total order sends two messages through it, one with the message and one with its number. That predicts 4N² packets per message: 64 in a group of four.

We measured it: four members sending 10,000 messages each sent 2,570,374 packets, 64.2 per message.
