---
title: Investigation And Recovery Loop
description: Diagnose failures, test hypotheses, recover safely, and prove the result.
version: 2.9
domain: all
loop_type: recovery
status: active
primary_role: full-stack-tech-lead
consulting_roles:
  - roadmapper
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
  - pipeline-capture-intent
  - pipeline-add-eval
rules:
  - rule-separation-of-duties
  - rule-pure-markdown-writing
  - rule-scope-control
  - rule-authority-precedence
  - rule-evidence-and-validation
  - rule-recovery-and-idempotency
  - rule-mission-state-integrity
  - rule-plan-state-integrity
---
# Investigation And Recovery Loop

## Use When

Use this loop for defects, failed workflows, regressions, uncertain effects, incidents, or a monitoring finding, where evidence must drive diagnosis and recovery.

## Operating Envelope

The loop may inspect state, reproduce symptoms safely, test hypotheses, apply approved local fixes, and validate recovery. Prefer read-only diagnosis before mutation.

Ask before destructive recovery, data repair, broad rollback, external side effects, or any action whose impact cannot be reliably bounded.

## Roles

`full-stack-tech-lead` owns diagnosis and recovery strategy. Consult the relevant architect or coder for the affected surface, `e2e-tester` for reproduction and regression evidence, and `roadmapper` for durable incidents.

## Cycle

| Phase | Work | Fragment |
| --- | --- | --- |
| Frame | Bound the symptom, safety limits, and recovery criteria | `fragment-mission-framing` |
| Observe | Reproduce and gather fresh, relevant evidence | `fragment-observation` |
| Understand | Distinguish symptoms, hypotheses, causes, and unknowns | `fragment-understanding` |
| Choose | Pick the safest discriminating test or recovery step | `fragment-strategy`, `fragment-action-selection` |
| Act | Run one diagnostic, containment, repair, or pipeline increment | `fragment-execution` |
| Validate | Compare results with reproduction and regression criteria | `fragment-validation` |
| Reflect | Update hypothesis confidence and recovery direction | `fragment-reflection` |
| Update | Record useful findings and continue or stop at a real gate | `fragment-state-update`, `fragment-gate-evaluation` |

## Mission Integration

Use a recorded mission when this investigation needs durable objective, scope, authority, evidence, or next-action state. Read its selected `loop` ID before work, refresh only its run-specific Current State and Next Actions, and keep reusable loop roles and operating rules here.

Treat the mission as the orchestration map until conclusion. Resolve pipeline and loop gates through its recorded `user_mediated`, `delegated_until_escalation`, or `mixed` profile and corresponding human-intervention level; the preference may narrow but never widen authority, and human-mandatory remains user-owned. Keep delegated authority, user authority, active workflow, pending gate, resume trigger, validation target, and next action readable. Before pausing at a gate, record its deciding authority, invalidation conditions, and exact resume action. After an immediate valid decision, append the compact gate receipt and continue the mission directly; use a new readiness boundary for a cold or stale resume.

When the mission has `## Delivery`, choose the next action from its current theme and selected approach. Declared pipelines remain capability inventory, but the selected persisted route is obligatory after mission execution approval. Under `spec-driven`, require at least one approved, validated plan whose combined coverage spans the complete confirmed mission scope before execution; `plan-required` requires coverage rather than a dedicated plan, `plan-recommended` makes a separate plan optional, and every additional plan needs an evidence-backed split rationale. Under `adaptive`, still plan each `plan-required` theme while allowing other themes to proceed incrementally unless evidence promotes them. Preserve the exact post-subworkflow resume action.

Mission phases use `framed`, `observing`, `understanding`, `choosing`, `acting`, `validating`, `reflecting`, and `updating`; status alone owns `draft`, `active`, `blocked`, and `done`. Specialized mission phases: none.

When this loop invokes Execute Plan for a recorded source, preserve the pipeline's `draft`, `active`, `blocked`, resumed `active`, and outcome-backed `done` lifecycle boundaries. Require exactly one validated reciprocal plan outcome before terminal plan closure, keep inline plan content free of invented record state, and return to the mission's exact post-plan action without treating the plan outcome as the mission outcome.

After Validate and Reflect establish a terminal `succeeded`, `partial`, `failed`, or `cancelled` result for a recorded mission, but before setting its status to `done`, use `fragment-capture-execution-outcome`, `fragment-format-outcome-record`, and `fragment-create-outcome-file` to produce exactly one approved, validated related outcome. Keep resumable `active` and `blocked` missions open.

Check the mission’s existing `related` paths for a matching outcome before proposing a new file, and reuse that outcome when it already represents this closure. Otherwise present one closure package containing the exact outcome preview, mission terminal cleanup, `done` status change, and both reciprocal `related` links.

Apply only the approved closure package. When Pipes Local automatically adds the reciprocal `related` path and refreshes `.pipes/utils/state/related-sync-state.json` after an approved source-record relationship write, treat those changes as expected app-managed effects and do not repeat the reciprocal edit directly; direct agent-authored writes to related records remain governed by their own authority.

Only after the outcome and relationships are written, re-read, and validated may the loop clear active gates and Next Actions and mark the mission `done`. A lightweight loop run without a mission does not create a mission outcome.

## Available Pipelines

- `pipeline-plan-new-feature` for a bounded repair plan
- `pipeline-execute-plan` for an approved repair
- `pipeline-record-decision` for a lasting recovery or architecture choice
- `pipeline-capture-intent` to turn a confirmed cause into an intent for the fix
- `pipeline-add-eval` to turn the incident into an eval case that proves the fix holds

## Recovery Discipline

After interruption or an uncertain effect, inspect the real surface before repeating the action. Retry only when evidence shows it is safe and likely to make progress. Change strategy or stop when repeated attempts add no evidence.

## Validation

- The symptom and recovery criteria are reproducible or explicitly bounded.
- Root-cause claims match the evidence.
- The fix removes the symptom without known regression.
- Unverified impact and residual risk are stated plainly.
- Gate G7: the holder of gate G7 (core.md Gates) triages a production finding as fix now, schedule, or dismiss. When the project defines alert thresholds, the loop diagnoses and reports below the action threshold and may propose a fix or runbook action above it, never apply one past the gates.
- A confirmed cause that is not dismissed ends in an intent through `pipeline-capture-intent` and an eval case through `pipeline-add-eval`. An emergency fix made first still gets both afterwards.

## Stop Conditions

Stop only when recovery is proven, the user must choose a risky course, a blocker prevents further evidence, or the next action is protected. Otherwise continue diagnosis or validation.

## Mission Prompt

```markdown
Use loop-investigation-and-recovery for {failure or incident}.
Scope: {affected surface}
Constraints: {safety and authority limits}
Validation: {reproduction and recovery evidence}
```
