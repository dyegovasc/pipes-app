---
title: Capture Decision Candidate
description: Captures the core fields needed to define a durable decision record.
version: 1.1
fragment_type: question
domain: project
---
# Fragment: Capture Decision Candidate

Captures the core fields needed to define a durable decision record.

## Question
What decision should be recorded?

## Guidelines
- State the decision in clear, durable terms
- Explain why the decision was needed
- Name the affected surfaces, repos, or workflows
- Note the main alternatives that were considered
- State the intended status: `proposed`, `accepted`, or `superseded`
- If an older record is being replaced, mention it
- If you already have a preferred short slug, include it

## Capture
- `decision_statement`
- `decision_context`
- `why_needed`
- `affected_surfaces`
- `alternatives_considered`
- `intended_state`
- `supersedes_record`
- `preferred_slug`
- `follow_up_actions`

## Validation
- Decision statement must be at least one clear sentence
- Intended state must be one of: `proposed`, `accepted`, `superseded`
