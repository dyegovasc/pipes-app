---
title: Auto Update Catalog
description: Requires the generated fragment, pipeline, loop, and rule catalog to match the live starter-kit inventory.
version: 1.4
rule_type: record
applies_to:
  - fragments
  - pipelines
  - rules
  - loops
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
# Rule: Auto Update Catalog

## Requirement

Whenever a fragment, pipeline, rule, or loop is created, modified, renamed, or deleted, update `.pipes/utils/fragments/CATALOG.md` before classifying the work as complete.

## Enforcement

`binding`

## Checks

- The catalog fragment count matches the live `fragment-*.md` inventory.
- The catalog pipeline count matches the live `pipeline-*.md` inventory.
- The catalog loop count matches the live `loop-*.md` inventory.
- The catalog rule count matches the live `rule-*.md` inventory.
- New or renamed fragments appear under the correct fragment type section.
- New or renamed pipelines appear in the pipeline section with title, category, domain, and description.
- New or renamed loops and rules appear in their generated inventory sections.
- Removed fragments or pipelines no longer appear as active catalog rows.
- Catalog edits are treated as generated support work and do not replace the source files as the system of record.
