---
title: Capture Eval Source
description: Captures the behavior an eval case must prove and the evidence it comes from.
version: 1.0
fragment_type: question
domain: framework
---
# Fragment: Capture Eval Source

Captures the behavior an eval case must prove and the evidence it comes from.

## Question
Which agent behavior should an eval case prove, and where did the need come from?

## Guidelines
- Start from evidence: an issue in `.pipes/utils/issues/`, a production incident, a repeated agent mistake, a correction in `corrections.md`, or a new or changed contract
- State the expected behavior as something a check can observe in files, the record validator, git state, tool calls, or tool results
- Prefer one behavior per case
- Name the files the agent may change during the task
- Check existing cases in `.pipes/utils/scripts/fixtures/evals/` for one that already covers the behavior

## Capture
- `source`
- `expected_behavior`
- `task_prompt`
- `setup_files`
- `may_change`
- `observable_checks`
- `preferred_id`

## Validation
- The expected behavior is observable without reading the agent's private reasoning
- The case does not duplicate an existing case
