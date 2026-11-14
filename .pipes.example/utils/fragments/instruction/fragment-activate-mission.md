---
title: Activate Mission
description: Records explicit execution approval and prepares an approved mission for its selected loop.
version: 2.5
fragment_type: instruction
domain: project
---
# Fragment: Activate Mission

## Instructions

1. Confirm the user explicitly approved the displayed readiness package for the exact mission path and version.
2. Re-read the mission before writing. If its version, scope, selected loop, delivery approach, current theme, gates, or proposed initial action changed, return to readiness assessment.
3. Treat mission `status` as lifecycle state and the Journal gate receipt as execution-approval evidence. Reject `done` missions and unresolved `blocked` missions. Change `draft` to `active`; preserve `active` and record the same approval receipt when an approved mission was already active.
4. Bump the mission's minor version once. Update Current State with the selected loop phase, active workflow, pending gate, resume trigger, validation target, and approved initial action; preserve the approved `## Delivery` approach, current theme, classification, complete-scope coverage evidence, split rationale, and exact route; remove only the satisfied execution gate and preserve other gates. For `spec-driven`, set the initial action to `pipeline-plan-new-feature` until approved, validated plan coverage spans the complete confirmed mission scope, then permit `pipeline-execute-plan` without inferring a missing plan from classification or theme count.
5. Apply `fragment-mission-journal-contract` before appending one compact Journal approval receipt headed `YYYY-MM-DD hh:mm:ss` that names the gate subject and type, decision, deciding authority, approved mission version, activated or resumed mission version, invalidation conditions, and exact resume action.
6. Keep the title in frontmatter only, preserve the readable body sections, and do not introduce serialized runtime state.
7. Re-read the mission and verify status, version, loop, delivery continuity or readable legacy classification, intervention-to-autonomy mapping, gates, Next Actions, the 300-line non-Journal limit, and journal before returning the handoff.
8. Do not perform an initial protected action unless its separate approval was included explicitly in the readiness package.

## Output

- Activated or resumed mission path and version
- Selected loop and loop path
- Delivery approach, current theme, and exact route when present
- Approved initial action
- Remaining gates and protected actions
- Readability and activation validation
