---
title: Classify Service Guidance
description: Classifies every statement in a service repository's agent docs against the Pipes policies and decisions, so nothing service-specific is lost.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Classify Service Guidance

## Instructions

1. Read the service repository's `AGENTS.md`, `CLAUDE.md`, `SECURITY.md`, `PERSISTENCE.md`, and `ARCHITECTURE.md` when they exist, read-only. Note the files that are missing.
2. Split the agent docs (`AGENTS.md` and `CLAUDE.md`) into statements: one rule, command, fact, or pointer each. Record each statement's file and line.
3. Classify every statement as exactly one of:
   - `org-policy`: the same rule is in a Pipes policy rule (a rule with `skill: true` in `.pipes/utils/rules/`) or another Pipes rule; name the rule.
   - `service-specific`: true only for this service, such as its purpose, model, ports, profiles, special commands, or design constraints; keep it.
   - `conflict`: one side of an open cross-repository policy conflict that the project records in `.pipes/project/00-notes/`; keep it, mark the conflict id, and do not resolve it here.
   - `stale`: a wrong path, an obsolete reference, or a fact the repository contradicts, such as a pointer to a file or workspace that no longer exists.
   - `contradicts-decision`: against an accepted decision in `.pipes/project/05-decisions/`, such as a commit convention that an accepted decision forbids; name the decision.
   - `duplicate`: the same statement repeated in both `AGENTS.md` and `CLAUDE.md`; keep one copy.
4. Treat a statement as `org-policy` only when the Pipes rule says the same thing. When the service states a stricter or more specific version, classify it as `service-specific`.
5. When a statement claims a tool enforces it, verify the claim in the tool's configuration, such as the repository's linter, formatter, or build configuration, and record whether it is enforced or only a convention.
6. When a Pipes rule applies only under a condition, such as a global catalog, the fact that the service meets the condition is `service-specific`; keep it.
7. Check that every statement has a class and that every removed statement (`org-policy`, `stale`, `contradicts-decision`, `duplicate`) names its rule, reason, or decision.

## Output

- Classification table: file, line, statement summary, class, and rule, conflict id, decision, or reason
- Counts per class
- Missing files and the service facts the drafts must keep
