---
title: Ask Project Context
description: Resolves only project identity and ownership choices that repository evidence cannot establish.
version: 1.1
fragment_type: question
domain: codebase
---
# Fragment: Ask Project Context

## Question

After presenting the project identity already supported by repository evidence, ask: Which remaining name, intended outcome, repository role, or ownership boundary must the canonical project instruction establish?

Ask one narrower follow-up only when two materially different user-owned interpretations remain. Do not ask the user to repeat facts already available from manifests, package metadata, documentation, source layout, commands, or an existing project instruction.

## Guidance

- Inspect repository evidence before asking anything.
- Classify each candidate fact as `observed`, `user_confirmed`, `conflicting`, or `unresolved`.
- Treat project name, current type, languages, runtimes, and repository layout as discoverable unless the evidence is absent or contradictory.
- Ask for intent when evidence cannot determine the product outcome, preferred boundary, future direction, or which of several real roles is primary.
- Present a recommendation with the evidence when confirmation is necessary.
- Keep deep system architecture and enforceable conventions in their owning surfaces.

## Capture

- `observed_project_identity`: evidence-backed name, type, languages, and runtimes
- `observed_repository_role`: current ownership and neighboring systems
- `evidence_sources`: exact files or commands supporting the observations
- `user_confirmed_choices`: only identity or boundary choices supplied by authority
- `conflicts`: contradictory sources or current-versus-intended differences
- `unresolved_identity`: material questions that still block drafting
