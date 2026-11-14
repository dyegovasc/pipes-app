---
title: Ask Loop Intent
description: Captures the adaptive mission class, boundaries, authority, evidence, and stop behavior a new loop must govern.
version: 1.0
fragment_type: question
domain: all
---
# Fragment: Ask Loop Intent

## Question

Ask for the minimum information needed to distinguish a reusable adaptive loop from a deterministic pipeline:

1. What mission class should this loop govern, and why can its next action not be fully predetermined?
2. What outcome, in-scope work, and explicit non-goals bound the loop?
3. Which observations or state changes influence action selection?
4. Which existing pipelines may the loop invoke, one at a time?
5. Which role should own the loop and which expertise needs consultation?
6. Which actions or decisions require delegated, escalated, or human-mandatory approval?
7. What evidence proves progress or completion, and when must the loop stop?

Do not ask the user to design kernel internals. Resolve repository-owned details from the installed catalog, loop definitions, team roles, and binding rules.

## Capture

```yaml
loop_intent:
  mission_class: ""
  adaptive_reason: ""
  desired_outcome: ""
  scope_in: []
  scope_out: []
  state_signals: []
  candidate_pipelines: []
  primary_role: ""
  consultation_needs: []
  protected_decisions: []
  evidence_expectations: []
  stop_conditions: []
```

Capture unknown values explicitly. Do not infer user-owned authority or durable product choices.
