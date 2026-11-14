---
title: Assess Decision Durability
description: Evaluates whether the proposed decision is durable enough to record and determines whether it overlaps with or supersedes existing decision records.
version: 1.1
fragment_type: instruction
domain: project
---
# Fragment: Assess Decision Durability

Evaluates whether the proposed decision is durable enough to record and determines whether it overlaps with or supersedes existing decision records.

## Instructions

1. Read the approved decision statement from the prior phase.
2. Review existing decision records in `.pipes/project/05-decisions/`.
3. Check whether the proposed decision:
   - duplicates an existing accepted record
   - refines or replaces an existing accepted record
   - is too temporary or implementation-specific for a durable record
   - needs to remain `proposed` rather than `accepted`
4. Summarize whether the decision should be recorded and with which state.
5. Separate hard duplication or supersession findings from soft suggestions.

## Output

- `decision_recordability`: `record` | `do_not_record` | `duplicate` | `supersedes_existing`
- `durability_notes`
- `overlap_notes`
- `recommended_state`
- `superseded_records`
