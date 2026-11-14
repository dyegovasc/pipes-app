---
title: Format Intent Record
description: Formats an intent record with the problem, proposed outcome, success checks, affected systems, constraints, open questions, and source.
version: 3.2
fragment_type: output
domain: project
---
# Fragment: Format Intent Record

## Format

Produce a complete preview for `.pipes/project/01-intents/intent-{number}-{slug}.md`. The `01-intents` area holds intent records: one problem and its proposed outcome, ready for the product owner to accept before design starts.

Keep the intent title in frontmatter only; begin the body with `## Problem`.

Write the problem and outcome so that a person and an agent can both act on them. State the problem in user or system terms, not as a solution. Name every affected service by its repository name.

Use `status: draft` for every new intent. Only the product owner, as named for gate G1 in the Accountability Matrix in `.pipes/ai-instructions/accountability.md`, can set `accepted` or `rejected`. Approval to write the file is not acceptance of the intent.

Write up to 5 known checks under `## How Do We Know It Works`, and aim for 2 to 5. Each check is one observable result that shows the proposed outcome is reached, stated so that a person or a test can confirm it. These checks are proto acceptance criteria, not final requirements: `pipeline-design-spec` turns them into numbered requirements and cites each check by its position in the list, starting at 1. After a spec cites the checks, do not reorder or remove them; add a new check at the end of the list. When a check is unknown, do not invent it: list it under `## Open Questions` and leave that bullet out of the section. When no check is known, write `- None known; see Open Questions.` in the section.

Serialize `related` as a YAML list: use `related: []` when no files apply; otherwise use unique, readable project-relative paths.

## Template

```markdown
---
title: {intent title}
description: {one-line proposed outcome}
version: 1.0
created: {YYYY-MM-DD}
status: draft
related: []
---
## Problem
{What is wrong or missing today, for whom, and the evidence.}

## Proposed Outcome
{The observable result when the problem is solved.}

## How Do We Know It Works
- {Observable check that shows the outcome is reached, for example: an order response includes the end of its free-cancellation window.}

## Affected Users And Systems
- Users: {affected user groups or consumers}
- Services: {repository names, for example `orders-service`}

## Constraints
- {Business, regulatory, contractual, technical, or schedule constraint.}

## Open Questions
- {Question the spec must answer, or none.}

## Source
- Origin: {idea, Jira key, or incident reference}
- Author: {person who described the problem}
```
