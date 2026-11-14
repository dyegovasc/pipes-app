---
title: Frontmatter-Only Title
description: Requires every Pipes-generated project record, AI instruction, and project-configured rule to keep its title solely in frontmatter, with no restated title in the body.
version: 1.2
rule_type: record
applies_to:
  - records
  - ai_instructions
  - rules
enforcement: binding
enforced_by: [model]
gate_relevance:
  evaluates_gates: false
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Frontmatter-Only Title

## Requirement

Every project record, inline AI instruction, or project-configured rule that a Pipes canonical output fragment generates carries its title once, in frontmatter `title` only. The body must not restate that title as a heading, a labeled section, or an inline echo of the same text.

This governs Pipes-generated project artifacts: records under `.pipes/project/`, `.pipes/ai-instructions/project.md` and `architecture.md`, and project-configured rules such as `rule-codebase-conventions.md` and a defined codebase-stack rule. It does not require rewriting the framework's own hand-authored fragment, pipeline, loop, and rule definition files, whose `# Fragment: X` / `# Pipeline: X` / `# Loop: X` / `# Rule: X` body heading is a separate, established starter-kit navigation convention.

## Enforcement

`binding`

## Checks

- This frontmatter rule applies to Markdown. HTML uses `pipes:title` under `rule-artifact-record-contract`; its standard title element and visible presentation remain separate.

- Every `fragment-format-*` output-fragment template that formats a project record, AI instruction, or project-configured rule begins its body with the record's first substantive section (for example `## Objective`, `## Context`, `## Outcome`, `## Goal Connection`, `## Stack`) instead of a heading or line that restates the frontmatter `title` value.
- A body may keep a static, kind-describing section label (for example `## Stack`, `## Tech Stack`) as long as it does not repeat the specific title value from frontmatter.
- Apply this check when formatting a preview, writing a new file, and regenerating a canonical instruction, rule, or wrapper.
- Correct an existing generated file found to restate its title in the body within the current change's scope; do not defer it as unrelated drift once discovered.
- Do not apply this rule to the framework's own hand-authored fragment, pipeline, loop, and rule definition files' internal `# {Type}: {Title}` heading.
