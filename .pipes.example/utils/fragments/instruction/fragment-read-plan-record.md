---
title: Read Plan Record
description: Extracts scope, work, constraints, and acceptance evidence from an approved plan.
version: 2.5
fragment_type: instruction
domain: project
---
# Fragment: Read Plan Record

## Instructions

1. Resolve exactly one source and classify `plan_source_kind` as `recorded` for a readable plan file or `inline` for the exact plan content approved in the current conversation.
2. For a recorded plan, extract its exact project-relative path, current semantic version, configured lifecycle status, YAML `related` list, invoking mission when present, whether the mission links reciprocally, every related outcome candidate, and whether each candidate links reciprocally to this plan. Treat `related: []`, one-way mission linkage, an unresolved mission target, or stale plan-content and final-validation receipts as a blocking finding for a persisted mission-bound plan.
3. Extract scope, implementation steps, verified preconditions, blockers, risks, protected actions, acceptance criteria, expected outputs, validation surfaces, any active mission workflow and gate context, and distinct plan-content, plan-execution, resume, lifecycle, and closure receipt subjects when present.
4. For inline content, preserve its exact approval boundary and report lifecycle and mandatory plan outcome handling as `not_applicable`; do not invent a record path, version, status, relationship, or outcome.
5. Summarize the plan in execution terms without changing its meaning or adding new work.
6. Report missing approval, unsupported or contradictory recorded status, multiple matching outcomes, broken reciprocal linkage, or ambiguity that makes safe execution impossible. When an active mission invoked planning, preserve its intervention-to-autonomy mapping, pending gate, approval validity, resume trigger, and exact post-plan action.

## Output

- `plan_source_kind`: `recorded` | `inline`
- Recorded plan path, version, lifecycle status, related outcome candidates, and reciprocal state when applicable
- Exact approved inline content boundary and lifecycle non-applicability when applicable
- Execution brief
- Acceptance criteria
- Constraints, risks, and expected outputs
- Active mission binding, gate authority, and resume action when applicable
