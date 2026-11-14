---
title: Capture Intent Source
description: Captures the problem, proposed outcome, success checks, and origin needed to draft an intent record.
version: 1.1
fragment_type: question
domain: project
---
# Fragment: Capture Intent Source

Captures the problem, proposed outcome, success checks, and origin needed to draft an intent record.

## Question
What problem should be solved, for whom, and where did it come from?

## Guidelines
- Start from the source: a person's idea, a Jira ticket, or an incident or monitoring finding
- When a Jira key is given and an Atlassian connector is available, read the ticket instead of asking for its content
- When an incident is the source, read its evidence and outcome records instead of asking for them
- Describe the problem, not a solution
- Capture up to 5 known observable checks that would show the outcome is reached, and aim for 2 to 5; they are proto acceptance criteria, not final requirements
- When the source does not state how success is checked, record the missing check as an open question instead of inventing one
- Name the affected users and the affected services by repository name
- State known constraints: business, regulatory, contractual, technical, or schedule
- List what is still unknown as open questions instead of guessing

## Capture
- `problem`
- `proposed_outcome`
- `success_checks`
- `affected_users`
- `affected_services`
- `constraints`
- `open_questions`
- `origin`
- `author`
- `preferred_slug`

## Validation
- The problem and the proposed outcome are each at least one clear sentence
- Each success check is observable, and there are at most 5 known checks; an unknown check is an open question instead
- The origin is an idea, a Jira key, or an incident reference
- Every affected service names an existing repository or is listed as an open question
