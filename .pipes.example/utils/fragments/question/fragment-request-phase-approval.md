---
title: Request Phase Approval
description: Requests approval from the active gate authority before the pipeline advances to the next phase.
version: 1.5
fragment_type: question
domain: all
---
# Fragment: Request Phase Approval

Requests approval from the active gate authority before the pipeline advances to the next phase.

Invoke this fragment only when the current pipeline phase declares an approval gate. Do not create a gate for routine observations, repeat approval already captured for identical content, or ask the user when another declared authority owns the gate.

When the phase output contains Markdown that may be written or generated, validate that exact payload against `rule-pure-markdown-writing` before requesting approval. A raw HTML finding blocks approval until corrected.

## Question
Do you approve this phase output and want to continue to the next phase?

When running outside an active mission, the active gate authority is the user. When running inside an active mission, resolve the active gate authority from the mission's recorded intervention-to-autonomy mapping, delegated and user authority, loop gate contract, and pipeline gate. Ask the user only when the resulting gate is user-mediated, human-escalated, or human-mandatory; human-mandatory always belongs to the user.

Before pausing an active mission, record the active workflow, gate subject and type, deciding authority, pending status, invalidation conditions, exact resume trigger, and next action. For a draft-plan review, tell the user that the draft is ready for revision, invite iteration until it is implementation-ready, and state that the active mission will resume afterward.

## Summary to Display
- Current phase name
- Short summary of what was produced
- Next phase name
- Active gate authority
- Any unresolved notes that will carry forward
- Exact resume action after approval
- Pure-Markdown validation result for any Markdown payload

## Options
- `approve_phase`: "Approve and continue"
- `request_changes`: "Request changes"

## Capture

- **phase_approval_status**: Whether the active gate authority approved the phase output or requested changes.
- **approval_authority**: The authority that approved or rejected the phase output.
- **approved_phase_output**: The phase output approved by the active gate authority.
- **requested_changes**: Any corrections required before the pipeline can advance.
- **next_phase**: The next phase to run after approval.
- **pure_markdown_validation**: Passed validation for the exact Markdown phase output or a blocking finding.

## If Approved
Record a compact decision receipt with subject and gate type, decision, deciding authority, mission version, invalidation conditions, and exact resume action. Proceed to the next pipeline phase and then return to the active mission without requiring another pipeline command when this is an immediate, still-valid continuation.

## If Changes Requested
Return to the current phase, apply corrections, and present the updated output again.
