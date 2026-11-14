---
title: Gate Evaluation
description: Decides whether the loop should continue or stop at a consequential boundary.
version: 2.2
fragment_type: instruction
domain: project
---
# Fragment: Gate Evaluation

## Instructions

1. Check external permissions, binding rules, mission scope, loop protections, the mission's recorded autonomy profile and human-intervention level, and any active pipeline gate. The strictest applicable authority wins.
2. Resolve `less`, `more`, and `context-dependent` intervention through the existing `delegated_until_escalation`, `user_mediated`, and `mixed` profiles. The preference may narrow authority but may never widen it; a human-mandatory gate always belongs to the user.
3. Continue automatically when the next action is safe, in scope, and already authorized. When a delegated gate is satisfied inside an active mission, record its compact decision receipt, update the active workflow and resume trigger, and continue with the exact resume action.
4. Stop for the user only for a material choice, protected action, explicit human gate, or profile-defined escalation. Before stopping, make the pending gate readable by recording its subject, gate type, deciding authority, status, invalidation conditions, and exact resume action.
5. After the user decides an immediate pending gate, record the compact decision receipt and resume the active mission directly when the decision remains valid. Do not require a separate execute-plan or execute-mission invocation for that immediate continuation.
6. Treat a cold or stale resume as a new readiness boundary: re-read current records and evidence, verify the decision is still valid, and obtain any approval required by the active authority contract.
7. Mark blocked only when no meaningful progress is possible without changed input, authority, or external state.
8. Mark a recorded mission `done` only when objective and validation conditions are satisfied and exactly one approved, validated related outcome with reciprocal `related` paths has been written and verified through the terminal closure package.

## Output

- Continue, ask, blocked, or done
- Reason and required authority
- Next action when continuing
