---
title: Assess Mission Execution Readiness
description: Determines whether a recorded mission can safely start or resume under an explicit execution approval.
version: 2.5
fragment_type: validation
domain: project
---
# Fragment: Assess Mission Execution Readiness

## Checks

### Record And Status
- [ ] Exactly one canonical mission path is selected and readable
- [ ] Frontmatter follows the mission area config
- [ ] Status is `draft` or `active`; `done` is terminal and `blocked` requires evidence that its blocker has been resolved before reassessment
- [ ] Mission `status` is treated as lifecycle state, while a Journal gate receipt is treated as execution-approval evidence
- [ ] An `active` mission with a pending execution gate or a Journal statement that execution has not started is coherent and proceeds to readiness; do not classify it as `needs_correction` for status alone
- [ ] Objective, scope, operating envelope, roles, Current State, Gates, Validation, Stop, Next Actions, and Journal are present and coherent
- [ ] When `## Delivery` exists, its approach, themes, dependencies, classifications, selected-loop capability evidence, current theme, and next route are coherent and still valid
- [ ] A readable legacy mission without `## Delivery` is identified as legacy and assessed from its existing scope and Next Action without an invented migration
- [ ] Human-intervention level maps to the recorded existing autonomy profile, and delegated authority, user authority, protected surfaces, and escalation conditions are explicit
- [ ] Current State has a non-terminal phase permitted by the selected loop and does not duplicate status
- [ ] Current State identifies the active workflow, pending gate, resume trigger, and validation target
- [ ] A done mission has no pending gates or active Next Actions

### Loop And Action
- [ ] The selected loop exists and fits the mission's dominant work
- [ ] The current or first Next Action is concrete, useful, and inside scope
- [ ] For a delivery-aware mission, the initial action matches the approved persisted `spec-driven` or `adaptive` route; a `spec-driven` mission whose approved, validated plans do not cover the complete confirmed mission scope begins with `pipeline-plan-new-feature`, while complete coverage may route to `pipeline-execute-plan` without counting plans by classification or theme
- [ ] No unresolved mission gate prevents that action
- [ ] Any pending gate states its subject, gate type, deciding authority, status, invalidation conditions, and exact resume action
- [ ] Protected effects required by the initial action are identified rather than silently included in mission-execution approval

### Current Evidence
- [ ] Relevant files and external state have not materially invalidated the mission since it was recorded or last updated
- [ ] Existing worktree changes are identified and can be preserved
- [ ] Assumptions, blockers, and validation gaps that affect starting are visible
- [ ] Scope or authority changes identify the affected scope, approval authority, and record version

### Approval Package
- [ ] The package names the exact mission path, version, status, selected loop, delivery approach and current theme when present, intervention-to-autonomy mapping, initial action, allowed scope, protected actions, deciding authority, resume trigger, and validation target
- [ ] Creation approval is not presented as execution approval
- [ ] `active` status alone is not presented as execution approval
- [ ] The user can approve or reject execution before any mission action occurs

## Acceptance Criteria

- [ ] Readiness is classified as `ready`, `needs_correction`, or `blocked`
- [ ] A `ready` result has one safe initial action and no hidden blocking gate
- [ ] Corrections or blockers are concrete and tied to the mission record
- [ ] Explicit execution approval is still pending when this fragment finishes

## Output

- Readiness classification and rationale
- Exact approval package
- Delivery continuity or legacy-mission classification
- Corrections, blockers, and protected actions
- Proposed start or resume action
