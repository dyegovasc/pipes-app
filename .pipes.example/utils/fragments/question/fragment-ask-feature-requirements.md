---
title: Ask Feature Requirements
description: Gathers the feature description, requirements, and success criteria from the user.
version: 1.1
fragment_type: question
domain: codebase
---
# Fragment: Ask Feature Requirements

Gathers the feature description, requirements, and success criteria from the user.

## Question
Please describe the feature you want to implement.

## Guidelines
- Describe what the feature should do (not how to implement it)
- Focus on user-visible behavior and outcomes, not where the feature should live in the app
- List any explicit requirements or constraints
- Define what "done" looks like — measurable success criteria
- Note anything that should stay out of scope for the first version
- If you already know a hard product constraint, include it; otherwise placement and architecture decisions will be evaluated later from the codebase

## Capture
- `feature_description`: what the feature does
- `requirements`: list of functional and non-functional requirements
- `success_criteria`: testable conditions that define completion
- `non_goals`: explicitly out-of-scope items for this planning pass
- `open_items`: unresolved questions or preferences mentioned by the user

## Validation
- Feature description must be at least one clear sentence
- At least one success criterion must be defined
