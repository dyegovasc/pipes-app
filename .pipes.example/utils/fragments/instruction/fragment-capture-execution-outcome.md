---
title: Capture Execution Outcome
description: Classifies what happened and records evidence, deviations, residual risk, and follow-up.
version: 2.3
fragment_type: instruction
domain: project
---
# Fragment: Capture Execution Outcome

## Instructions

1. Compare changed files, artifacts, and checks with acceptance criteria.
2. Classify a terminal result as `succeeded`, `partial`, `failed`, or `cancelled`; keep resumable work `active` or `blocked` instead.
3. Record what changed, validation performed, deviations, residual risk, and follow-up in factual language.
4. Require real-surface evidence before claiming success for a visible output.
5. For a terminal recorded plan or mission, require exactly one durable outcome and inspect its existing `related` paths and candidate outcome records before proposing a new one; reuse exactly one matching outcome when it is validated and already represents this closure, and stop on multiple or contradictory matches.
6. Keep source ownership distinct: a plan outcome records plan execution and cannot substitute for the separate outcome required to close a recorded mission.
7. For approved inline plan content without a source plan record, report plan lifecycle and mandatory plan outcome as `not_applicable`; recommend a durable outcome only when a separate request and authority own it.
8. When an outcome closes a recorded mission or plan, require approved bidirectional `related` links, verify both persisted records, and do not use a mission-specific or plan-specific outcome field.

## Output

- Result classification
- Existing related outcome match or need for a new outcome
- Factual summary and changed paths
- Validation evidence
- Deviations, residual risk, and follow-up
