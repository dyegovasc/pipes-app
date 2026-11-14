---
title: Ask Team Member Definition
description: Gathers the fields needed to define a reusable AI team role.
version: 1.0
fragment_type: question
domain: all
---
# Fragment: Ask Team Member Definition

Gathers the fields needed to define a reusable AI team role.

## Question

What team member role should be added to `.pipes/team/`?

## Guidelines

- Use a lowercase kebab-case role id, such as `ux-researcher` or `data-architect`.
- Define a durable role, not a one-off task persona.
- Focus on what this role owns, what it produces, and where it hands work off.
- Mention any repositories, product areas, or workflow layers the role should cover.

## Capture

- Role id
- Human-readable title
- One-sentence mission
- Scope and ownership boundaries
- Responsibilities
- Non-goals
- Inputs expected
- Outputs produced
- Working style
- Cross-team handoffs
- Any repository or domain constraints

## Validation

- Role id must be lowercase kebab-case.
- Role must be reusable across more than one task.
- Role must have at least one explicit handoff or collaboration boundary.
