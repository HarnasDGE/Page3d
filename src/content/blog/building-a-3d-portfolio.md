---
title: Building a 3D portfolio with React Three Fiber
description: How this neon district was built — procedural buildings, a tiny collision system and keeping it smooth on phones.
pubDate: 2026-09-20
category: creative
tags: [threejs, react, creative-dev]
---

This portfolio is a small city you walk through instead of a page you scroll. Here are the decisions that kept it fast and maintainable.

## Everything from one layout file

Streets, buildings, doors and colliders all derive from a single data file. Moving a building moves its collider, its door and its sign.

## No 3D models, just boxes and SVG

Facades are plain boxes. A few lines of shader code turn world position into a grid of lit windows, so the whole skyline costs one draw call. Posters, graffiti, road markings and logos are small SVG files the browser rasterises once into textures.

## Collisions without a physics engine

The android walks on a union of rectangles and gets pushed out of obstacles. That is enough for streets and rooms — no need for a 1 MB physics library.

## Mobile first, even in 3D

- Tap-to-walk and a virtual joystick
- An automatic quality tier that drops reflections and particles
- A wider field of view on portrait screens

The result feels like a game, but under the hood it is still an Astro site with content collections and a server action for the contact form.
