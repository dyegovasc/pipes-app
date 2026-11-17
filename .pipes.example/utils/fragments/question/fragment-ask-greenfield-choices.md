---
title: Ask Greenfield Choices
description: Captures the stack, conventions, architecture direction, and policies of a repository with no code as declared choices, each with a revisit trigger.
version: 1.0
fragment_type: question
domain: codebase
---
# Fragment: Ask Greenfield Choices

## Question

State that the repository has no code yet, so no setup choice can come from repository evidence. Then ask one question per surface, in this order:

1. Project identity and stack: what the project is, and which runtime, frameworks, storage and infrastructure, test and quality tools, and working commands it will use.
2. Conventions: which implementation rules every change must follow.
3. Architecture direction: the planned components, workflows, data and state, and integrations.
4. Policies: which policy topics to declare now, or whether the policy owner defers them.

## Guidance

- Recommend an answer only from what the user already stated in this conversation or in a linked record.
- Never present a choice as detected, observed, or current. Each answer is a declared choice.
- A choice that the user does not state or accept stays open; do not fill it with a default.
- Accept "defer" only for policies, and only from the policy owner (the holder of gate G6 for policy rules). Every other surface needs a declared answer.
- For each surface, capture a revisit trigger. Offer the default "the first merged change that adds source code or a dependency manifest".
- Do not offer the delivery profile; `pipeline-define-codebase-stack` owns it.

## Capture

- `declared_identity`: project name, summary, and repository role
- `declared_stack`: runtime, frameworks, storage and infrastructure, test and quality tools, and working commands
- `declared_conventions`: binding implementation rules
- `declared_architecture`: components, workflows, data and state, and integrations
- `declared_policies`: one entry per policy topic, or `policy_deferral` with the policy owner, the date, and the revisit trigger
- `revisit_triggers`: one trigger per surface
- `statement_sources`: the user's words that each choice comes from
- `open_choices`: choices that are not stated or accepted yet
