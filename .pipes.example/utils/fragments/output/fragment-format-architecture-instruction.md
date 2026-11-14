---
title: Format Architecture Instruction
description: Formats the canonical system architecture instruction with stable sections, factual boundaries, and explicit evolution notes.
version: 1.1
fragment_type: output
domain: codebase
---
# Fragment: Format Architecture Instruction

## Format

Produce the complete content for `.pipes/ai-instructions/architecture.md`. Keep the title in frontmatter only; begin the body with `## System Summary`. Use concise prose, lists, and tables where they make ownership or flow clearer. Do not include pipeline conversation, approval history, or private reasoning.

## Template

```markdown
---
title: System Architecture
description: Canonical system boundaries, workflows, components, state, integrations, and operational constraints for this repository.
version: 1.x
assembly: reference
---
## System Summary
{purpose, users, owned outcome}

## Product Boundaries
### Owned Here
{owned boundaries}

### Delegated Or External
{delegated boundaries}

## Primary Workflows
{ordered end-to-end workflows}

## Components And Responsibilities
| Component | Responsibility | Key Dependencies |
| --- | --- | --- |
{component rows}

## Data And State
{models, stores, ownership, and flow}

## External Integrations
{APIs, events, services, and cross-system contracts}

## Operational Constraints
{deployment, performance, security, compliance, reliability}

## Planned Evolution
{explicitly future or provisional direction}
```

In update mode, increment the semantic version once for a substantive approved change. Preserve `assembly: reference` so wrappers may include architecture only when the tool or project assembly policy selects it.
