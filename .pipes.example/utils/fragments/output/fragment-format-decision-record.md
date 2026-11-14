---
title: Format Decision Record
description: Formats a durable choice with context, alternatives, and consequences.
version: 2.3
fragment_type: output
domain: project
---
# Fragment: Format Decision Record

## Format

Produce a complete preview for `.pipes/project/05-decisions/decision-{number}-{slug}.md`.

Keep the decision title in frontmatter only; begin the body with `## Context`.

Serialize `related` as a YAML list: use `related: []` when no files apply; otherwise use unique, readable project-relative paths.

## Template

```markdown
---
title: {decision title}
description: {one-line summary}
version: 1.0
created: {YYYY-MM-DD}
status: proposed
related: []
---
## Context
{Why a durable choice is needed.}

## Decision
{Direct statement of the choice.}

## Alternatives Considered
- {Alternative and why it was rejected.}

## Consequences
- {Expected benefit, cost, constraint, or follow-up.}
```
