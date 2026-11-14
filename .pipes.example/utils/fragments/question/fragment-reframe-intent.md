---
title: Reframe Intent
description: Presents a compact framing package so the user can confirm product intent, scope, and success before downstream work.
version: 1.2
fragment_type: question
domain: all
---
# Fragment: Reframe Intent

## Format

Present one compact package:

- Outcome and affected users
- Requirements and measurable success criteria
- In-scope and out-of-scope boundaries
- Constraints and protected areas
- User-owned decisions resolved in framing
- Repository questions and shared decisions deferred to later phases

Do not add implementation placement or architecture guesses that the codebase has not yet supported.

## Question
Do you approve this framing as the basis for the next phase? If not, what needs to change?

## Options
- correct: "Correct"
- needs_adjustment: "Needs adjustment"

## Capture

- `confirmation_status`: whether the framing was approved or needs adjustment
- `corrections`: requested changes
- `confirmed_outcome`: approved outcome and users
- `confirmed_requirements`: approved requirements and success criteria
- `confirmed_scope`: approved in-scope, out-of-scope, and protected boundaries
- `deferred_items`: repo-owned or shared items intentionally carried forward

## If Correct
Treat the confirmation as approval of this framing package and proceed to the pipeline's configured next phase. Do not ask a duplicate phase-approval question.

## If Needs Adjustment
Apply the corrections and present the complete revised framing package again.
