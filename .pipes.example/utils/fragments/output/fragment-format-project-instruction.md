---
title: Format Project Instruction
description: Defines the canonical markdown structure for `.pipes/ai-instructions/project.md`.
version: 1.3
fragment_type: output
domain: codebase
---
# Fragment: Format Project Instruction

Defines the canonical markdown structure for `.pipes/ai-instructions/project.md`.

## Format

Use the live inline-instruction schema: frontmatter, a concise identity and ownership summary, `## Stack`, and `## Architecture`. Keep the project title in frontmatter only; begin the body with the identity summary rather than a repeated heading. Preserve established content in update mode and omit unsupported placeholders.

## Template

```markdown
---
title: {project_name}
description: {one_sentence_project_summary}
version: {semantic_version}
assembly: inline
always_on_line_budget: {optional maximum line count of the generated always-on instruction block}
---
{one_to_three_sentence_project_description_including_repository_role_and_boundaries}

## Stack

| Layer | Technology |
| --- | --- |
| Project type | {project_type} |
| Primary runtime | {language_runtime} |
| Key frameworks | {frameworks_libraries} |
| Storage and infrastructure | {storage_infrastructure} |
| Test and quality tools | {test_quality_tools} |
| Working commands | {working_commands} |

## Architecture

{repository_structure_ownership_and_artifact_boundaries}

For deeper system workflows, state, components, and integrations, use `.pipes/ai-instructions/architecture.md`.
```

## Variables

| Placeholder | Source | Required |
| --- | --- | --- |
| `{project_name}` | Repository evidence or confirmed identity | Yes |
| `{one_sentence_project_summary}` | Evidence-backed project identity | Yes |
| `{semantic_version}` | Create or update mode | Yes |
| `{one_to_three_sentence_project_description_including_repository_role_and_boundaries}` | Evidence and confirmed boundaries | Yes |
| `{project_type}` | Repository evidence or confirmed intent | Yes |
| `{language_runtime}` | Repository evidence | Yes |
| `{frameworks_libraries}` | Repository evidence | No |
| `{storage_infrastructure}` | Repository evidence | No |
| `{test_quality_tools}` | Repository evidence | No |
| `{working_commands}` | Repository evidence | No |
| `{repository_structure_ownership_and_artifact_boundaries}` | Repository evidence and confirmed boundaries | Yes |
