---
title: Plan State Integrity
description: Keeps recorded plan lifecycle state accurate and requires one validated outcome before terminal closure.
version: 1.2
rule_type: record
enforcement: binding
enforced_by: [model]
---
# Rule: Plan State Integrity

## Requirement

An executing recorded plan must reflect its actual lifecycle, and terminal execution must have exactly one validated related outcome before the plan becomes `done`.

## Checks

- Classify the execution source as `recorded` or `inline`; never invent record state for approved inline content.
- Keep plan-content approval distinct from plan-execution, resume, lifecycle, outcome, relationship, and protected-effect authority.
- A persisted mission-bound plan must directly and reciprocally link its invoking mission before planning completes, and its exact version must have matching content-approval and final-validation receipts. Refuse `related: []`, one-way linkage, stale receipts, or unresolved targets for mission-bound plans while preserving inline-plan semantics.
- For a recorded plan, use only `draft` to `active`, `active` to `blocked`, resolved `blocked` to `active`, and outcome-backed `active` to `done` transitions.
- Apply activation after readiness and before the first remaining execution effect; keep retries idempotently `active`.
- Record a resumable blocker as `blocked` before pausing and require resolved evidence plus current authority before resuming `active`.
- Classify terminal result as `succeeded`, `partial`, `failed`, or `cancelled`; result belongs to the outcome and does not replace plan lifecycle status.
- Before `done`, create or reuse exactly one validated outcome, verify reciprocal plan linkage, and stop on missing, multiple, contradictory, or stale outcome candidates.
- Re-read actual plan and outcome state before retry; reuse matching transitions and outcomes without duplicate writes or version increments.
- Apply the same lifecycle and closure behavior for direct and mission-bound Execute Plan invocation while preserving their different authority sources and resume routes.
- Keep mission and other related-record synchronization proposal-only unless separately authorized; a plan outcome never substitutes for the separate outcome required to close a recorded mission.
- Do not require a plan outcome or status transition for inline plan content unless a separately authorized workflow first creates a source plan record.
- Do not require historical record migration merely because older done plans predate this rule.
