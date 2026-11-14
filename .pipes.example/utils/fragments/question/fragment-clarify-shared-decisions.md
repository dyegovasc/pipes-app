---
title: Clarify Shared Decisions
description: Asks only the remaining high-impact questions that still matter after the codebase has been inspected and a recommended approach has been selected.
version: 1.0
fragment_type: question
domain: codebase
---
# Fragment: Clarify Shared Decisions

Asks only the remaining high-impact questions that still matter after the codebase has been inspected and a recommended approach has been selected.

## Question
Review the recommended approach and answer only the remaining decision-shaping questions that still matter for the plan.

## Guidelines

- Ask this only after `fragment-select-solution` has produced a recommendation.
- Keep the question set small and focused.
- Ground every question in repo evidence from Context.
- Phrase questions comparatively when possible.
- Explain why each answer would materially change scope, UX, or implementation shape.
- Do not reopen broad exploration or ask where the feature should live unless Context still leaves multiple viable placements.

## Capture

- `shared_decision_answers`: the user's answers to the remaining high-impact tradeoffs
- `updated_recommendation_constraints`: any new constraints introduced by those answers
