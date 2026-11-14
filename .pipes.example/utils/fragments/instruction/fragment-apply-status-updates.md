---
title: Apply Status Updates
description: Applies only approved status and relationship edits to readable records.
version: 2.0
fragment_type: instruction
domain: project
---
# Fragment: Apply Status Updates

## Instructions

1. Apply only the record edits explicitly approved or included in the request.
2. Validate the new status against the target area's `config.md`.
3. Bump frontmatter `version` once for each substantive record edit.
4. Update related body sections in the same edit so status and narrative agree.
5. Re-read changed files and report paths, old and new status, and version.
6. Stop on a contradiction rather than propagating status automatically.

## Output

- Updated record paths
- Status and version transitions
- Unapplied or conflicting updates
