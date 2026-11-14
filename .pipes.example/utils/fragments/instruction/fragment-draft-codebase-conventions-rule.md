---
title: Draft Codebase Conventions Rule
description: Drafts a binding codebase-conventions rule using the live Pipes governance schema and repository evidence.
version: 1.2
fragment_type: instruction
domain: codebase
---
# Fragment: Draft Codebase Conventions Rule

## Instructions

1. Derive checks from repository evidence and explicit user-owned convention choices. Do not promote a one-off pattern into a binding rule silently.
2. Use the live rule schema: `rule_type: governance`, an explicit `applies_to` list, `enforcement: binding`, `enforced_by` (include `ci` when the build or linters enforce part of the rule), `skill: true` with a `skill_description` that names when the conventions apply, and the standard `gate_relevance` fields.
3. Remove `starter_status: project_placeholder` only when replacing the starter placeholder with a real configured rule.
4. Use the standard body sections `## Requirement`, `## Enforcement`, and `## Checks`; express each convention as one concrete, testable check.
5. Cover relevant implementation, test, script, record, naming, structure, dependency, and prohibited-pattern behavior without duplicating project or architecture descriptions.
6. In update mode, preserve valid established checks and surface every removal or changed enforcement boundary for approval.
7. Use version `1.0` for a new configured rule or one minor increment for a substantive update.
8. Produce the complete draft and exact target without writing it.

## Output

- Complete governance-schema rule draft
- Evidence source for each material check
- Preserved, added, changed, and proposed-removed checks
- Target path, mode, and proposed version transition
- Any unresolved enforcement or ownership choice
