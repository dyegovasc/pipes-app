---
title: Format Team Member Record
description: Defines the canonical markdown structure for a .pipes/team role file.
version: 1.1
fragment_type: output
domain: all
---
# Fragment: Format Team Member Record

Defines the canonical markdown structure for a `.pipes/team/` role file.

## Format

Use frontmatter followed directly by second-level sections. Keep the role title in frontmatter only; begin the body with `## Mission`. The body sections should be easy for the existing team parser to read and edit.

## Template

```markdown
---
title: {Title}
description: The `{role-id}` is {one_sentence_mission}
version: 1.0
role: {role-id}
---
## Mission

The `{role-id}` is {one_sentence_mission}

## Scope

{scope_and_ownership_boundaries}

## Responsibilities

- {responsibility}
- {responsibility}
- {responsibility}

## Non-Goals

- {non_goal}
- {non_goal}

## Inputs Expected

- {input}
- {input}

## Outputs Produced

- {output}
- {output}

## Working Style

{working_style}

## Cross-Team Handoffs

The `{role-id}` typically receives work from:

- `{role-id-or-source}`

The `{role-id}` typically hands off to:

- `{role-id-or-target}`
```

## Example

```markdown
---
title: Data Architect
description: The `data-architect` is the data modeling and storage-boundary specialist for this workspace.
version: 1.0
role: data-architect
---
## Mission

The `data-architect` is the data modeling and storage-boundary specialist for this workspace.
```

## Variables

| Placeholder | Source | Required |
| --- | --- | --- |
| `{role-id}` | Role definition | Yes |
| `{Title}` | Role definition | Yes |
| `{one_sentence_mission}` | Role definition | Yes |
| `{scope_and_ownership_boundaries}` | Role definition | Yes |
| `{responsibility}` | Role definition | Yes |
| `{non_goal}` | Role definition | Yes |
| `{input}` | Role definition | No |
| `{output}` | Role definition | Yes |
| `{working_style}` | Role definition | Yes |
| `{role-id-or-source}` | Handoff definition | No |
| `{role-id-or-target}` | Handoff definition | No |
