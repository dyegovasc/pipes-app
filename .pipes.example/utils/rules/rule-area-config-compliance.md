---
title: Area Config Compliance
description: Requires project records to follow the small contract declared by their area.
version: 2.6
rule_type: governance
enforcement: binding
enforced_by: [model]
---
# Rule: Area Config Compliance

## Requirement

Before creating or materially updating a file under `.pipes/project/`, read the nearest `config.md` and follow its naming, frontmatter, and status contract.

## Checks

- For HTML-enabled areas, apply `rule-artifact-record-contract`. Persist relationships in escaped JSON `pipes:related`; do not require YAML, status, or created fields in HTML.

- Use the configured record filename pattern.
- Include only fields defined for that area unless the user is changing the area contract itself.
- Use valid status values and readable file paths for relationships.
- For Markdown, write `related` as a YAML block list: use `related: []` when no files apply, otherwise write `related:` followed by one `  - path` line for each unique readable project-relative path that resolves. Validators still read the one-line `related: [...]` form for compatibility, but do not write it. Any other form is invalid.
- Every durable project record created during active mission execution requires the target area contract to support `related`, the record and invoking mission to have direct and reciprocal `related` links in the approved relationship package, and both effects to be verified; stop when either path, target, authority, write, or post-write verification is missing.
- When Pipes Local applies an approved `related` write, treat its automatic reciprocal `related` update and `.pipes/utils/state/related-sync-state.json` refresh as expected app-managed effects; this does not authorize a direct agent-authored edit to any related or unrelated record.
- Keep body content appropriate to the record type.
- Stop on a missing or contradictory config instead of inventing metadata.
