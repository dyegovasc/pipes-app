---
title: Validate Loop Contract
description: Verifies that a proposed loop is distinct, adaptive, readable, resolvable, and safe.
version: 2.2
fragment_type: validation
domain: all
---
# Fragment: Validate Loop Contract

## Checks

- [ ] The mission class requires evidence-driven action selection.
- [ ] No existing loop already covers the same dominant need.
- [ ] Frontmatter is concise and references existing roles, fragments, rules, and pipelines.
- [ ] The body includes Use When, Operating Envelope, Roles, Cycle, Mission Integration, Available Pipelines, Validation, Stop Conditions, and Mission Prompt.
- [ ] Each cycle phase points to atomic fragments.
- [ ] Mission Integration keeps `loop` as the sole mission-to-loop reference, distinguishes phase from status, names the shared phase vocabulary, and declares any specialized phase or `none`.
- [ ] Mission Integration requires recorded terminal missions to use the existing outcome capture, format, and write fragments after validation and reflection but before `done`.
- [ ] Terminal closure checks for an existing related outcome, requires exactly one approved and validated outcome with both links, keeps resumable missions open, and excludes lightweight runs without a mission.
- [ ] The closure package distinguishes approved direct related-record writes from expected Pipes Local reciprocal relationship and sync-state effects.
- [ ] User-owned and protected actions are explicit.
- [ ] The loop continues through routine progress and validation.
- [ ] Stop conditions are limited to completion, user decision, blocker, or protected action.
- [ ] The loop requires no executable runner.
- [ ] Catalog, mapping, and loop-skill impacts are known.

## Acceptance Criteria

- [ ] All references resolve.
- [ ] The loop is meaningfully distinct and readable.
- [ ] Its generated skill can stay small and point to canonical Markdown.
- [ ] No blocking structural or authority ambiguity remains.
