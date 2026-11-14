---
title: Record Versioning
description: Uses one simple semantic version for substantive Markdown record changes.
version: 2.2
rule_type: record
enforcement: binding
enforced_by: [model]
---
# Rule: Record Versioning

## Requirement

Bump frontmatter `version` once when an existing record's durable meaning or contract changes.

## Checks

- Increment the minor number for substantive content, scope, authority, behavior, decision, plan, outcome, mission, rule, fragment, pipeline, loop, role, or instruction changes.
- A mission update that changes durable Current State, Gates, Validation, Next Actions, or status is a substantive record edit.
- Do not bump for formatting-only changes, regenerated catalogs and wrappers, or automatic reciprocal relationship maintenance.
- HTML human edits follow the selection-session version policy. Controlled regeneration preserves the existing version unless an approved metadata effect changes it. Apply `rule-artifact-record-contract`.
- Apply one bump per coherent edit, not one per changed line.
- If a version is missing or malformed, repair it visibly before continuing.
