---
title: Confirm Acceptance Criteria
description: Confirms final acceptance criteria, blockers, and execution preconditions before plan generation.
version: 1.1
fragment_type: question
domain: codebase
---
# Fragment: Confirm Acceptance Criteria

Confirms final acceptance criteria, blockers, and execution preconditions before the plan artifact is generated.

## Question
Please review the acceptance criteria, blockers, and verified preconditions captured so far. What needs to change before the plan is finalized?

## Guidelines

- Confirm that the success criteria are still correct after Design.
- Call out any blocker that would prevent safe implementation.
- Confirm that every input, dependency, target, and acceptance fact needed for execution is verified.
- If nothing needs to change, say that the criteria and preconditions are correct as written.

## Capture

- `confirmed_success_criteria`: final acceptance criteria approved by the user
- `acceptance_criteria_changes`: requested changes, if any
- `execution_preconditions`: verified facts required before execution
- `blocking_feedback`: blockers or unresolved concerns raised by the user
