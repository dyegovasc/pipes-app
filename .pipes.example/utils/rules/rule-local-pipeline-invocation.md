---
title: Local Pipeline Invocation
description: Makes canonical Markdown pipelines the deterministic workflow source inside and outside loops.
version: 2.3
rule_type: governance
enforcement: binding
enforced_by: [model]
---
# Rule: Local Pipeline Invocation

## Requirement

When a user or loop names `pipeline-{id}`, read and follow `.pipes/utils/pipelines/pipeline-{id}.md`.

## Checks

- Read the pipeline before acting and preserve its declared phase order and approval gates.
- Read referenced fragments only when needed for the current phase.
- Use the pipeline's `## Loop Use` section when an active loop invokes it.
- The loop decides whether to invoke; the pipeline owns its internal phases.
- When paused, record the active pipeline phase, pending gate, deciding authority, invalidation conditions, exact resume trigger, and next action in readable mission state only when needed for continuity.
- When an immediate gate decision is recorded during an active mission, return directly to the recorded mission action when the decision remains valid; do not require a separate pipeline invocation merely to continue.
- On a cold or stale resume, inspect actual outputs, current records, and approval validity before continuing from the first incomplete phase; do not replay completed effects blindly.
- When Execute Plan owns a recorded source, preserve its lifecycle and exactly-one outcome closure across direct and mission-bound invocation; inline content has no source-plan state.
- If the named pipeline is missing, report that instead of substituting another.
