---
title: Ask Delivery Approach
description: Captures an informed spec-driven or adaptive mission delivery choice only when both routes are valid.
version: 1.1
fragment_type: question
domain: project
---
# Fragment: Ask Delivery Approach

## Question

Present the validated mission themes, their `plan-required`, `plan-recommended`, or `direct-capable` classifications, meaningful dependencies, and the selected loop's relevant pipeline capabilities. Explain that `plan-required` requires coverage but not a dedicated plan, `plan-recommended` makes a separate plan optional, and `spec-driven` requires at least one approved, validated plan covering the complete confirmed mission scope with evidence-backed justification for additional plans. Pipeline availability is capability evidence before selection, while the selected persisted route is obligatory; delivery approach does not alter human intervention, autonomy, mandatory gates, or protected-action authority.

Ask the user to choose only when both routes are valid:

- `spec-driven` — create at least one approved, validated implementation plan whose combined coverage spans the complete confirmed mission scope before any plan executes, splitting into additional plans only when delivery evidence justifies it.
- `adaptive` — still plan every `plan-required` theme, while allowing `plan-recommended` and `direct-capable` themes to proceed through bounded loop actions unless later evidence promotes their classification.

Do not invoke this fragment when only one route is valid. Record that route with its evidence-backed rationale instead. If neither route is valid, return to decomposition or loop selection rather than asking the user to approve an unsafe option.

## Capture

- Displayed theme decomposition and selected-loop capability evidence
- Valid delivery approaches
- Explicit selected delivery approach when both are valid
- Evidence-backed single-route selection when only one is valid
- Confirmation that delivery approach does not change intervention or authority
- Classification promotion triggers and unresolved blockers
