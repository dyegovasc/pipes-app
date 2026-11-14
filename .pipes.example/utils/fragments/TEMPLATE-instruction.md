---
title: "{Instruction Title}"
description: "{One-sentence description of the bounded action this fragment directs.}"
version: 1.0
fragment_type: instruction
domain: "{all-or-domain-name}"
---
{One-sentence description of the bounded action this fragment directs.}

## Instructions

1. {Perform the first concrete step.}
2. {Perform the next concrete step.}
3. {Verify or hand off the result.}

## Inputs

- `{input}`: {Required source or value.}
- `{input}`: {Optional source or value.}

## Output

- `{deliverable}`: {Observable result produced by this instruction.}
- `{evidence}`: {Evidence that the action completed correctly.}

## Next Step

{Name the next fragment or handoff only when the surrounding workflow requires one.}

## Atomicity

Keep this fragment focused on one reusable action. Route multi-phase sequencing and approval orchestration to a pipeline.
