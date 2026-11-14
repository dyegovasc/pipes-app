---
title: Analyze Codebase Context
description: Scans the codebase to understand its structure and identify modules relevant to the feature being planned.
version: "1.2"
fragment_type: instruction
domain: codebase
---
Scans the codebase to understand its structure and identify modules relevant to the feature being planned.

## Instructions

1. **Read directory structure** — list top-level and second-level directories to understand project layout
2. **Identify entry points** — locate main application entry files
3. **Use deferred repo questions as search lenses** — if Phase 1 produced `deferred_repo_questions`, investigate those from the codebase before considering user follow-up
4. **Find relevant modules** — based on the feature description, identify directories and files likely to be involved
5. **Note patterns** — observe naming conventions, file organisation, UX conventions, and any consistent patterns
6. **Complement the baseline** — if `stack_baseline` from `fragment-read-project-instruction` exists, use it to guide where to look; do not re-ask what is already known
7. **Resolve repo-owned unknowns where possible** — note which deferred questions the codebase answers directly and which still remain unresolved
8. **Summarise findings** — present a concise overview of what is relevant to this feature, including concrete evidence to cite later in Design

## Output

- `codebase_structure`: top-level directory overview
- `relevant_modules`: list of files/directories relevant to the feature
- `observed_patterns`: naming conventions and organisation patterns noted
- `resolved_repo_questions`: list of deferred repo questions answered by the codebase
- `unresolved_repo_questions`: list of repo questions still unanswered after investigation
- `context_evidence`: concise list of concrete findings that later phases can cite when comparing approaches