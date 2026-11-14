---
title: Check Existing Codebase Files
description: Resolves execution context and classifies existing project identity and convention contracts before drafting.
version: 1.2
fragment_type: instruction
domain: codebase
---
# Fragment: Check Existing Codebase Files

## Instructions

1. Resolve `execution_context` before selecting targets:
   - `installed_project`: the editable contracts are under canonical `.pipes/`.
   - `starter_maintenance`: `.pipes-v2/` is the staged source and `.pipes/` is the installed mirror reconciled only after staged validation.
2. Resolve exact paths for that context: the project instruction, delivery profile (`delivery.md`), accountability matrix (`accountability.md`), architecture instruction, conventions rule, and project policy rules (rules with `scope: project` or `skill: true`). Do not redirect an installed-project write to a sibling staging tree merely because one exists.
3. Read every existing target completely and classify it independently as `missing`, `placeholder`, or `established`.
4. Extract valid identity, stack, repository-boundary, command, requirement, enforcement, and check content that update mode must preserve.
5. Record current semantic versions, frontmatter fields, generated wrapper targets, and any unmanaged or conflicting content.
6. Inspect repository-owned evidence needed to determine whether apparent gaps are real before classifying them as user questions.
7. Set the overall mode to `create`, `update`, or `mixed`; do not modify a file or wrapper during discovery.

## Inputs

- Project root, active mission or request, and available staged and installed roots
- Current project instruction, delivery profile, accountability matrix, architecture instruction, conventions rule, policy rules, wrappers, and repository evidence

## Output

- `execution_context`: `installed_project` | `starter_maintenance`
- `mode`: `create` | `update` | `mixed`
- `project_instruction_target` and `conventions_rule_target`
- `installed_mirror_targets`: starter-maintenance mirrors, otherwise empty
- `existing_contents`: complete text or `null` for each target
- `target_classifications`: `missing` | `placeholder` | `established`
- `preserved_commitments`: valid content that cannot change silently
- `current_versions`: existing semantic versions or `null`
- `repository_evidence` and `remaining_user_owned_questions`
- `wrappers_to_refresh` and any target conflict
