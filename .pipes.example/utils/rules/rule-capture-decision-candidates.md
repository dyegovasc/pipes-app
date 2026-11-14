---
title: Capture Decision Candidates
description: Detects durable choices and routes them to decision capture instead of leaving them only in conversation or implementation notes.
version: 1.4
rule_type: record
applies_to:
  - records
  - missions
  - pipelines
enforcement: advisory
enforced_by: [model]
gate_relevance:
  evaluates_gates: false
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Capture Decision Candidates

## Requirement

When a mission, pipeline, plan, outcome, or direct user exchange produces a durable decision candidate, capture it explicitly instead of burying it in conversation or implementation notes.

## Enforcement

`advisory`

## Checks

- A candidate exists when the team chooses a lasting approach, rejects a viable alternative, changes a persistent contract, or accepts a known trade-off.
- Record the decision only when it affects future work beyond the current response or tool action.
- Use `pipeline-record-decision` when the decision needs the full capture, durability, approval, and write workflow.
- Link the decision to related intents, specs, missions, plans, outcomes, or artifacts when those records exist.
- Do not create low-value decision records for temporary execution tactics, obvious implementation details, or choices already captured in an approved record.
