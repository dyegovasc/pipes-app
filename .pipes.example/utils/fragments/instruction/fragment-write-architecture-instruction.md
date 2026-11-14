---
title: Write Architecture Instruction
description: Writes an exact approved architecture instruction in installed or starter-maintenance context and refreshes configured wrappers.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Write Architecture Instruction

## Instructions

1. Verify that validation status is `valid` and the exact formatted content, execution context, targets, write order, version transition, and wrapper effects were explicitly approved.
2. In `installed_project` context, write only canonical `.pipes/ai-instructions/architecture.md`. Do not redirect the write to a sibling staging tree.
3. In `starter_maintenance` context, write the approved `.pipes-v2/` source first, validate it, then reconcile the exact `.pipes/` mirror.
4. Re-read each target and compare its current text directly with the content inspected for the approved proposal. Stop for reconciliation when it changed materially after approval.
5. In create mode, replace only a confirmed placeholder or create a missing target. In update mode, preserve approved commitments and apply one semantic minor-version increment for a substantive edit.
6. If a target already equals the approved content, report it as unchanged rather than rewriting or repeating generated effects.
7. Regenerate configured instruction wrappers from the active source context.
8. Re-read sources and wrappers; validate structure, staged/installed equality when applicable, canonical `.pipes/` references, and architecture inclusion.

## Output

- `execution_context`: `installed_project` | `starter_maintenance`
- `architecture_source_path` and optional `installed_mirror_path`
- `architecture_mode`: `create` | `update`
- `write_status`: `created` | `updated` | `unchanged` | `blocked`
- `version_transition`: previous and current semantic version
- `baseline_comparison`: current target matched or required reconciliation
- `wrappers_refreshed`: generated wrapper paths
- `validation_evidence`: commands and results
