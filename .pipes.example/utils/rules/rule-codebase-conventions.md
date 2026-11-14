---
title: Codebase Conventions
description: Setup-required project rule that binds implementation work to the repository's actual stack, architecture, and local conventions.
version: 1.2
starter_status: project_placeholder
rule_type: governance
applies_to:
  - scripts
  - records
  - fragments
enforcement: binding
enforced_by: [model, ci]
gate_relevance:
  evaluates_gates: false
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Codebase Conventions

## Requirement

Project-specific implementation work must follow the repository conventions captured in `.pipes/ai-instructions/project.md` and this rule once it has been customized by `pipeline-define-codebase-stack`.

## Enforcement

`binding`

## Checks

- Read project identity and architecture instructions before making repository-specific changes.
- Prefer existing local patterns, helpers, directories, naming, test style, and ownership boundaries over new abstractions.
- Keep framework maintenance edits separate from application implementation edits unless the active plan or mission explicitly combines them.
- Treat placeholder conventions as incomplete setup state and run or recommend `pipeline-define-codebase-stack` before relying on them.
- Surface contradictions between the requested change and project conventions before writing broad or irreversible changes.
