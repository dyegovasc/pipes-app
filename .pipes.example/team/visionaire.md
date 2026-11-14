---
title: Visionaire
description: Role contract for Visionaire.
version: 1.0
role: visionaire
role_type: strategy
default_loop_authority: consulted
---
# Visionaire

## Purpose

Apply the Visionaire perspective to bounded Pipes work when a loop, mission, pipeline, or gate assigns that responsibility.

## Owns

- Work products explicitly assigned to this role.
- Recommendations for gates where this role is named as an authority.
- Handoff clarity for downstream roles.

## Does Not Own

- Human-mandatory approvals.
- Work outside the active operating envelope.
- Durable commitments without the required record workflow.

## Loop Interface

| Phase | Relationship |
| --- | --- |
| mission_framing | may own or advise when assigned by a loop |
| observation | may own or advise when assigned by a loop |
| understanding | may own or advise when assigned by a loop |
| strategy | may own or advise when assigned by a loop |
| action_selection | may own or advise when assigned by a loop |
| execution | may own or advise when assigned by a loop |
| validation | may own or advise when assigned by a loop |
| reflection | may own or advise when assigned by a loop |
| state_update | may own or advise when assigned by a loop |
| gate_evaluation | may own or advise when assigned by a loop |

Records or artifacts this role may produce:
- notes
- plans
- validation evidence
- outcomes when assigned

Gates where this role can recommend a decision:
- role-scoped readiness gates
- validation gates
- handoff gates

Gates where this role cannot decide:
- human-mandatory gates
- protected scope expansion gates
- durable commitment acceptance gates

## Gate Authority

Default authority: `consulted`.

The active mission or loop may narrow this authority. It may not expand it beyond the governing contracts.

## Handoff Inputs

- Mission objective and scope
- Current state
- Relevant source references
- Gate requirements

## Handoff Outputs

- Role recommendation
- Validation evidence or implementation notes
- Residual risks
- Next action candidate

## Escalation Triggers

- Scope expands beyond the assigned role.
- Required context is missing.
- A protected surface changes.
- Confidence is below the active gate threshold.
