---
title: Create Plan File
description: Selects a canonical plan path and writes only the exact implementation plan approved for that target.
version: 2.4
fragment_type: instruction
domain: codebase
---
# Fragment: Create Plan File

## Instructions

1. Read `.pipes/project/04-plans/config.md` and scan existing `plan-*.md` filenames before approval is requested.
2. Choose the next available zero-padded `plan-{number}-{slug}.md` target and stop if it conflicts with different existing content.
3. Validate the proposed plan's small frontmatter, related paths, scope, steps, risks, validation, and acceptance criteria.
4. Before writing, verify `related` is a YAML list: use `[]` only when no paths apply. A persisted mission-bound plan must name its invoking mission and cannot use `related: []`; stop when the invoking mission path or relationship authority is absent.
5. Display the exact plan and target path. For a mission-bound plan, also display the invoking mission path, both reciprocal `related` effects, and whether Pipes Local is expected to apply the approved reciprocal update. Confirm that approval covers content, creation, and the complete relationship package.
6. After approval, write and re-read the plan. Re-read the invoking mission when mission-bound and verify that the written content, path, and both persisted `related` values match the approved proposal; do not report completion for an absent, one-way, stale, unresolved, or unverifiable relationship.
7. When the plan implements a spec, include the spec path in the plan's `related` list and the plan path in the spec's `related` list in the same relationship package, and verify both after writing.
8. Do not modify a mission, note, intent, spec, or related record unless that edit was explicitly included in the relationship package or another approval. Expected automatic reciprocal synchronization implements the approved second effect but does not widen authority.

## Output

- Plan path
- Approval scope and creation result
- Config and content validation
- Invoking mission and verified reciprocal relationship when mission-bound
- Any separately proposed related-record update or expected app-managed synchronization
