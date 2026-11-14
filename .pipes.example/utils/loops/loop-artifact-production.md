---
title: Artifact Production Loop
description: Produce, inspect, revise, and deliver a bounded artifact with source fidelity.
version: 2.9
domain: all
loop_type: artifact
status: active
primary_role: roadmapper
consulting_roles:
  - visionaire
  - e2e-tester
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
  - pipeline-plan-new-feature
  - pipeline-execute-plan
  - pipeline-record-decision
rules:
  - rule-pure-markdown-writing
  - rule-scope-control
  - rule-authority-precedence
  - rule-evidence-and-validation
  - rule-durable-record-routing
  - rule-mission-state-integrity
  - rule-plan-state-integrity
---
# Artifact Production Loop

## Use When

Use this loop for a document, presentation, spreadsheet, report, image, export, or other bounded artifact that benefits from iterative production and direct inspection.

## Operating Envelope

The loop may read approved sources and templates, create revisions, render or open outputs, inspect quality, and correct defects.

Ask before changing source truth, replacing a protected artifact, publishing, sending externally, or performing destructive conversion.

## Roles

`roadmapper` owns source lineage and delivery. Consult `visionaire` when audience or message is unclear, a specialist for the artifact format, and `e2e-tester` for real-surface quality evidence.

## Cycle

| Phase | Work | Fragment |
| --- | --- | --- |
| Frame | Bind audience, sources, format, destination, and quality bar | `fragment-mission-framing` |
| Observe | Inspect sources, templates, prior output, and current render | `fragment-observation` |
| Understand | Identify hierarchy, fidelity risks, and quality gaps | `fragment-understanding` |
| Choose | Select the next production or inspection increment | `fragment-strategy`, `fragment-action-selection` |
| Act | Produce one coherent artifact revision | `fragment-execution` |
| Validate | Render, open, or inspect the actual artifact | `fragment-validation` |
| Reflect | Classify defects and choose the next revision | `fragment-reflection` |
| Update | Record useful evidence and continue or stop at a real gate | `fragment-state-update`, `fragment-gate-evaluation` |

## Mission Integration

Use a recorded mission when this artifact work needs durable objective, scope, authority, evidence, or next-action state. Read its selected `loop` ID before work, refresh only its run-specific Current State and Next Actions, and keep reusable loop roles and operating rules here.

Treat the mission as the orchestration map until conclusion. Resolve pipeline and loop gates through its recorded `user_mediated`, `delegated_until_escalation`, or `mixed` profile and corresponding human-intervention level; the preference may narrow but never widen authority, and human-mandatory remains user-owned. Keep delegated authority, user authority, active workflow, pending gate, resume trigger, validation target, and next action readable. Before pausing at a gate, record its deciding authority, invalidation conditions, and exact resume action. After an immediate valid decision, append the compact gate receipt and continue the mission directly; use a new readiness boundary for a cold or stale resume.

When the mission has `## Delivery`, choose the next action from its current theme and selected approach. Declared pipelines remain capability inventory, but the selected persisted route is obligatory after mission execution approval. Under `spec-driven`, require at least one approved, validated plan whose combined coverage spans the complete confirmed mission scope before execution; `plan-required` requires coverage rather than a dedicated plan, `plan-recommended` makes a separate plan optional, and every additional plan needs an evidence-backed split rationale. Under `adaptive`, still plan each `plan-required` theme while allowing other themes to proceed incrementally unless evidence promotes them. Preserve the exact post-subworkflow resume action.

Mission phases use `framed`, `observing`, `understanding`, `choosing`, `acting`, `validating`, `reflecting`, and `updating`; status alone owns `draft`, `active`, `blocked`, and `done`. Specialized mission phases: none.

When this loop invokes Execute Plan for a recorded source, preserve the pipeline's `draft`, `active`, `blocked`, resumed `active`, and outcome-backed `done` lifecycle boundaries. Require exactly one validated reciprocal plan outcome before terminal plan closure, keep inline plan content free of invented record state, and return to the mission's exact post-plan action without treating the plan outcome as the mission outcome.

After Validate and Reflect establish a terminal `succeeded`, `partial`, `failed`, or `cancelled` result for a recorded mission, but before setting its status to `done`, use `fragment-capture-execution-outcome`, `fragment-format-outcome-record`, and `fragment-create-outcome-file` to produce exactly one approved, validated related outcome. Keep resumable `active` and `blocked` missions open.

Check the mission’s existing `related` paths for a matching outcome before proposing a new file, and reuse that outcome when it already represents this closure. Otherwise present one closure package containing the exact outcome preview, mission terminal cleanup, `done` status change, and both reciprocal `related` links.

Apply only the approved closure package. When Pipes Local automatically adds the reciprocal `related` path and refreshes `.pipes/utils/state/related-sync-state.json` after an approved source-record relationship write, treat those changes as expected app-managed effects and do not repeat the reciprocal edit directly; direct agent-authored writes to related records remain governed by their own authority.

Only after the outcome and relationships are written, re-read, and validated may the loop clear active gates and Next Actions and mark the mission `done`. A lightweight loop run without a mission does not create a mission outcome.

## Available Pipelines

- `pipeline-plan-new-feature` for a multi-part artifact plan
- `pipeline-execute-plan` for an approved production plan
- `pipeline-record-decision` for a lasting source, format, or audience choice

## Artifact Policy

Apply `rule-artifact-record-contract` for generated names, metadata, source relationships, creation with the app open or closed, interrupted creation, and controlled regeneration. Carry explicit sources and any invoking mission throughout the operation. Preserve source lineage. Put the artifact in its requested destination and use `project/07-artifacts/` only when no better canonical home exists. Delivery or publication remains user-controlled.

## Validation

- The output matches approved sources and audience.
- Layout, readability, accessibility, and format-specific quality are checked.
- The actual file is rendered, opened, or inspected when appearance matters.
- Delivery limitations and residual defects are explicit.

## Stop Conditions

Stop only when the artifact meets its quality bar, a source or audience choice requires the user, required material is missing, or delivery is protected. Otherwise revise and inspect again.

## Mission Prompt

```markdown
Use loop-artifact-production for {artifact and audience}.
Scope: {sources, format, and destination}
Constraints: {fidelity, accessibility, and delivery limits}
Validation: {render and inspection evidence}
```
