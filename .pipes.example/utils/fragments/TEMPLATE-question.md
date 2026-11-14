---
title: "{Question Title}"
description: "{One-sentence description of the information this fragment gathers.}"
version: 1.0
fragment_type: question
domain: "{all-or-domain-name}"
---
{One-sentence description of the information this fragment gathers.}

## Question

{Ask one concise question whose answer materially changes the result.}

## Options

- `{option-id}`: "{Short user-facing option label and consequence.}"
- `{option-id}`: "{Short user-facing option label and consequence.}"

## Guidelines

- {Explain the decision boundary or information needed.}
- {State a recommended option when a safe default exists.}
- {Omit options when free-form input is required.}

## Capture

- `{field}`: {Value to retain from the response.}
- `{field}`: {Decision, correction, or constraint to retain.}

## Validation

- {Constraint on a valid answer.}
- {Condition that requires the question to be asked again.}

## Atomicity

Keep this fragment focused on one material information gap. Do not use it for discoverable facts or a sequence of unrelated decisions.
