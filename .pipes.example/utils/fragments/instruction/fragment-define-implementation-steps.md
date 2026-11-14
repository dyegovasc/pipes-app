---
title: Define Implementation Steps
description: Breaks the selected solution into a sequenced list of concrete implementation steps.
version: 1.0
fragment_type: instruction
domain: codebase
---
# Fragment: Define Implementation Steps

Breaks the selected solution into a sequenced list of concrete implementation steps.

## Instructions

1. **Decompose the solution** into atomic, orderable steps
2. **For each step, specify:**
   - Step number and title
   - What to do (clear action description)
   - Which files are involved
   - Any dependencies on prior steps
3. **Order steps** to minimise risk — foundational changes before dependent ones
4. **Flag critical path steps** — steps where a mistake would break subsequent steps
5. **Estimate relative complexity** per step: low / medium / high

## Output
- `implementation_steps`: ordered list of step objects with title, action, files, dependencies, and complexity
- `critical_path_steps`: list of step numbers on the critical path
