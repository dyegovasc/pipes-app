---
title: Create Decision File
description: Writes an approved durable decision without silently changing related records.
version: 2.3
fragment_type: instruction
domain: project
---
# Fragment: Create Decision File

## Instructions

1. Confirm the decision content, status, filename, and write are approved.
2. Read `.pipes/project/05-decisions/config.md`.
3. Choose the next available `decision-{number}-{slug}.md` filename.
4. Validate context, direct decision statement, alternatives, consequences, related paths, and the invoking mission when creation occurs under active mission execution.
5. Before writing, verify `related` is a YAML list: use `[]` only when no paths apply. A mission-bound decision must name its invoking mission and include both reciprocal `related` effects in the approved package; stop when the area contract, authority, path, target, or write cannot support them.
6. Write and re-read the file. When mission-bound, re-read the invoking mission and verify both reciprocal `related` values, including any expected Pipes Local synchronization, before reporting completion. Do not supersede or edit another decision unless that change was part of the approval.

## Output

- Decision path
- Config and link validation
- Invoking mission and verified reciprocal relationship when mission-bound
- Any separately proposed supersession edit
