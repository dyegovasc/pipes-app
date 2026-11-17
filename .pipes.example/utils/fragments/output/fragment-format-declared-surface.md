---
title: Format Declared Surface
description: Marks a project surface drafted from declared choices, cites the decision or statement it comes from, and records it in the Declared Setup table of project.md.
version: 1.0
fragment_type: output
domain: codebase
---
# Fragment: Format Declared Surface

## Format

Apply this format to a draft that a base format fragment produced, such as the project instruction, the architecture instruction, the conventions rule, or a policy rule.

- Add the frontmatter fields `basis: declared` and `revisit_when: {trigger}`.
- Remove `starter_status: project_placeholder` and every placeholder title.
- Fill each evidence or source field of the base format with the stack decision record path or with "user statement, {date}".
- In a policy rule, replace the repository paths and the conflicts note in `## Sources` with the decision record path or the statement.
- Write no sentence that states a declared choice as detected, observed, or current.
- Add or update one row per surface in the `## Declared Setup` table of `project.md`.
- A policy deferral is one table row with basis `deferred`, the policy owner, the date, and the revisit trigger. It writes no policy rule.
- Keep the table to one row per surface, because `project.md` is in the always-on instruction block and its line budget applies.

## Template

Frontmatter fields added to each declared surface:

```yaml
basis: declared
revisit_when: {trigger}
```

Section in `project.md`:

```markdown
## Declared Setup

| Surface | Basis | Revisit trigger | Source |
| --- | --- | --- | --- |
| `project.md` | declared | {trigger} | {decision record path or user statement, date} |
| `architecture.md` | declared | {trigger} | {decision record path or user statement, date} |
| `rule-codebase-conventions.md` | declared | {trigger} | {decision record path or user statement, date} |
| `rule-{policy-slug}.md` | declared | {trigger} | {decision record path or user statement, date} |
```

A policy deferral row:

```markdown
| Policies | deferred | {trigger} | {policy owner}, {date} |
```
