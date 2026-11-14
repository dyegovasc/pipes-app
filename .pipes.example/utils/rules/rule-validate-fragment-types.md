---
title: Validate Fragment Types
description: Enforces fragment frontmatter, directory, naming, and required-section contracts before reuse.
version: 1.3
rule_type: validation
applies_to:
  - fragments
enforcement: binding
enforced_by: [model]
gate_relevance:
  evaluates_gates: true
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Validate Fragment Types

## Requirement

Every fragment must match its declared fragment type, directory, frontmatter, and required section contract before it can be used by a pipeline or loop.

## Enforcement

`binding`

## Checks

- Fragment files live under `.pipes/utils/fragments/{type}/`.
- Filenames use `fragment-{id}.md`.
- Frontmatter includes `title`, `description`, `version`, `fragment_type`, and `domain`.
- `fragment_type` matches the containing directory.
- Required sections are present:
  - context: `## Background`, `## Structure`
  - instruction: `## Instructions`, `## Output`
  - validation: `## Checks`, `## Acceptance Criteria`
  - output: `## Format`, `## Template`
  - question: `## Question`, `## Capture`
- A fragment remains atomic: it should not embed a full multi-phase workflow that belongs in a pipeline.
