---
title: Format Outcome Record
description: Formats factual closure for a mission or plan.
version: 2.7
fragment_type: output
domain: project
---
# Fragment: Format Outcome Record

## Format

Produce a complete preview for `.pipes/project/06-outcomes/outcome-{number}-{slug}.md`.

Keep the outcome title in frontmatter only; begin the body with `## Summary`.

Serialize `related` as a YAML list: use `related: []` when no files apply; otherwise use unique, readable project-relative paths. When this outcome closes a mission or recorded plan, include exactly that source record and include the reciprocal source-record relationship in the exact approval package. For a recorded plan, state that the preview is the sole matching closure candidate and that `active` to `done` remains conditional on persisted reciprocal validation. Identify direct agent-authored relationship writes separately from expected Pipes Local reciprocal `related` and sync-state effects. Do not format a mandatory plan outcome for inline plan content without a source record.

## Template

```markdown
---
title: {outcome title}
description: {one-line result}
version: 1.0
created: {YYYY-MM-DD}
status: recorded
related: []
result: {succeeded|partial|failed|cancelled}
---
## Summary
{What happened.}

## Changes
- {Changed file, record, or artifact.}

## Validation
- {Check and result.}

## Deviations
- {Deviation or none.}

## Residual Risk
- {Risk or none.}

## Follow-Up
- {Action or none.}

## Release
- Environment: {target environment, or not released}
- Version: {version}
- Workflow run: {URL of the release or promote run}
- Change ticket: {reference matching the change-ticket pattern in delivery.md; leave this line out when the environment does not use tickets}
- Approved by: {holder of gate G5}
```

Include `## Release` only when the outcome closes a release or promotion; omit it for work that is not released.
