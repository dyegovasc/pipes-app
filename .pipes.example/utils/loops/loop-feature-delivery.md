---
title: Feature Delivery Loop
description: Plan, implement, and validate a bounded feature through adaptive delivery.
version: 2.8
domain: all
loop_type: delivery
status: active
primary_role: full-stack-tech-lead
consulting_roles:
  - visionaire
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
  - pipeline-design-spec
  - pipeline-plan-new-feature
  - pipeline-execute-plan
  - pipeline-record-decision
  - pipeline-review-change
  - pipeline-release-change
rules:
  - rule-separation-of-duties
  - rule-pure-markdown-writing
  - rule-scope-control
  - rule-authority-precedence
  - rule-evidence-and-validation
  - rule-codebase-conventions
  - rule-mission-state-integrity
  - rule-plan-state-integrity
---
# Feature Delivery Loop

## Use When

Use this loop when a bounded product or engineering outcome needs planning, implementation, inspection, and iteration before it can be called done.

## Operating Envelope

The loop may inspect the repository, refine a bounded approach, implement approved local changes, run checks, and update related mission or plan records.

Ask before expanding product scope, changing a protected architecture choice, adding a material dependency, or performing version-control, publishing, or deployment actions.

## Roles

`full-stack-tech-lead` coordinates delivery. `visionaire` clarifies product intent, implementation roles own scoped changes, `e2e-tester` owns validation, and `roadmapper` maintains durable routing.

## Cycle

| Phase | Work | Fragment |
| --- | --- | --- |
| Frame | Bind the feature slice, acceptance criteria, scope, and protections | `fragment-mission-framing` |
| Observe | Inspect current code, records, tests, and relevant user-visible state | `fragment-observation` |
| Understand | Identify boundaries, risks, assumptions, and missing proof | `fragment-understanding` |
| Choose | Select direct work, a plan, or a deterministic pipeline | `fragment-strategy`, `fragment-action-selection` |
| Act | Implement the smallest coherent delivery increment | `fragment-execution` |
| Validate | Run relevant checks and inspect the real changed surface; before review or a pull request, run the `e2e-tester` verifier in isolated agent mode, or in a separate session, to prove acceptance criteria without fixing anything | `fragment-validation` |
| Reflect | Resolve defects, deviations, and remaining risk | `fragment-reflection` |
| Update | Refresh state and continue from the next useful action | `fragment-state-update`, `fragment-gate-evaluation` |

## Mission Integration

Use a recorded mission when this delivery needs durable objective, scope, authority, evidence, or next-action state. Read its selected `loop` ID before work, refresh only its run-specific Current State and Next Actions, and keep reusable loop roles and operating rules here.

Treat the mission as the orchestration map until conclusion. Resolve pipeline and loop gates through its recorded `user_mediated`, `delegated_until_escalation`, or `mixed` profile and corresponding human-intervention level; the preference may narrow but never widen authority, and human-mandatory remains user-owned. Keep delegated authority, user authority, active workflow, pending gate, resume trigger, validation target, and next action readable. Before pausing at a gate, record its deciding authority, invalidation conditions, and exact resume action. After an immediate valid decision, append the compact gate receipt and continue the mission directly; use a new readiness boundary for a cold or stale resume.

When the mission has `## Delivery`, choose the next action from its current theme and selected approach. Declared pipelines remain capability inventory, but the selected persisted route is obligatory after mission execution approval. Under `spec-driven`, require at least one approved, validated plan whose combined coverage spans the complete confirmed mission scope before execution; `plan-required` requires coverage rather than a dedicated plan, `plan-recommended` makes a separate plan optional, and every additional plan needs an evidence-backed split rationale. Under `adaptive`, still plan each `plan-required` theme while allowing other themes to proceed incrementally unless evidence promotes them. Preserve the exact post-subworkflow resume action.

Mission phases use `framed`, `observing`, `understanding`, `choosing`, `acting`, `validating`, `reflecting`, and `updating`; status alone owns `draft`, `active`, `blocked`, and `done`. Specialized mission phases: none.

When this loop invokes Execute Plan for a recorded source, preserve the pipeline's `draft`, `active`, `blocked`, resumed `active`, and outcome-backed `done` lifecycle boundaries. Require exactly one validated reciprocal plan outcome before terminal plan closure, keep inline plan content free of invented record state, and return to the mission's exact post-plan action without treating the plan outcome as the mission outcome.

After Validate and Reflect establish a terminal `succeeded`, `partial`, `failed`, or `cancelled` result for a recorded mission, but before setting its status to `done`, use `fragment-capture-execution-outcome`, `fragment-format-outcome-record`, and `fragment-create-outcome-file` to produce exactly one approved, validated related outcome. Keep resumable `active` and `blocked` missions open.

Check the mission’s existing `related` paths for a matching outcome before proposing a new file, and reuse that outcome when it already represents this closure. Otherwise present one closure package containing the exact outcome preview, mission terminal cleanup, `done` status change, and both reciprocal `related` links.

Apply only the approved closure package. When Pipes Local automatically adds the reciprocal `related` path and refreshes `.pipes/utils/state/related-sync-state.json` after an approved source-record relationship write, treat those changes as expected app-managed effects and do not repeat the reciprocal edit directly; direct agent-authored writes to related records remain governed by their own authority.

Only after the outcome and relationships are written, re-read, and validated may the loop clear active gates and Next Actions and mark the mission `done`. A lightweight loop run without a mission does not create a mission outcome.

## Available Pipelines

- `pipeline-design-spec` when an accepted intent has no accepted spec
- `pipeline-plan-new-feature` for a deterministic implementation plan that cites spec requirement IDs
- `pipeline-execute-plan` for an approved plan
- `pipeline-record-decision` for a lasting delivery choice
- `pipeline-review-change` after Validate, to review a service pull request with the verifier and the non-author reviewer and hand the recommendation to the code owner
- `pipeline-release-change` after merge, to release or promote through the environments in `.pipes/ai-instructions/delivery.md` behind gate G5 and record the release in the outcome

## Validation

- Acceptance criteria map to concrete evidence.
- Changed surfaces follow repository conventions.
- User-visible behavior is inspected on its real surface when applicable.
- Tests, limitations, deviations, and residual risks are explicit.

## Stop Conditions

Stop only when the feature is validated, a material user decision is required, a blocker prevents progress, or the next action is protected. Otherwise fix, retest, and continue.

## Mission Prompt

```markdown
Use loop-feature-delivery for {feature outcome}.
Scope: {included and excluded work}
Constraints: {technical and authority limits}
Validation: {acceptance evidence}
```
