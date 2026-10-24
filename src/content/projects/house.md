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

A house you can walk through in first person, with a garden, a forest and mountains around it. We wrote the engine for it ourselves in C++ and OpenGL, and it grew well beyond what the assignment asked.

## Why it's hard

The assignment asked for modelling, transformations, hidden-surface removal, lighting, textures and a moving camera, all in one scene. Instead of one long drawing routine, we built a small engine to hold it all together.

## How it works

- An object tree: rooms hold furniture, and moving a parent moves everything in it.
- Managers for the window, input, lighting, materials and textures.
- A day and night cycle: the sun and moon orbit the scene as the sky and the light change colour.
- A flashlight that follows the camera, plus lanterns and other local lights.
- Glass and other see-through objects, sorted by distance before they are drawn.
- OBJ models, like the car in the garage, and NURBS surfaces for the mountains.
- Furniture described in text files, so it can be moved without recompiling.
