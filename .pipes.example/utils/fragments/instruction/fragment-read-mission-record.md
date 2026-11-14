---
title: Read Mission Record
description: Extracts the readable execution contract from one selected mission without changing it.
version: 2.6
fragment_type: instruction
domain: project
---
# Fragment: Read Mission Record

## Instructions

1. Resolve exactly one file under `.pipes/project/03-missions/` and read the mission area config before interpreting it.
2. Read the complete mission and extract title, version, status, related paths, selected loop ID, objective, scope, optional `## Delivery`, autonomy profile, human-intervention level, delegated authority, user authority, protected surfaces, escalation conditions, roles, current state, gates, validation, stop conditions, Next Actions, and journal.
3. When `## Delivery` exists, extract its approach, rationale, loop-capability evidence, ordered themes, dependencies, affected contract families, planning classifications, routes, promotion triggers, current theme, exact plan paths and versions, coverage map, split rationale, plan-content receipts, and final-validation receipts. Validate that the selected persisted route matches the selected loop's declared capabilities and the mission's current or first useful Next Action; for `spec-driven`, require approved, validated plan coverage for the complete confirmed mission scope before plan execution without inferring plan count from classifications.
4. When `## Delivery` is absent, classify the record as `legacy_without_delivery` and preserve its readable Next Action; do not invent a decomposition, delivery approach, or migration during execution loading.
5. Confirm that the selected loop ID resolves to one installed loop definition, that the intervention level maps to the recorded existing autonomy profile, that Current State uses a permitted non-terminal phase, and identify the active workflow, pending gate, resume trigger, validation target, and current or first useful Next Action.
6. Treat `Loop fit:` as optional rationale only; do not expect or create a separate loop body section.
7. Treat mission `status` as lifecycle state and a Journal gate receipt as execution-approval evidence. Distinguish creation approval from execution approval, and never infer execution authority from file existence or status alone.
8. Treat an `active` mission with a pending execution gate or a Journal statement that execution has not started as coherent input to execution readiness; do not report a contradiction merely because its lifecycle status is already active.
9. Report missing, contradictory, or stale fields without repairing the file or beginning mission work.

## Output

- Mission path, title, version, and status
- Selected loop and loop path
- Delivery contract or `legacy_without_delivery`, including current theme, route, coverage map, split rationale, and exact plan evidence when present
- Execution brief and proposed initial action
- Allowed, protected, and blocked actions
- Intervention-to-autonomy mapping, deciding authority, active workflow, pending gate, and resume trigger
- Validation expectations and record-contract findings
