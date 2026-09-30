---
title: Image optimisation that actually moves the needle
description: Formats, sizes and loading strategies that cut page weight without hurting quality.
pubDate: 2026-06-12
category: performance
tags: [images, performance]
---

Formats, sizes and loading strategies that cut page weight without hurting quality.

## Pick the right format

AVIF for photos, WebP as a fallback, SVG for anything drawn. PNG only when you need lossless screenshots.

## Serve the right size

Generate a handful of widths and let `srcset` and `sizes` choose. Most hero images are shipped at twice the size they are displayed.

## Lazy load, but not the hero

Everything below the fold gets `loading="lazy"`. The LCP image gets `fetchpriority="high"` instead.
