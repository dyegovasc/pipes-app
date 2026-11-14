---
title: Format Spec Record
description: Formats a spec with numbered requirements, design, constraint coverage, open questions, areas of concern, and risk class.
version: 1.2
fragment_type: output
domain: project
---
# Fragment: Format Spec Record

## Format

Produce a complete preview for `.pipes/project/02-specs/spec-{number}-{slug}.md`. A spec turns one accepted intent into numbered, testable requirements and a design that plans implement and cite.

Keep the spec title in frontmatter only; begin the body with `## Intent`.

Write each requirement on one line as `- **R{n}** {requirement}`. Number requirements from `R1` without gaps. Each requirement is testable and states one behavior or quality, and its acceptance check comes from the intent's `## How Do We Know It Works` section. The requirement statement and its trace together are its acceptance check; do not add a separate acceptance field. End each requirement with its trace: `(intent check {k})`, where `k` is the position of the check in the intent's list, starting at 1, or `(no intent check)` when only the proposed outcome or a constraint needs it. Every intent check is covered by at least one requirement. After the spec is accepted, never renumber, reuse, or silently change a requirement; a changed requirement needs a new spec that supersedes this one.

Include the accepted intent path in `related`. Use `status: draft` for every new spec. Only the deciding authority for gate G2 in the Accountability Matrix in `.pipes/ai-instructions/accountability.md` can set `accepted`; when the risk class is `higher`, the tech lead decides together with the product owner.

Serialize `related` as a YAML list of unique, readable project-relative paths.

## Template

```markdown
---
title: {spec title}
description: {one-line summary of what the spec delivers}
version: 1.0
created: {YYYY-MM-DD}
status: draft
related:
  - .pipes/project/01-intents/{intent file}
---
## Intent
`.pipes/project/01-intents/{intent file}`: {one-line restatement of the proposed outcome}

## Requirements
- **R1** {testable requirement} (intent check 1)
- **R2** {testable requirement} (intent check 2)

## Design
### {service repository name}
- Change: {component, endpoint, event, schema, or data change}
- Contracts: {new or changed API, event, or schema, or none}

### Data And State
{Ownership, persistence, and migration, or none.}

## How Each Constraint Is Met
| Constraint | How the design meets it | Requirements |
| --- | --- | --- |
| {constraint from the intent} | {mechanism} | {R-IDs} |

## Open Questions
- {Question carried from the intent or raised by design, with owner role, or none.}

## Areas Of Concern
| Concern | Owner role | Status |
| --- | --- | --- |
| {security, privacy, compliance, performance, or other concern} | {owner role from the Accountability Matrix} | {open or resolved} |

## Risk Class
{routine or higher}: {reason}
```
