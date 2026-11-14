---
title: Create Intent File
description: Writes an approved intent record without accepting it or creating downstream work automatically.
version: 3.2
fragment_type: instruction
domain: project
---
# Fragment: Create Intent File

## Instructions

1. Confirm the exact intent record and target path are approved.
2. Read `.pipes/project/01-intents/config.md`.
3. Choose the next available `intent-{number}-{slug}.md` filename and stop if it conflicts with different existing content.
4. Validate the problem, proposed outcome, success checks under How Do We Know It Works (up to 5 known checks, or the none-known line with open questions), affected users and systems, constraints, open questions, source, and related paths.
5. Write `status: draft` unless the product owner for gate G1 explicitly accepted or rejected the intent in this interaction; record that decision as the status and never infer it from file approval.
6. Before writing, verify `related` is a YAML list: use `[]` when no paths apply, otherwise use only unique readable project-relative paths.
7. Write and re-read the file. Verify the persisted `related` value still meets that contract. Do not create specs, missions, or plans automatically.

## Output

- Intent path and status
- Config and content validation
- Proposed next action, normally `pipeline-design-spec` after acceptance
