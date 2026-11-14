---
title: Create Mission File
description: Writes one approved draft mission record and stops without invoking its selected loop.
version: 2.7
fragment_type: instruction
domain: project
---
# Fragment: Create Mission File

## Instructions

1. Confirm one approval covers only the displayed content, filename, loop, and write; it does not cover execution.
2. Read `.pipes/project/03-missions/config.md`.
3. Scan `mission-*.md` filenames and choose the next available zero-padded number with a short kebab-case slug.
4. If the target exists, compare it with the approved preview and stop rather than overwriting different content.
5. Before writing, verify `related` is a YAML list: use `[]` when no paths apply, otherwise use only unique readable project-relative paths.
6. Write the approved Markdown and re-read it.
7. Verify `status: draft`, frontmatter-only title, required body sections, one selected loop ID that resolves to an installed loop, a supported non-terminal phase, a complete intervention-to-autonomy mapping, readable delegated and user authority, active workflow, pending gate, resume trigger, validation target, a useful post-approval Next Action, every Journal heading uses `YYYY-MM-DD hh:mm:ss`, a persisted `related` value that meets the related-metadata contract, and no more than 300 physical lines before `## Journal`. Exclude the Journal heading and content from that quota.
8. Verify `## Delivery` preserves the approved ordered themes, dependencies, affected contract families, planning classifications, selected-loop capability evidence, delivery approach, current theme, and route without implementation-plan detail.
9. Report that execution has not started. Do not invoke the selected loop, a planning or execution pipeline, run supporting scripts, or create related records automatically.

## Output

- Mission path
- Selected loop
- Delivery approach, current theme, and post-approval route
- First action after future execution approval
- Readability and config validation
- Explicit `execution_not_started` result
