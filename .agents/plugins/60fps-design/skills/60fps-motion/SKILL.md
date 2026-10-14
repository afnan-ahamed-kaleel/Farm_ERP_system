---
name: 60fps-motion
description: Guidelines and patterns for querying and applying 60fps.design real-world UI micro-interactions, motion breakdowns, spring physics, and fluid transitions.
---

# 60fps.design Motion & Interaction Guide

Use this skill when designing fluid 60fps micro-interactions, animated states, spring transitions, and interactive components.

## Capabilities
- Search real-world production animations (iOS and web apps).
- Extract timing curves, damping ratios, and spring physics.
- Replicate smooth transitions and micro-interactions in React / CSS.

## Key Rules for 60fps Performance
1. **Transform and Opacity Only**: Always animate `transform` (scale, translate) and `opacity`. Never animate `width`, `height`, `top`, or `margin` directly as they trigger browser layout recalculations.
2. **Spring Physics**: Use CSS `cubic-bezier(0.16, 1, 0.3, 1)` or standard spring parameters (stiffness ~300, damping ~25-30) for natural feel.
3. **Respect Reduced Motion**: Always provide `@media (prefers-reduced-motion: reduce)` fallbacks.
