---
title: Ask Gate Holders
description: Asks who holds each human role that decides a delivery gate, with evidence-based defaults.
version: 1.0
fragment_type: question
domain: project
---
# Fragment: Ask Gate Holders

Asks who holds each human role that decides a delivery gate.

## Question
Who decides each delivery gate, and where is each holder recorded?

## Guidelines
- Propose a default for every role from evidence before asking: `CODEOWNERS` teams for the code owner, GitHub environment reviewers for releases, and the session user otherwise
- The gates are G1 intent, G2 spec, G3 plan, G4 pull request, G5 release or promotion, G6 agent configuration, and G7 incident triage
- Ask for names or teams only when the user wants them recorded; a role with no named holder falls back to the session user
- Say that the agent never holds a gate role and that one person may hold several roles, in which case a non-author reviewer pass is mandatory

## Capture
- `product_owner`
- `engineer`
- `tech_lead`
- `code_owner_source`
- `release_approver_source`
- `policy_owner`
- `service_owner`

## Validation
- Every gate G1 to G7 has a deciding role and a holder source
- No gate names an agent or a persona as its decider
