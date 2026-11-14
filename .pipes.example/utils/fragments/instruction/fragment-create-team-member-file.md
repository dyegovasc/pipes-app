---
title: Create Team Member File
description: Creates an approved team member role file in the exact installed or starter-maintenance targets.
version: 1.1
fragment_type: instruction
domain: all
---
# Fragment: Create Team Member File

Creates an approved team member role file in the exact targets for the resolved execution context.

## Instructions

1. **Verify approval:** Confirm the exact formatted role, role id, execution context, complete target set, and write order were approved.
2. **Verify execution context:** Require `installed_project` or `starter_maintenance`; stop when the invocation and repository identity do not resolve exactly one context.
3. **Resolve exact targets:** In `installed_project`, target only `.pipes/team/{role-id}.md`. In `starter_maintenance`, target `.pipes-v2/team/{role-id}.md` first and its equivalent `.pipes/team/{role-id}.md` mirror second.
4. **Verify role id:** Ensure the role id is lowercase kebab-case and matches the frontmatter `role` value.
5. **Classify current effects:** Re-read every target immediately before writing. Treat an absent target as `not_started`, exact approved content as `already_matches`, and different content as a blocking conflict; never overwrite different or unmanaged content under creation approval.
6. **Write by context:** In `installed_project`, create only the canonical `.pipes/` target. In `starter_maintenance`, create or reuse the staged `.pipes-v2/` target, validate it, then create or reuse the exact installed `.pipes/` mirror.
7. **Validate results:** Re-read every written or reused target; verify frontmatter, required role sections, exact content equivalence, approved paths, and pure Markdown. Installed generated outputs must not contain `.pipes-v2/` paths.
8. **Confirm result:** Report execution context, created and reused paths, validation evidence, conflicts, and the role id without implying that an agent was spawned.

## Inputs

- Approved role id
- Approved team member markdown
- `execution_context`: `installed_project` | `starter_maintenance`
- Approved target set and write order
- Current `.pipes-v2/team/` and `.pipes/team/` targets when applicable

## Output

- `execution_context`: `installed_project` | `starter_maintenance`
- `target_paths` and `write_order`
- `created_paths`, `reused_paths`, and blocking conflicts
- Validation evidence and confirmation of the role id and paths
