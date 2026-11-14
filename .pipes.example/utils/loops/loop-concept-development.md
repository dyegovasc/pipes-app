---
title: Concept Development Loop
description: Turn ambiguous source material into a coherent, evidence-aware direction.
version: 2.7
domain: all
loop_type: concept
status: active
primary_role: visionaire
consulting_roles:
  - roadmapper
  - full-stack-tech-lead
fragments:
  - fragment-mission-framing
  - fragment-observation
  - fragment-understanding
  - fragment-strategy
  - fragment-action-selection
  - fragment-execution
  - fragment-validation
  - fragment-reflection
  - fragment-state-update
  - fragment-mission-journal-contract
  - fragment-gate-evaluation
  - fragment-capture-execution-outcome
  - fragment-format-outcome-record
  - fragment-create-outcome-file
pipelines:
  - pipeline-capture-intent
  - pipeline-design-spec
  - pipeline-record-decision
  - pipeline-plan-new-feature
  - pipeline-start-mission
rules:
  - rule-separation-of-duties
  - rule-pure-markdown-writing
  - rule-scope-control
  - rule-authority-precedence
  - rule-evidence-and-validation
  - rule-mission-state-integrity
---
# Concept Development Loop

## Use When

Use this loop to clarify an idea, compare directions, consolidate research, or turn exploratory notes into an intent, spec, decision, mission, or plan. Delivery work normally ends this loop with an intent accepted by the product owner and, when design is in scope, an accepted spec.

## Operating Envelope

The loop may inspect sources, test assumptions, compare alternatives, and draft proposals inside the stated concept boundary.

Ask the user before accepting a lasting product choice, materially changing scope, or creating a durable record whose content is still disputed.

## Roles

`visionaire` owns concept coherence and alternatives. Consult `roadmapper` for durable routing and `full-stack-tech-lead` when feasibility changes the choice.

## Cycle

| Phase | Work | Fragment |
| --- | --- | --- |
| Frame | Bound the question, sources, success signal, and user-owned choices | `fragment-mission-framing` |
| Observe | Read relevant sources and existing commitments | `fragment-observation` |
| Understand | Separate facts, assumptions, tensions, and unknowns | `fragment-understanding` |
| Choose | Select the most discriminating synthesis, test, or question | `fragment-strategy`, `fragment-action-selection` |
| Act | Produce one useful concept increment or invoke a suitable pipeline | `fragment-execution` |
| Validate | Check coherence, provenance, alternatives, and feasibility | `fragment-validation` |
| Reflect | Update the direction from what was learned | `fragment-reflection` |
| Update | Refresh mission state, next actions, and any real gate | `fragment-state-update`, `fragment-gate-evaluation` |

Repeat from the phase that best fits the new evidence. Do not stop merely because one synthesis or question is complete.

## Mission Integration

Use a recorded mission when this concept needs durable objective, scope, authority, evidence, or next-action state. Read its selected `loop` ID before work, refresh only its run-specific Current State and Next Actions, and keep reusable loop roles and operating rules here.

Treat the mission as the orchestration map until conclusion. Resolve pipeline and loop gates through its recorded `user_mediated`, `delegated_until_escalation`, or `mixed` profile and corresponding human-intervention level; the preference may narrow but never widen authority, and human-mandatory remains user-owned. Keep delegated authority, user authority, active workflow, pending gate, resume trigger, validation target, and next action readable. Before pausing at a gate, record its deciding authority, invalidation conditions, and exact resume action. After an immediate valid decision, append the compact gate receipt and continue the mission directly; use a new readiness boundary for a cold or stale resume.

When the mission has `## Delivery`, choose the next action from its current theme and selected approach. Declared pipelines remain capability inventory, but the selected persisted route is obligatory after mission execution approval. Under `spec-driven`, require at least one approved, validated plan whose combined coverage spans the complete confirmed mission scope before execution; `plan-required` requires coverage rather than a dedicated plan, `plan-recommended` makes a separate plan optional, and every additional plan needs an evidence-backed split rationale. Under `adaptive`, still plan each `plan-required` theme while allowing other themes to proceed incrementally unless evidence promotes them. Preserve the exact post-subworkflow resume action.

Mission phases use `framed`, `observing`, `understanding`, `choosing`, `acting`, `validating`, `reflecting`, and `updating`; status alone owns `draft`, `active`, `blocked`, and `done`. Specialized mission phases: none.

After Validate and Reflect establish a terminal `succeeded`, `partial`, `failed`, or `cancelled` result for a recorded mission, but before setting its status to `done`, use `fragment-capture-execution-outcome`, `fragment-format-outcome-record`, and `fragment-create-outcome-file` to produce exactly one approved, validated related outcome. Keep resumable `active` and `blocked` missions open.

Check the mission’s existing `related` paths for a matching outcome before proposing a new file, and reuse that outcome when it already represents this closure. Otherwise present one closure package containing the exact outcome preview, mission terminal cleanup, `done` status change, and both reciprocal `related` links.

Apply only the approved closure package. When Pipes Local automatically adds the reciprocal `related` path and refreshes `.pipes/utils/state/related-sync-state.json` after an approved source-record relationship write, treat those changes as expected app-managed effects and do not repeat the reciprocal edit directly; direct agent-authored writes to related records remain governed by their own authority.

Only after the outcome and relationships are written, re-read, and validated may the loop clear active gates and Next Actions and mark the mission `done`. A lightweight loop run without a mission does not create a mission outcome.

## Available Pipelines

- `pipeline-capture-intent` to turn the clarified problem into an intent record
- `pipeline-design-spec` when an accepted intent needs requirements and design
- `pipeline-record-decision` for an approved durable choice
- `pipeline-plan-new-feature` when the concept is ready for an executable plan
- `pipeline-start-mission` when a distinct adaptive mission is justified

## Validation

- Claims are sourced or labeled as assumptions.
- Material alternatives and trade-offs are visible.
- User-owned choices remain proposals until approved.
- The recommended next record or action follows from the evidence.

## Stop Conditions

Stop only when the concept is validated and routed, a material user choice is required, evidence needed for progress is unavailable, or the next action is protected. Otherwise continue the loop.

## Mission Prompt

```markdown
Use loop-concept-development for {concept question}.
Scope: {boundary}
Constraints: {user-owned choices and limits}
Validation: {evidence of coherence and readiness}
```
