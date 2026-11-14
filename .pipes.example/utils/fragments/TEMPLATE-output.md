---
title: "{Output Title}"
description: "{One-sentence description of the content this fragment formats.}"
version: 1.0
fragment_type: output
domain: "{all-or-domain-name}"
---
{One-sentence description of the content this fragment formats.}

## Format

{Describe the intended Markdown structure, required sections, and concise presentation rules.}

## Template

```markdown
## {Section Title}

{Short prose block or value.}

- {Item}
- {Item}
```

## Example

```markdown
## Validation Summary

All scoped checks passed.

- Unit tests: passed
- Integration tests: passed
```

## Variables

| Placeholder | Source | Required |
| --- | --- | --- |
| `{Section Title}` | {Source fragment or workflow input} | Yes |
| `{Item}` | {Source fragment or workflow input} | Yes |

## Atomicity

Keep this fragment focused on formatting one reusable output. Do not embed workflow decisions, approval logic, or file writes.
