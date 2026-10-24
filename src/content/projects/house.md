---
title: "Explorable 3D house"
kind: "course"
course: "ece433"
main: true
order: 5
headline: "A 3D engine we wrote from scratch in C++ and OpenGL"
summary: "A first-person house with a day and night cycle, a flashlight, OBJ model loading and NURBS terrain."
tools: ["OpenGL", "C++", "C", "Python", "Git"]
team: ["tsogkas", "kalousis"]
media:
  src: "../../assets/projects/house.jpg"
  alt: "The house in daylight"

---

## What it is

A house you can walk through in first person, with a garden, a forest and mountains around it. We wrote the engine for it ourselves in C++ and OpenGL, and it grew well beyond what the assignment asked. Instead of one long drawing routine, we built a small engine to hold it all together.

## Inside the engine

### Everything is an object

Every piece of the scene is an object with its own position, rotation, size, colour, material and texture. Objects sit in a tree: rooms hold furniture, and moving a parent moves everything in it. A new kind of object only adds how it draws itself.

Objects that never move are compiled into OpenGL display lists the first time they are drawn, so the graphics card can replay them. Glass and other see-through objects are kept apart and sorted by distance from the camera, so they blend in the right order.

### Managers instead of globals

Small manager classes each own one job: the game loop, input, the window, lighting, textures and materials. The game loop scales every movement by the time since the last frame, so walking speed is the same at any frame rate. A light can belong to an object, so a lantern's light moves and hides with the lantern.

### A first-person camera

You look around with the mouse and walk with the keyboard. Gravity pulls you down at 9.81 m/s² and keeps your eyes 1.7 units above the ground, a key switches to flying, and a flashlight follows wherever you look.

### Furniture from text files

The furniture isn't written into the code. It is read from simple text files, with nested blocks for parts of a piece, and a key reloads them while the program runs, so you can move a sofa without recompiling. The car in the garage and the TV are OBJ models.

### The house and the world around it

The house has a garage, a family room, a dining room and kitchen, two bedrooms, a bathroom, a hallway and a porch, built from reusable pieces: ridged walls, framed glass windows, lanterns with their own light, and prism roofs.

Outside, a sun and a moon move across the sky, and their height blends its colour from night to sunset to day. The ground is a 100 × 100 m lawn, a ring of mountains made from NURBS surfaces closes the horizon, and a Minecraft Nether portal glows purple in the garden.
