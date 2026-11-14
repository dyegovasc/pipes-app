---
title: Ask Stack Details
description: Resolves only intended stack and convention choices that remain after repository inspection.
version: 1.1
fragment_type: question
domain: codebase
---
# Fragment: Ask Stack Details

## Question

Present the detected runtimes, frameworks, commands, tests, infrastructure, architecture patterns, and established conventions with their sources. Ask: Which unresolved convention or intended technical direction should govern work when the repository does not already provide one clear answer?

Do not ask for a general stack inventory. Ask one focused question at a time only when the answer changes a binding convention, repository boundary, or declared future direction.

## Guidance

- Derive current technologies and versions from manifests, lockfiles, build files, configuration, imports, and executable commands.
- Derive established practices from tests, linters, formatters, local guidance, repeated source patterns, and existing rules.
- Separate observed behavior from desired future behavior.
- Treat contradictory patterns as evidence to explain, not permission to choose a convention silently.
- Recommend a concrete convention when the user must choose and name the tradeoff.
- Keep system-wide component and data design in `architecture.md`.

## Capture

- `observed_stack`: evidence-backed runtimes, frameworks, libraries, and versions
- `observed_commands`: build, test, lint, format, run, and generation commands
- `observed_infrastructure`: storage, deployment, and external technical dependencies
- `observed_conventions`: repeated or explicitly documented implementation rules
- `evidence_sources`: files and commands supporting each important claim
- `user_confirmed_conventions`: binding choices unavailable from repository evidence
- `intended_changes`: future direction kept distinct from current facts
- `unresolved_stack_items`: material contradictions or choices that block drafting
