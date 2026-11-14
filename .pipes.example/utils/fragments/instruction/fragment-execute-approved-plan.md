---
title: Execute Approved Plan
description: Executes only ready approved plan steps with explicit recovery, deviation, protected-action, and validation stops.
version: 1.4
fragment_type: instruction
domain: project
---
# Fragment: Execute Approved Plan

## Instructions

1. Require `readiness_status: ready`, exact current plan approval, known `plan_source_kind`, output routing, and one safe remaining step. Stop when any prerequisite is absent.
2. Before the first remaining execution effect, require an `applied` or `already_matches` activation transition for a recorded plan, or `not_applicable` for inline content.
3. Treat the approved plan as the scope, ordering, acceptance, and authority contract. Do not silently redesign it or add cleanup outside its boundaries.
4. Re-read relevant targets immediately before acting. Reuse effects classified `already_matches`, reconcile `partial` or `uncertain` effects, and execute only steps still required.
5. Perform work in its canonical destination:
   - implementation in the plan's named repository or workspace paths;
   - project records in their configured `.pipes/project/` area;
   - supporting artifacts in `07-artifacts` only when no better owner exists.
6. Preserve unrelated user changes and refuse an unmanaged overwrite or destructive recovery that the approval does not cover.
7. Before each consequential effect, distinguish:
   - an ordinary implementation detail inside the approved approach;
   - a material deviation that changes scope, acceptance, architecture, order, persistence, or risk;
   - a protected action such as staging, committing, pushing, publishing, deployment, destructive change, or external communication.
8. Continue ordinary approved work. For an active mission, resolve plan gates through its recorded intervention-to-autonomy mapping and governing authority; human-mandatory remains user-owned. Stop and surface the exact decision for a material deviation, blocker, or protected action lacking current authority.
9. Validate incrementally where a later step depends on the result. Record failures and do not continue through a broken prerequisite merely to finish.
10. Keep a factual execution log of changed files, reused effects, artifacts, validations, deviations, blockers, and skipped or altered steps. When a gate pauses an active mission, update its active workflow, pending gate, deciding authority, invalidation conditions, resume trigger, and exact next action.
11. After an immediate gate decision, append its compact mission receipt and continue with the recorded resume action when the approval remains valid. Do not require another execute-plan or execute-mission command merely to resume the active interaction; treat a cold or stale return as a new readiness boundary.
12. Note a durable decision candidate for its own record workflow; do not hide it in implementation notes or create a decision automatically.
13. When a resumable blocker prevents every meaningful remaining action, apply the recorded plan's authorized `active` to `blocked` transition before pause. Do not invent blocked state for inline content or a terminal result.
14. Do not update mission or other related-record statuses during execution; they remain proposal-only unless separately authorized.

## Output

- `changed_files`
- `created_artifacts`
- `reused_or_unchanged_effects`
- `execution_log`
- `execution_deviations`
- `validation_runs`
- `blocking_issues` and `protected_actions_pending`
- `remaining_steps` and safe resume boundary
