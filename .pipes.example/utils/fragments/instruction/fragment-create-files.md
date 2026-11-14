---
title: Create Files
description: Writes an approved framework component and refreshes only its static generated surfaces.
version: 2.4
fragment_type: instruction
domain: all
---
# Fragment: Create Files

## Instructions

1. Verify the exact content and target paths were approved.
2. Validate every Markdown payload against `rule-pure-markdown-writing` before writing; stop on raw HTML outside inline or fenced code.
3. Classify each target before writing. Pipelines belong in `.pipes/utils/pipelines/pipeline-{id}.md`, loops in `.pipes/utils/loops/loop-{id}.md`, and fragments in their type directories. A target under a configured `.pipes/project/` record area is a durable project record; ordinary source, framework, generated, config, temporary, and conversation-only outputs are not.
4. For every durable project record created during active mission execution, read its area config, require `related`, include the invoking mission in the record and the reciprocal record path in the mission within the approved relationship package, write or verify both effects, and re-read the record and mission before reporting completion. Refuse creation when authority, either path, target validity, write, or reciprocity is absent; expected Pipes Local synchronization may apply the second write but must be verified.
5. For durable generated artifacts, apply the complete creator-owned procedure in `rule-artifact-record-contract`. Carry supplied source paths even outside missions. Verify both persisted relationship directions before reporting completion. Capture existing managed metadata before controlled regeneration.
6. Refuse to overwrite unrelated or unmanaged content without approval.
7. When a separate starter source tree exists, change that source first and reconcile the installed `.pipes` copy second.
8. Regenerate only applicable static surfaces: catalog, source map, pipeline skills, loop skills, policy skills, isolated agents, hook settings, and instruction wrappers. Validate a changed delivery profile with `delivery-profile.cjs`.
9. Re-read written and generated Markdown, run `.pipes/utils/scripts/validate-pure-markdown.cjs`, and run relevant generator development tests.

## Output

- Created or updated source paths
- Refreshed managed paths
- Validation evidence
