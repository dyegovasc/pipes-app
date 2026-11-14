---
title: Format Service Agents Guide
description: Formats a tool-neutral, about one-page AGENTS.md for a backend service repository that keeps only service-specific guidance and points to the org policies.
version: 1.1
fragment_type: output
domain: codebase
---
# Fragment: Format Service Agents Guide

## Format

Produce `AGENTS.md` for the root of one backend service repository, in English and about one page. It is the tool-neutral guide that every agent tool reads; `CLAUDE.md` only imports it. Keep every `service-specific` and `conflict` statement from the classification, and replace `org-policy` statements with one pointer to the org policies. Agents normally start in the orchestration repository root, where the Pipes instructions and policies are always loaded; this file adds what is true only for this service.

List each command with what healthy output looks like, so an agent can tell success from failure. Keep "Things agents get wrong" to mistakes seen in this service; org-wide mistakes belong in the Pipes policies.

## Template

```markdown
# AGENTS.md: {service}

{one or two sentences: what this service owns, who calls it, and its main store}

## Org Policies

This service follows the org policies in the orchestration repository: {policy rules with `skill: true` in `.pipes/utils/rules/`, by file name}. Delivery runs through the intent, spec, plan, review, and release chain in `.pipes/project/`. Commits and pull requests follow `rule-commit-guardrails`.

## Commands

| Command | Healthy output |
| --- | --- |
| {build and verify command from `.pipes/ai-instructions/delivery.md`} | {healthy output from the delivery profile} |
| {service-specific command} | {what success looks like} |

## Service Rules

- {service-specific rule, with its reason}

## Open Conflicts

- {statement kept while recorded conflict {id} is undecided, or none}

## Things Agents Get Wrong Here

- {service-specific mistake and the correct action, or none}

## More

- Architecture: `ARCHITECTURE.md`
- Review guide: `REVIEW.md`
```
