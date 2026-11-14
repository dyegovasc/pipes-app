---
title: Mission State Integrity
description: Keeps mission state concise, readable, current, and useful for the next action.
version: 2.7
rule_type: governance
enforcement: binding
enforced_by: [model]
---
# Rule: Mission State Integrity

## Requirement

The mission Markdown page is the durable state for one loop run. Its frontmatter and body must agree, remain human-readable, and avoid a second serialized state representation.

## Checks

- Frontmatter follows the mission area config and contains only small identity, relationship, loop, status, and version fields; `loop` is the one mission-to-loop reference.
- Mission `status` records lifecycle state, while a Journal gate receipt records execution approval; `active` alone neither proves approval nor makes a pending execution gate contradictory.
- Operating Envelope records `less`, `more`, or `context-dependent` human intervention mapped respectively to the existing `delegated_until_escalation`, `user_mediated`, or `mixed` profile, plus readable delegated authority, user authority, protected surfaces, and escalation conditions.
- Current State distinguishes active workflow, pending gate, resume trigger, validation target, facts, assumptions, constraints, and last result, and uses a selected-loop non-terminal phase rather than duplicating status.
- For delivery-aware missions, preserve a cold-resumable coverage map containing exact plan paths and versions, covered themes and dependencies, plan-content and final-validation receipts, reciprocal mission relationships, and evidence-backed split rationale. Under `spec-driven`, no plan executes until approved, validated plans collectively cover the complete confirmed mission scope, and classifications do not set plan count.
- Every durable project record created during active mission execution must directly and reciprocally link this mission before its creation phase completes; verify expected app-managed synchronization rather than assuming it, and stop when the relationship is absent, one-way, stale, unresolved, or unauthorized.
- Gates contain only consequential unresolved boundaries; each pending gate names its subject, gate type, deciding authority, status, invalidation conditions, and exact resume action.
- Validation names a concrete check, result, scope relevance, detailed-evidence path when available, and residual risk for unrelated failures.
- Next Actions are current and actionable while status is `active`.
- Journal entries are short milestones, not a transcript; each gate decision is a compact receipt naming subject and gate type, decision, deciding authority, mission version, invalidation conditions, and exact resume action.
- All content before `## Journal` is at most 300 physical lines. The Journal heading and content are excluded from that quota and may grow as needed to preserve useful history.
- Status is `done` only after objective and validation conditions pass and exactly one approved, validated related outcome exists with reciprocal `related` paths.
- A completed related plan and its plan outcome do not close the mission; mission terminal validation still owns one distinct mission outcome.
- A done mission has no pending gate or active Next Action; durable follow-up is routed to a new mission.
- Use record validation in report mode during active work; repair safe in-scope record defects and revalidate before stopping for a missing or contradictory config, ambiguous relationship, or user-authority gate.
- Status is `blocked` only when meaningful progress cannot continue.
