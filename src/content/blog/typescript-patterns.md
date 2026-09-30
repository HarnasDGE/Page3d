---
title: TypeScript patterns I use on every project
description: Small habits that make large codebases easier to change.
pubDate: 2026-09-05
category: frontend
tags: [typescript]
---

Small habits that make large codebases easier to change.

## Derive types from data

Define a constant once and use `typeof` and `as const` to get the types for free.

## Discriminated unions

Model states like `idle | loading | error | done` explicitly instead of juggling booleans.

## Narrow at the edges

Validate API and form data with a schema at the boundary, then trust the types inside.
