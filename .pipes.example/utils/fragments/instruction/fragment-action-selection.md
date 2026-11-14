---
title: Action Selection
description: Chooses the next bounded action that safely advances the mission.
version: 2.0
fragment_type: instruction
domain: project
---
# Fragment: Action Selection

## Instructions

1. Choose the smallest coherent action that advances the selected strategy.
2. Confirm it fits scope, the active loop, applicable rules, and current authority.
3. If a paused pipeline is still relevant, continue its first incomplete phase after checking actual state.
4. Name the evidence that will show whether the action worked.
5. Escalate only when the action requires a genuine user decision, a protected effect, or authority not already granted.

## Output

- Next action
- Expected evidence
- Applicable gate or none
- Follow-on action if successful
