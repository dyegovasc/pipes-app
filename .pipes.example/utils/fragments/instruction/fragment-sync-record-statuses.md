---
title: Sync Record Statuses
description: Proposes conservative related-record updates after meaningful progress or closure.
version: 2.1
fragment_type: instruction
domain: project
---
# Fragment: Sync Record Statuses

## Instructions

1. Assess the executing source and its related records first.
2. Exclude the executing source plan from this fragment. Its lifecycle is owned by `fragment-apply-plan-lifecycle-transition`; inline plan content has no source status.
3. Change a mission or other related record only when its own objective or stop condition is materially affected.
4. Do not infer that a related record is done merely because one linked record or plan is done, and do not treat a plan outcome as the invoking mission's outcome.
5. For every proposed edit, name path, current status, proposed status, rationale, and version bump.
6. Apply nothing in this fragment; separate proposal from mutation.

## Output

- Proposed status updates
- Records deliberately left unchanged
- Rationale and version changes
