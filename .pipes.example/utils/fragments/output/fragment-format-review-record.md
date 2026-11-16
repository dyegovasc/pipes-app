---
title: Format Review Record
description: Formats a review of one change as a durable artifact record linked to its plan.
version: 1.1
fragment_type: output
domain: codebase
---
# Fragment: Format Review Record

## Format

Produce a complete preview for `.pipes/project/07-artifacts/reviews/artifact-{number}-review-{repo}-{change}.md` under `rule-artifact-record-contract`. `{change}` is `pr-{number}` for a pull request or the branch name for a branch. Write the record in the project's documentation language.

Keep the title in frontmatter only; begin the body with `## Summary`. List the related plan in `related`, and add the record to the plan's `related` list as a reciprocal effect.

## Template

```markdown
---
title: Review Of {repo} {change}
description: {verdict}: {blocking} blocking, {major} major, {minor} minor findings.
version: 1.0
created: {YYYY-MM-DD}
status: final
related:
  - .pipes/project/04-plans/{plan file}
---
## Summary

- Repository and change: `{repo}` {change}, base `{base commit}`, head `{head commit}`
- Verdict: {ready, ready with findings, or not ready}. This is a recommendation; the holder of gate G4 decides it.
- Tally: {blocking} blocking, {major} major, {minor} minor

## Verification

| Acceptance criterion or requirement | Result | Evidence |
| --- | --- | --- |
| {R-ID or criterion} | {proved, failed, or not proved} | {command and result} |

## Findings

| Severity | Location | Rule or requirement | Finding | Correction |
| --- | --- | --- | --- | --- |
| {blocking, major, or minor} | `{file}:{line}` | {rule id or R-ID} | {problem} | {fix} |

## Pull Request Checks

- {check name}: {status}

## Not Reviewed

- {area or reason, or none}
```
