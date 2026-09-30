---
title: Performance budgets for WebGL
description: Keeping 3D sites smooth on mid-range phones.
pubDate: 2026-07-11
category: creative
tags: [webgl, performance]
---

Keeping 3D sites smooth on mid-range phones.

## Count draw calls

Instancing and merged geometry keep draw calls low. Aim for a few hundred at most on mobile.

## Cap the pixel ratio

Rendering at DPR 3 on a phone triples the work for little visible gain.

## Degrade gracefully

Detect slow frames and switch off reflections, particles and post-processing.
