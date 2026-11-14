---
title: Assess Plan Execution Readiness
description: Verifies exact plan approval, current fit, output routing, prior effects, blockers, and protected gates before execution.
version: 1.6
fragment_type: instruction
domain: project
---
# Fragment: Assess Plan Execution Readiness

## Instructions

1. Identify `plan_source_kind`, the exact recorded path and version or inline content boundary, and evidence that the user or declared authority approved that complete plan for execution. Require the execution approval or receipt to name plan execution as its subject; a plan-content receipt is distinct and does not authorize implementation. Outside an active mission the approving authority is the user. Inside an active mission, resolve it from the recorded intervention-to-autonomy mapping and governing gates; human-mandatory remains user-owned. A request to run a pipeline is not plan approval unless it clearly approves the exact current plan.
2. Extract recorded lifecycle status and related outcome candidates when applicable, plus outcome, scope, non-goals, implementation order, execution preconditions, blockers, risks, acceptance criteria, expected outputs, and protected actions.
3. For a recorded plan, reject `done`; accept `draft` for activation, accept `active` for idempotent continuation, and accept `blocked` only when the blocker is resolved and exact resume authority is current. Do not classify an inline source by record status.
4. Inspect only the relevant repository state, current targets, dependencies, related records, and existing outputs needed to verify every execution precondition.
5. Classify each planned effect as `not_started`, `already_matches`, `partial`, `changed_since_approval`, or `uncertain`; never assume an interrupted step failed merely because the prior response ended.
6. Resolve a canonical destination for every output and identify any fallback supporting artifact before execution begins.
7. Identify the primary execution owner, participating roles, relevant folders or repositories, remaining ordered steps, and validation surfaces.
8. List every material drift, contradiction, blocker, missing dependency, approval gap, outcome conflict, broken reciprocal relationship, and protected action with the phase or authority that owns it. When mission-bound, verify the recorded active workflow, pending gate, invalidation conditions, resume trigger, post-plan action, exact approved plan versions, content and validation receipts, reciprocal mission relationships, coverage map, and split rationale. For `spec-driven`, reject readiness unless the approved, validated plan set collectively covers the complete confirmed mission scope; do not infer a missing-plan condition from classification or theme count.
9. Classify readiness:
   - `ready`: exact approval is current, every input, dependency, target, and acceptance criterion is verified, the plan still fits, destinations are known, and at least one safe remaining action exists.
   - `needs_correction`: plan content, scope, acceptance, routing, or approval is incomplete, stale, ambiguous, or contradicted but can be corrected.
   - `blocked`: no meaningful action can proceed until an external condition or unresolved prerequisite changes.
10. Return `next_lifecycle_transition` as `draft -> active`, `blocked -> active`, `already active`, or `none` for a recorded source, and `not_applicable` for inline content.
11. Do not execute, write, stage, apply a lifecycle transition, create an outcome, or update a related record in this fragment.

## Output

- `plan_source_kind`, `plan_source`, `plan_version`, recorded status when applicable, and `plan_approval_evidence`
- `readiness_status`: `ready` | `needs_correction` | `blocked`
- `execution_kind`: `artifact` | `code` | `mixed`
- `execution_scope`, `primary_owner`, and `participating_roles`
- `output_routing` and `validation_surfaces`
- `effect_state`: per-step current-effect classification
- `remaining_steps`: ordered safe work not already complete
- `protected_gates`, `blocking_issues`, and `repo_state_contradictions`
- `readiness_notes` and exact correction or resume boundary
- `next_lifecycle_transition` and supporting authority or non-applicability
- active mission continuation and approval-validity evidence when applicable
