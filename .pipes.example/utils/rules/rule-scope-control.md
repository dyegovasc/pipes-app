---
title: Scope Control
description: Prevents silent scope expansion and requires out-of-scope work, deferred work, and protected changes to remain explicit.
version: 1.1
rule_type: governance
applies_to:
  - missions
  - pipelines
  - plans
  - outcomes
  - execution
enforcement: binding
enforced_by: [model]
gate_relevance:
  evaluates_gates: true
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Scope Control

## Requirement

Work must remain inside the approved mission, pipeline phase, plan, or direct request unless a gate explicitly expands the scope.

## Enforcement

`binding`

## Checks

- Identify the active scope before making edits or creating records.
- Keep unrelated cleanup, refactors, formatting churn, and metadata changes out of the work unless required for correctness.
- Surface newly discovered required work as a scope decision instead of silently including it.
- Record deferred work separately from current acceptance criteria.
- Treat protected actions, broad migrations, destructive operations, publishing, and dependency changes as explicit gate candidates.
- If the current scope is too small to complete safely, stop at the gate and ask for scope expansion or record the blocker.
