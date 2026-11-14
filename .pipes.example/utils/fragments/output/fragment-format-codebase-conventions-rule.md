---
title: Format Codebase Conventions Rule
description: Template for formatting the codebase conventions rule with the shared rule frontmatter schema.
version: 1.3
fragment_type: output
domain: codebase
---

# Fragment: Format Codebase Conventions Rule

## Format

Use the live binding-rule schema. A configured rule removes the starter-only `starter_status: project_placeholder` field and keeps project descriptions in `project.md` rather than duplicating them here. Keep the title in frontmatter only; begin the body with `## Requirement`.

## Template

```markdown
---
title: Codebase Conventions
description: Binding implementation conventions for {project_name}.
version: {semantic_version}
rule_type: governance
applies_to:
  - implementation
  - tests
  - scripts
  - records
enforcement: binding
enforced_by: [model, ci]
skill: true
skill_description: Codebase conventions for {project_name}. Use when designing, planning, implementing, or reviewing a change in this codebase.
gate_relevance:
  evaluates_gates: false
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
## Requirement

Implementation work must follow the established stack, structure, commands, quality checks, and local conventions recorded for {project_name}.

## Enforcement

`binding`

## Checks

- {one concrete evidence-backed convention}
- {one concrete evidence-backed convention}
- {one prohibited pattern with its approved alternative when applicable}
```

- Use `1.0` for a new configured rule and increment the current minor version once for a substantive update.
- Keep each check concise, binding, and supported by repository evidence or an explicit approved convention.
- Preserve established checks unless their exact removal is approved.
- Do not retain placeholder metadata after configuration.
