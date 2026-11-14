---
title: Format Mission Record
description: Formats a compact draft mission record without starting its selected loop.
version: 2.10
fragment_type: output
domain: project
---

# Fragment: Format Mission Record

## Format

Produce one complete preview for `.pipes/project/03-missions/mission-{number}-{slug}.md`. Preserve the explicit user-selected human-intervention level and its exact mapped autonomy profile from the validated mission frame; do not default, infer, or alter either value while formatting. Preserve the validated theme decomposition, selected-loop capability evidence, and delivery approach without turning them into an implementation plan. Keep all content before `## Journal` at or below 300 physical lines. The `## Journal` heading and its content are excluded from this quota and may grow as needed to preserve useful history.

Serialize `related` as a YAML list: use `related: []` when no files apply; otherwise use unique, readable project-relative paths.

Every Journal heading must use `YYYY-MM-DD hh:mm:ss`; date-only headings are invalid.

## Template

```markdown
---
title: {mission title}
description: {one-line outcome}
version: 1.0
created: {YYYY-MM-DD}
status: draft
related: []
loop: {loop id}
---

## Objective

{Concrete outcome.}

{Optional only when non-obvious: Loop fit: {why this loop affects authority or execution}.}

## Scope

In scope:
- {Included work.}

Out of scope:
- {Excluded work.}

## Delivery

Approach: `{spec-driven|adaptive}`

Approach rationale: {Why this route is valid for the classifications and selected-loop capabilities.}

Loop capabilities:
- Planning: {available through pipeline ID or unavailable}
- Plan execution: {available through pipeline ID or unavailable}

Themes:

1. **{Readable theme label}** — `{plan-required|plan-recommended|direct-capable}`
   - Outcome: {Bounded theme result.}
   - Depends on: {theme labels or none}
   - Affected contract families: {families, components, or records}
   - Route: {plan before execution, incremental loop action, or governed handoff}
   - Promotion trigger: {evidence that would require stricter planning or none}

Current theme: {Readable theme label}

## Operating Envelope

Autonomy profile: `{user_mediated|delegated_until_escalation|mixed}`

Human-intervention level: `{more|less|context-dependent}`

Allowed:
- {Safe in-scope action.}

Delegated authority:
- {Decision or action the agent may complete without another user gate.}

Needs approval:
- {Protected action or durable choice.}

User authority:
- {Decision or action reserved for the user.}

Protected surfaces:
- {Surface that always follows its applicable gate.}

Escalate when:
- {Condition that narrows delegation or requires user intervention.}

Constraints:
- {Constraint.}

## Roles

Primary: `{role}`

Consult when needed:
- `{role}` — {trigger}

## Current State

Phase: framed

Active workflow: none

Pending gate: mission execution; human_mandatory; user; pending

Resume trigger: explicit execution approval; activate the mission and begin the first Next Action

Validation target: {observable validation target}

Known:
- {Known fact.}

Assumptions:
- {Assumption or none.}

Last result: Mission created from an approved preview; execution is not approved.

## Gates

- Execution requires separate approval through `pipeline-execute-mission`.
- Each pending gate states its subject, gate type, deciding authority, status, invalidation conditions, and exact resume action.
- {Other pending material gate or none.}

## Validation

- Check: {concrete check}; Result: {result}; Relevance: {scope relevance}; Evidence: {path or none}.

## Stop

- Complete when {validated completion condition}.
- Ask when {genuine user decision}.
- Blocked when {condition preventing progress}.
- Stop before {protected action}.

## Next Actions

1. After execution approval, {first useful action}.

For a done mission, require exactly one approved, validated related outcome with reciprocal `related` paths, then use `Gates: None` and `Next Actions: None; mission complete.`; route any further durable work to a new mission.

## Journal

### {YYYY-MM-DD hh:mm:ss} — Created

- Selected `{loop id}` because {fit}.
- User explicitly selected `{human-intervention level}` intervention, mapped to `{autonomy profile}`; this preference may narrow but never widen applicable authority.
- Selected `{delivery approach}` delivery from the validated theme decomposition and loop capabilities; no optional pipeline was invoked during creation.
- Execution has not started.
- After approval: {first useful action}.
- When scope or authority changes: name the affected scope, approving authority, and mission version.
```
