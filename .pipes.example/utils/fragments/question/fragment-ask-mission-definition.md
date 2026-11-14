---
title: Ask Mission Definition
description: Captures only the material information missing from a new mission frame.
version: 2.6
fragment_type: question
domain: project
---
# Fragment: Ask Mission Definition

## Question

Adapt the conversation to the context already available. Do not combine intent discovery and collaboration selection into one questionnaire.

For a zero-context invocation, first explain: "I will help frame the outcome, boundaries, and completion evidence, then ask how often you want to be involved during later execution. This process creates a draft mission only; it does not start execution." Then ask one open question before discussing scope or collaboration: "What would you like this mission to accomplish? Describe the result in your own words; you do not need to define scope, implementation, or acceptance criteria yet."

For a contextual invocation, infer the objective, in-scope and out-of-scope boundaries, observable validation evidence, and assumptions from the request and project context. Do not ask the user to repeat information already supplied.

For either route, present an agent-authored frame containing Objective, In scope, Out of scope, Done when, and Assumptions. Ask "Is anything materially wrong or missing?" and ask a narrower follow-up only when the answer would materially change objective, scope, authority, relationships, validation, or loop fit.

Only after intent is concrete and confirmed, explain: "Human intervention controls collaboration cadence. It does not remove mandatory approvals, protected-action approvals, or the separate mission-execution approval." Present exactly these choices and wait for one explicit user selection:

- `less` — map to `delegated_until_escalation`; delegate routine decisions and pause at mandatory gates or declared escalation boundaries.
- `context-dependent` — map to `mixed`; continue routine bounded work and pause at additional agreed checkpoints plus every mandatory gate.
- `more` — map to `user_mediated`; return before meaningful branching decisions and protected actions as well as mandatory gates.

Invite a free-form collaboration preference, but map it to the closest supported choice and ask the user to confirm that mapping explicitly before continuing. If `context-dependent` is selected, ask which additional checkpoints should trigger a pause and record the agreed checkpoints before the collaboration brief is complete.

A previously stated preference may be shown as context but does not select the level for a new mission. Do not default or infer the selection from task size, risk, scope detail, selected loop, prior missions, protected actions, or the agent's preferred safety posture.

Do not ask for a delivery approach during intent or collaboration capture. After the frame and intervention mapping are confirmed, loop selection and `fragment-decompose-mission-scope` provide the theme classifications and pipeline-capability evidence needed for an informed delivery choice.

## Capture

- Objective
- In-scope and out-of-scope boundaries
- Assumptions and material corrections or gaps
- Constraints and protected actions
- Observable validation
- Explicit user-selected human-intervention level, confirmation, and its mapped existing autonomy profile
- Confirmation of any free-form preference mapping
- Additional agreed checkpoints for `context-dependent`, or none for another selection
- Delegated authority, user authority, and human-mandatory boundaries
- Zero or more related project-relative paths
- Optional preferred loop
- Confirmed mission frame ready for loop selection and delivery decomposition
