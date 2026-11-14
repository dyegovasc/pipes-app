---
title: Apply Plan Lifecycle Transition
description: Applies one authorized, evidence-backed, idempotent lifecycle transition to an executing recorded plan.
version: 1.0
fragment_type: instruction
domain: project
---
# Fragment: Apply Plan Lifecycle Transition

## Instructions

1. Classify `plan_source_kind` before any transition. Return `transition_result: not_applicable` for approved inline plan content and do not invent a plan path, status, version, relationship, or outcome requirement.
2. For a recorded plan, require its exact readable path, current version and status, the transition subject, current plan-execution or resume authority, supporting evidence, invalidation conditions, and exact post-transition action.
3. Re-read the source plan immediately before mutation and compare its persisted version, status, related paths, and relevant evidence with the requested transition. Stop on missing, stale, contradictory, ambiguous, or duplicate closure state.
4. Permit only these transitions:
   - `draft` to `active` after current plan-execution approval and readiness, immediately before the first remaining execution effect;
   - `active` to `blocked` when a resumable blocker prevents every meaningful remaining execution action;
   - `blocked` to `active` only after the blocker is resolved and current resume authority permits the exact next action;
   - `active` to `done` only after terminal result classification and exactly one validated related outcome with verified reciprocal linkage.
5. Treat an already matching persisted status and evidence as an idempotent reuse. Do not rewrite the record or increment its version merely to repeat the same transition.
6. Reject skipped, reversed, or unsupported transitions. A terminal outcome result of `succeeded`, `partial`, `failed`, or `cancelled` does not change the required final lifecycle transition from `active` to `done`.
7. Resolve the transition through the strictest applicable authority. Plan-content approval does not authorize execution; execution approval does not authorize a material deviation or unrelated record change; human-mandatory and protected gates remain user-owned.
8. Apply one minor semantic version increment for one coherent persisted transition, preserve all plan content and unrelated relationships, and change only the lifecycle fields or readable blocker context owned by the approved transition.
9. Re-read the plan after mutation and verify the target status, version, preserved content, related paths, and exact resume action. Report expected Pipes Local reciprocal relationship or sync-state effects separately from direct agent-authored changes.

## Output

- `plan_source_kind`: `recorded` | `inline`
- `transition_result`: `applied` | `already_matches` | `not_applicable` | `blocked`
- Source path and before/after version and status when recorded
- Authority, evidence, invalidation conditions, and preserved fields
- Blocker or terminal outcome relationship evidence when applicable
- Exact post-transition action or safe correction
