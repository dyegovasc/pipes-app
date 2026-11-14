---
title: Format Onboarding Record
description: Formats the record of one service repository's agent-docs onboarding, with its classification, drafts, review, and pull request state.
version: 1.0
fragment_type: output
domain: codebase
---
# Fragment: Format Onboarding Record

## Format

Produce a complete preview for `.pipes/project/07-artifacts/onboarding/artifact-{number}-onboarding-{service}.md` under `rule-artifact-record-contract`. The record holds the classification table, the proposed files in full, the reviewer verdict, and the pull request state. A dry run ends with this record and changes nothing in the service repository. Write it in English and keep the title in frontmatter only.

## Template

````markdown
---
title: Onboarding Of {service}
description: {dry run or proposed}: {kept} kept, {removed} removed, {conflicts} conflicts.
version: 1.0
created: {YYYY-MM-DD}
status: draft
related: []
---
## Summary

- Service: `{service}`
- Mode: {dry run, or pull request {link}}
- Reviewer verdict: {ready, ready with findings, or not ready}
- Counts: {org-policy} org-policy, {service-specific} service-specific, {conflict} conflict, {stale} stale, {contradicts-decision} contradicts-decision, {duplicate} duplicate

## Classification

| File:line | Statement | Class | Rule, conflict, decision, or reason |
| --- | --- | --- | --- |
| `{file}:{line}` | {summary} | {class} | {reference} |

## Proposed AGENTS.md

```markdown
{full proposed content}
```

## Proposed CLAUDE.md

```markdown
{full proposed content}
```

## Proposed REVIEW.md

```markdown
{full proposed content}
```

## Review

- {reviewer finding with severity, or none}

## Not Included

- {file not proposed, such as bands.yaml without a monitoring source, with the reason}
````
