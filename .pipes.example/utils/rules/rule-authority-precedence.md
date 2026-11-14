---
title: Authority Precedence
description: Applies the strictest relevant permission, rule, loop, pipeline, and user gate.
version: 2.3
rule_type: governance
enforcement: binding
enforced_by: [model]
---
# Rule: Authority Precedence

## Requirement

An action is allowed only when it satisfies every applicable authority source. A lower-level framework component may narrow authority but may not widen it.

## Checks

- Apply external permissions and explicit user instructions first.
- Then apply binding safety rules, project instructions, the active loop, and the active pipeline gate.
- Interpret mission intervention through the existing profiles: `less` maps to `delegated_until_escalation`, `more` maps to `user_mediated`, and `context-dependent` maps to `mixed`.
- A mission's intervention preference may narrow authority but may never widen authority supplied by another source.
- Human-mandatory gates are always decided by the user.
- Team roles may recommend; they do not impersonate user authority.
- Material changes to approved scope, inputs, or protected effects require the affected approval to be revisited.
- Recorded-plan activation, blocking, resumption, outcome relationships, and terminal closure must satisfy their named execution or resume authority; plan-content approval alone cannot authorize them.
- Continue without ceremony when the action is already in scope and authorized.
