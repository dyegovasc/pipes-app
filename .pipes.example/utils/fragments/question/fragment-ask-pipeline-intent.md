---
title: Ask Pipeline Intent
description: Captures the deterministic outcome, users, boundaries, phases, gates, and evidence a new pipeline must govern.
version: 1.3
fragment_type: question
domain: all
---
# Fragment: Ask Pipeline Intent

## Question

What repeatable outcome should this pipeline produce, which choices or effects must remain protected, and what evidence will show the workflow is complete?

Ask one narrower follow-up only when a missing answer changes phase order, authority, persistence, or validation. Discover repository-owned facts and the current framework inventory instead of asking the user to supply them.

## Guidance

- Identify triggers, users, inputs, outputs, non-goals, failure behavior, and how interrupted work resumes.
- Select the current category that best fits: `creation`, `definition`, `planning`, `orchestration`, `delivery`, or `record`.
- Classify the pipeline as `delivery` when it coordinates implementation roles; otherwise use `non-delivery` while still assigning one acting role per phase.
- Name the primary owner and bounded participants for delivery work.
- Capture the deterministic phase order, accountable actors, fixed support members, dynamic-role resolution conditions, concrete member handoffs, non-member terminal or branch routing, approval gates, protected actions, persistence effects, and validation evidence.
- Use a loop instead when the next action must remain adaptive.

## Capture

- Outcome, triggers, users, domain, category, and pipeline mode
- Inputs, outputs, persistence targets, and non-goals
- Ordered phase outline with accountable actors, fixed support, member handoffs, and non-member routing
- Approval gates, protected effects, failure behavior, and resumption boundary
- Primary owner and participants when delivery-oriented
- Completion evidence, validation surfaces, and constraints
