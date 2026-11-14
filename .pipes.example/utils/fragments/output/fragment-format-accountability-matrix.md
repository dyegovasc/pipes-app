---
title: Format Accountability Matrix
description: Formats the accountability matrix that maps each delivery gate to the human role that decides it and where the holder is resolved.
version: 1.1
fragment_type: output
domain: project
---
# Fragment: Format Accountability Matrix

## Format

Produce `.pipes/ai-instructions/accountability.md`. It is part of the project identity and is assembled as a reference. Name human roles, never personas or agents. Name people or teams only in the holder column and only when the user gave them; otherwise resolve the holder to its source, such as `CODEOWNERS`, or to the session user. Environment autonomy belongs in `delivery.md`; this file only points to it.

## Template

```markdown
---
title: Accountability Matrix
description: Human roles that decide each delivery gate, where each holder is resolved, and separation of duties.
version: 1.0
assembly: reference
---
# Accountability Matrix

This file is part of the project identity. It has project-identity precedence even though it is assembled as a reference.

Pipes `team/` roles are AI personas and never approve. Each gate below belongs to a human role. Where no holder is resolved, the person running the session holds the role.

| Gate | Decision | Deciding human role | Holder resolved by |
| --- | --- | --- | --- |
| G1 Intent | Accept or reject an intent in `01-intents/` | Product owner | {source or session user} |
| G2 Spec | Accept a spec in `02-specs/`; higher risk adds the tech lead | Product owner, tech lead | {source or session user} |
| G3 Plan | Approve a plan in `04-plans/` and its execution | Engineer; higher risk: tech lead or architect | {source or session user} |
| G4 Pull request | Approve and merge a change | Code owner | {CODEOWNERS and branch protection, or session user} |
| G5 Release | Release or promote to an `ask` or `ticket` environment in `delivery.md` | Release approver | {environment reviewers, change ticket approver, or session user} |
| G6 Agent configuration | Change `.pipes/` (except project records in `.pipes/project/`), generated instructions, skills, hooks, or evals | Code owner; policy owner for policy rules | {source or session user} |
| G7 Triage | Fix now, schedule, or dismiss an incident or monitoring finding | Service owner or on-call | {source or session user} |

Separation of duties: the session or agent that authored an intent, spec, plan, or diff never records its own approval. When one person holds several roles, a fresh-context `reviewer` pass is required before that person decides.

Autonomy by environment is defined in `.pipes/ai-instructions/delivery.md`; gate G5 applies to every `ask` and `ticket` environment there.
```
