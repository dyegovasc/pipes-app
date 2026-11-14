---
title: Validate Plan Consistency
description: Checks whether an approved implementation plan matches its readable record contract, current project lineage, and live codebase before execution.
version: 1.8
fragment_type: validation
domain: codebase
---
# Fragment: Validate Plan Consistency

Checks whether a generated implementation plan still matches the current codebase state, project lineage, and repo structure before implementation begins.

## Checks

### Input Resolution
- [ ] Exactly one input is supplied: a readable plan file or the exact approved plan content from the current handoff
- [ ] The validation mode is `persisted_record` or `approved_content`
- [ ] Persistence state and limitations are stated without claiming unwritten files or approvals

### Persisted Record Checks
- [ ] The filename follows `plan-{number}-{slug}.md`
- [ ] Frontmatter contains only fields allowed by the plans area config
- [ ] Status is one of the configured readable plan statuses
- [ ] `related` is a YAML list: `[]` when no files apply, otherwise unique readable project-relative paths
- [ ] Every `related` path resolves and no entry is duplicated
- [ ] Scope, implementation, risks, execution preconditions, validation, and acceptance criteria are present and agree with the approved plan

### Approved Content Checks
- [ ] The complete content approved in the current handoff is identifiable
- [ ] A target path is proposed only when persistence is intended
- [ ] Conversation-only content does not claim that a file or related-record update exists
- [ ] Missing persistence is reported as a handoff limitation, not as an implementation contradiction

### Spec Traceability
- [ ] When the plan relates to a spec, `## Spec Traceability` cites only requirement IDs that exist in that spec
- [ ] Every requirement of the related spec is covered by implementing steps with proof, or is listed as deferred with a reason

### Codebase Alignment
- [ ] Referenced repositories, modules, and directories exist
- [ ] Proposed files to modify already exist where the plan says they do
- [ ] Proposed new files fit the current repo structure and naming patterns

### Implementation Realism
- [ ] The recommended approach does not contradict the current architecture
- [ ] The implementation steps do not rely on non-existent contracts without calling them out as new work
- [ ] The plan does not silently merge scope from other missions, intents, or deferred slices

### Planning Completeness
- [ ] Every implementation step names affected files or a discoverable target
- [ ] Dependencies and critical sequencing are explicit
- [ ] Tests are proportional to the blast radius and acceptance criteria
- [ ] Risks, verified execution preconditions, blockers, protected actions, and deferred work are visible rather than implied
- [ ] Every input, dependency, target, and acceptance criterion required for execution is verified

### Consistency Findings
- [ ] Every contradiction or unresolved caveat blocks execution readiness
- [ ] Every finding includes a concrete correction

## Decision Tree

```
Does the plan contradict the live codebase?
    ├─ NO  → Mark consistency as pass
    └─ YES → Record blocking finding + stop implementation handoff
```

## Output

- `consistency_status`: `pass` | `blocking`
- `consistency_findings`: list of findings with severity, affected section, and correction
- `verified_preconditions`: inputs, dependencies, targets, and acceptance criteria checked for execution
- `validated_input`: `file` | `supplied_content`
- `artifact_status`: `persisted_record` | `approved_content`

## Acceptance Criteria

- [ ] The selected validation mode satisfies its readable plan and lineage contract
- [ ] Referenced repositories, paths, and existing contracts resolve or are explicitly identified as new work
- [ ] No contradiction or unresolved caveat remains hidden
- [ ] Every finding has a concrete correction before execution handoff
- [ ] The plan can be trusted as a current-state implementation handoff

## Failure Handling

1. List each contradiction with severity and exact correction.
2. Treat every contradiction or unresolved caveat as blocking.
3. If any finding exists, stop short of declaring the plan execution-ready.
