---
title: Read Project Instruction
description: Loads established project, architecture, and convention instructions and identifies evidence gaps for live codebase inspection.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Read Project Instruction

## Instructions

1. Check `.pipes/ai-instructions/project.md` and classify it as `missing`, `placeholder`, or `established`.
2. Read `.pipes/ai-instructions/architecture.md` and `.pipes/utils/rules/rule-codebase-conventions.md` when present as supporting context; classify placeholders rather than treating them as established facts.
3. Extract project identity, stack, architecture boundaries, working conventions, commands, and protected surfaces that matter to the current work.
4. Record contradictions between the instruction surfaces and distinguish durable project commitments from claims that still need repository evidence.
5. Pass missing, placeholder, stale, or contradictory context to live codebase inspection. Do not stop or ask the user when the repository can answer it.

## Output

- Instruction status for project, architecture, and conventions surfaces
- Established project, stack, architecture, convention, and command baseline
- Placeholder, missing, stale, or contradictory context
- Evidence gaps for targeted repository inspection
