---
title: Route Supporting Artifacts
description: Decides where generated outputs should live so outcomes remain records and artifacts remain supporting attachments.
version: 1.2
fragment_type: instruction
domain: project
---
# Fragment: Route Supporting Artifacts

Routes generated outputs to their proper home before execution begins.

## Instructions

1. Review the expected outputs from the plan.
2. For each output, decide the canonical destination using this order:
   - the output's own record folder in `.pipes/project/`
   - the relevant canonical workspace or repository location
   - `.pipes/project/07-artifacts/` only when the output is a supporting file with no better canonical home
3. Do not route every generated output to `.pipes/project/07-artifacts/` by default.
4. If an output belongs in `.pipes/project/07-artifacts/`, group it under a source-plan-oriented folder when practical.
5. Record the rationale for any output that falls back to `07-artifacts`.
6. Carry explicit source-record paths and any invoking mission into creation. Apply `rule-artifact-record-contract` for names, complete metadata, no-overwrite checks, and verified reciprocal writes with the app open or closed.
7. On interrupted creation, inspect prior effects and reuse the original artifact path and number. For regeneration, capture and preserve managed metadata outside approved effects.

## Output

- `output_routing`
- `artifact_fallbacks`
- `canonical_destinations`
