---
title: Classify Feature Unknowns
description: Classifies unresolved items from feature framing so the pipeline asks the user only for what they own and defers repo-specific questions to later phases.
version: 1.0
fragment_type: instruction
domain: codebase
---
# Fragment: Classify Feature Unknowns

Classifies unresolved items from feature framing so the pipeline asks the user only for what they own and defers repo-specific questions to later phases.

## Instructions

1. **Review captured framing data** — inspect the feature description, requirements, success criteria, non-goals, and any open items
2. **Classify each unresolved item** into one of four buckets:
   - `user_owned` — the user must answer
   - `repo_owned` — the codebase should answer during Context
   - `agent_owned` — the model should propose a default later
   - `shared_decision` — a high-impact tradeoff that may still need user input after Context
3. **Keep Framing narrow** — do not ask repo-specific or architecture-placement questions in this step
4. **Defer repo-owned items** — record them as `deferred_repo_questions` for Phase 2
5. **Defer shared decisions** — record them as `deferred_shared_decisions` for Phase 3 if they remain unresolved after a recommendation is made
6. **Record agent defaults** — note which decisions the model should recommend later instead of asking immediately

## Output

- `user_owned_questions`: list of user-owned open items
- `deferred_repo_questions`: list of repo-owned questions to resolve in Context
- `agent_owned_defaults`: list of decisions the model should recommend later
- `deferred_shared_decisions`: list of high-impact tradeoffs to revisit only if Context does not settle them
