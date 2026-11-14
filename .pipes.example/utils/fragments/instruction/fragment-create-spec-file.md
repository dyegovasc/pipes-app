---
title: Create Spec File
description: Selects a canonical spec path and writes only the exact approved spec with a reciprocal link to its intent.
version: 1.0
fragment_type: instruction
domain: project
---
# Fragment: Create Spec File

## Instructions

1. Read `.pipes/project/02-specs/config.md` and scan existing `spec-*.md` filenames before approval is requested.
2. Choose the next available zero-padded `spec-{number}-{slug}.md` target and stop if it conflicts with different existing content.
3. Validate the frontmatter, the intent path in `related`, unique and gap-free requirement IDs, design, constraint coverage, open questions, areas of concern, and risk class.
4. Display the exact spec, target path, and both reciprocal `related` effects: the spec lists its intent, and the intent lists the spec. Confirm that approval covers content, creation, and both relationship effects.
5. Write `status: draft` unless the deciding authority for gate G2 explicitly accepted the spec in this interaction; never infer acceptance from file approval.
6. After approval, write the spec, add the spec path to the intent's `related` list, and re-read both records. Do not report completion for an absent, one-way, or unverifiable relationship.
7. Do not change the intent's status, content, or other fields. Do not create missions or plans automatically.

## Output

- Spec path and status
- Approval scope and creation result
- Config, requirement ID, and content validation
- Verified reciprocal intent relationship
- Proposed next action, normally `pipeline-start-mission` or `pipeline-plan-new-feature` after acceptance
